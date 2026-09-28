---
title: 'Building a Distributed Job System with Java RMI: Peer Discovery, Leader Election, and Thread Safety'
description: 'How our team of four built a Java RMI cluster that discovers peers, elects a coordinator, and runs data-parallel jobs safely across threads.'
pubDate: 2026-09-28
author: 'Rohan Nandan'
image: 'cover-cs324-a1-distributed-job-processing-system.webp'
tags: ['Distributed Systems', 'Java']
slug: cs324-a1-distributed-job-processing-system
---

For CS324 Assignment 1, our group of four built a Java 17 + Maven + Java RMI cluster that runs data-parallel jobs across an unstructured peer-to-peer worker overlay under an elected coordinator. Looking back, the project had a natural question order: workers had to find each other first, which forced us to justify the bootstrap, which raised the centralisation question, which left jobs needing a scheduler, which needed an election, which needed message suppression, which needed thread safety. This post follows that order, with the reasoning we used at each step.

## The Pieces

| Component | File | Role |
|---|---|---|
| `BootstrapNode` | `bootstrap/BootstrapNode.java` | Directory / rendezvous service on the RMI registry, default port `1099`. |
| `WorkerNode` | `worker/WorkerNode.java` | Peer, compute server, election participant, and when elected, coordinator/scheduler. |
| `WorkerInterface` / `BootstrapInterface` | `common/` | RMI contracts. |
| `JobRequest` / `WorkUnit` / `WorkResult` / `Candidate` / `ComputeOperation` | `common/` | Immutable serializable job model. |
| `ComputeEngine` / `WorkPartitioner` / `ResultAggregator` | `compute/` | Pure computation, splitting, combining. |
| `ClientApp` / `ClientService` / `JobParser` | `client/` | Swing GUI, thin RMI facade, CSV/manual parsing. |

## Joining the Network

The first problem we hit was the oldest one in peer-to-peer systems: a new worker knows nothing except one address. We gave it the bootstrap node, and joining worked like this:

1. `BootstrapNode.main` creates or locates the RMI `Registry` and rebinds `"BootstrapNode"`.
2. Each `WorkerNode(id, host, port)` binds as `Worker-<id>`, looks up the bootstrap node, and calls `registerWorker(id, rmiAddress)`, which rejects duplicate IDs, picks a random existing worker address via `ThreadLocalRandom` as the join peer, and stores the mapping in a `ConcurrentHashMap<Integer, String>` of active workers.
3. The new worker looks up that peer and creates a bilateral neighbour link (`addNeighbor` both ways). The result is a random unstructured graph held in a `CopyOnWriteArrayList<WorkerInterface>` of neighbours.
4. Workers stay alive via `Thread.currentThread().join()`. We made election lazy — it only happens on the first `submitJob` — so a cluster can form with no coordination traffic at all. A shutdown hook deregisters the worker.

We kept coming back to why a bootstrap was needed at all, and the answer settled into three roles. It is the **rendezvous for unstructured join**: the joiner attaches to the graph without any global configuration. It is the **unique-identity and membership directory**: synchronized registration enforces unique integer IDs, deregisters on shutdown, and serves snapshots. And it is the **discovery service for clients and coordinators**: both `ClientService.activeWorkerAddresses` and `WorkerNode.discoverActiveWorkers` depend on `bootstrap.getActiveWorkers()` to resolve stubs and to size partitioning — the worker count determines the partition count, and the client prefers a live coordinator without tracking leadership itself.

We also considered what would replace it. Any peer-discovery mechanism works: a static peer list or config file tried sequentially, UDP multicast or mDNS announcements on the LAN, gossip from hardcoded seed nodes with epidemic neighbour-list exchange, a structured overlay like Chord or Kademlia for deterministic lookup, or an external registry such as DNS-SRV, etcd, or RMI registry scanning. The trade-off is the same everywhere: every alternative removes the single well-known address but adds complexity, network assumptions, or still needs at least one known seed. For an assignment cluster, the bootstrap was the right call.

## Centralised?

A bootstrap that everything registers with sounds centralised, and our marker would absolutely ask, so we settled this early: the system is decentralised with a centralised directory bootstrap — a hybrid, not centralised control.

The bootstrap is never on the data or control hot path. After registration, job submission, partitioning, `executeWorkUnit`, election flooding, and `COORDINATOR` floods are all worker-to-worker RMI over neighbour stubs. The bootstrap never computes, aggregates, elects, or forwards jobs. It holds no coordinator role either: leadership, JAC accounting, and term rotation are fully peer-executed, and any worker can initiate an election or become coordinator. And failures are isolated — if the bootstrap crashes after formation, in-flight jobs and elections among already-connected neighbours continue. Only new joins, client bootstrap queries, and coordinator `discoverActiveWorkers` snapshots degrade: a membership-availability loss, not a compute or coordination single point.

The honest caveat, which we flagged in our report, is that it is a logically centralised membership SPOF sharing a host with the RMI registry. Given more time we would have replicated the directory, cached membership and gossiped neighbour lists, or let the coordinator fall back to neighbour-graph traversal when the bootstrap is unreachable.

## Running a Job

With workers connected and the directory question settled, we wired up the end-to-end job path. The supported `ComputeOperation` values are `MAX(list)`, `PRIMECOUNT(list)`, and `PRIMESUM(start, end)`.

1. The client sets host, port, and client ID. A poll timer shows the live worker count via `bootstrap.getActiveWorkers()`.
2. The user enters `2,4,5,11` or loads a CSV (`data/numbers-sm/md/lg.csv`). `JobParser` handles list versus `start,end` input, headers, and `;`, `,`, and whitespace separators.
3. `JobRequest` validates immutably: `MAX` needs a non-empty list, `PRIMECOUNT` allows empty (returns `0`), `PRIMESUM` requires `start<=end`.
4. `ClientService.submit` fetches addresses, resolves stubs, sorts coordinators first, and tries each in order with failover to the next worker on `RemoteException`.
5. Any `WorkerNode.submitJob` that is not the coordinator calls `forwardJobToCoordinator` — and if its `coordinatorRef` is not live, it runs `initiateElection()` first, then forwards.
6. The coordinator's `executeDistributedJob` admits the top-level job (incrementing the JAC and term counters), discovers active workers through `bootstrap.getActiveWorkers()` plus `Naming.lookup` sorted by ID in a `TreeMap`, partitions with `WorkPartitioner.partition(request, N)` into balanced contiguous splits (`min(N, size)`, remainder distributed one-extra to the first partitions; range jobs split by arithmetic sub-ranges), fans out one `WorkUnit` per worker via a dispatch executor with blocking `future.get()`, then aggregates with `ResultAggregator.aggregate` (validating job, operation, and partition IDs, rejecting duplicates and missing pieces; `MAX` takes the max, `PRIMESUM`/`PRIMECOUNT` sum exactly). After the fifth job of a term finishes, a re-election is triggered.

`ComputeEngine` itself we kept deliberately boring: linear `max`, trial-division `isPrime` (`divisor <= n / divisor`), plus `primeSum` and `primeCount` built on top. The interesting work was never the arithmetic — it was getting the units to the right machines and the answers back.

Step 5 left the next problem staring at us: somebody has to be the coordinator, and there is no central authority to appoint one.

## Electing a Coordinator

We went with flooding + convergecast (echo) over the neighbour graph, triggered on demand and on term expiry. Election IDs look like `ELECTION-<initiator>-<seq>`; coordinator announcements look like `COORDINATOR-<electionId>`. `propagateElection(id, sender)` floods depth-first to all neighbours except the sender, each subtree returning its best `Candidate` up the recursion. `Candidate.isBetterThan` implements the rule we agreed on: lowest JAC wins, ties broken by highest worker ID — least-loaded first, deterministic fallback. The initiator collects the child bests, picks the winner, carries the winner's RMI stub inside the `Candidate` to avoid a lookup, installs the state locally, then floods the decision with `propagateCoordinator`.

We added term rotation because a coordinator elected once would otherwise serve forever, accumulating state and becoming a de-facto single point. Terms are capped at `MAX_JOBS_PER_TERM = 5`. The `jac` counter is an `AtomicInteger` incremented per coordinator admission, and `jobsInCurrentTerm`, `termClosing`, `termTransitionStarted`, `inFlightJobs`, and `coordinatorTermSequence` together enforce a single coordinator per term. The fifth admission sets `termClosing = true`; once in-flight jobs drain to zero the node steps down and triggers `initiateElection` exactly once. A live-coordinator guard in `initiateElection` aborts if `coordinatorRef.isCoordinator()` is still true.

Flooding an unstructured overlay forced the subtlest correctness question of the project: random bilateral links inevitably create cycles and multiple paths, so a naive flood would circulate forever, arrive many times at each node, storm the network, recurse until stack overflow, double-count subtrees, and flap the coordinator ID. Our fix was duplicate suppression with two seen-sets:

```java
seenElectionIds = ConcurrentHashMap.newKeySet();
seenCoordinatorIds = ConcurrentHashMap.newKeySet();

propagateElection(id, sender) {
  if (!seenElectionIds.add(id)) return null; // duplicate
  ... flood to neighbours except sender ...
}

propagateCoordinator(msgId, ...) {
  if (!seenCoordinatorIds.add(msgId)) return; // duplicate
  ... install state, flood except sender ...
}
```

The initiator pre-adds its own election and coordinator IDs before flooding, so its own echo is ignored. `Candidate.betterOf(best, null) = best` makes duplicate null returns harmless to the convergecast. An `electionLock` serialises concurrent local initiations, and sender-exclusion prevents immediate ping-pong. In retrospect this was the highest-value dozen lines in the codebase: suppression turns the flood into a spanning-tree traversal where each node expands once per election ID, which guarantees termination, exactly-once contribution to the convergecast, and eventual agreement on a single coordinator.

## Threads and Shared State

Everything above runs concurrently — remote fan-out, RMI callbacks landing on worker threads, elections firing mid-job — so the last thing we had to get right was the shared state underneath it all.

Threads in use:

- **Worker:** a fixed pool of 4 in `computeExecutor` running `computeWorkUnit` via `submit(...).get()` inside `executeWorkUnit`; a fixed pool of 4 in `dispatchExecutor` for parallel remote fan-out in `executeDistributedJob`; RMI runtime threads serving concurrent `submitJob` / `propagateElection` / `propagateCoordinator` / `executeWorkUnit` callbacks; a shutdown-hook thread for deregistration and executor shutdown; the main thread parked on `join`.
- **Bootstrap:** RMI dispatch threads serving concurrent register, deregister, and get calls.
- **Client:** a fixed pool of 8 for submits plus worker-count polling, one `SwingWorker` per job to keep the EDT responsive, a 2-second poll timer, and the EDT itself for table updates via `invokeLater`.

The safety mechanisms we relied on, with examples:

- **Lock-free concurrent collections.** `ConcurrentHashMap` for active workers, `newKeySet()` for the seen election/coordinator IDs, `CopyOnWriteArrayList` for neighbours — safe to iterate during a flood while `addNeighbor` mutates. `getActiveWorkers` returns a defensive copy.
- **Atomics and volatiles.** `AtomicInteger` for JAC and jobs-in-term, `AtomicLong` for the election sequence, client-side `AtomicInteger` job counters; `volatile` for the coordinator flag, ID, and reference so leadership is visible without locking.
- **Explicit locks.** `synchronized` register/deregister for check-then-act unique-ID enforcement; one `electionLock` so a node runs a single election at a time with the alive-coordinator check done atomically; a `termStateLock` guarding the term flags and counters across admission, completion, and coordinator installation. We kept lock ordering consistent (`electionLock` before `termStateLock`, never reversed), and blocking `future.get()` or remote calls are never held inside the term lock except for short state mutation, which avoids deadlock.
- **Immutability.** `JobRequest`, `WorkUnit`, and `WorkResult` are records with `List.copyOf`; the partitioner and worker-list helpers return copies — all freely shared across threads and RMI boundaries. This decision saved us from an entire class of aliasing bugs.
- **Executor hygiene.** Bounded named pools, `RejectedExecutionException` converted to `RemoteException`, dispatch cancellation with `future.cancel(true)` plus interrupt-status restore, and orderly `shutdown()` / `awaitTermination(5s)` / `shutdownNow()` sequencing.

## Conclusion

Looking back, the architecture reads as a chain of answers: the bootstrap made the system joinable without touching a job; flooding with duplicate suppression made elections correct on a cyclic overlay; term rotation kept any coordinator from becoming permanent; and lock-free structures, atomics, a strict lock order, and immutable messages kept the concurrency tractable. The single deliberate compromise was the centralised membership directory — cheap to build, easy to reason about, and the first thing we would replicate with more time. For a four-person team splitting peer logic, coordination, and client work, the clean module boundaries were what let us integrate without stepping on each other.
