---
title: 'CS324-A1 Distributed Job-Processing System — Report'
description: 'A Java RMI cluster that runs data-parallel jobs across a peer-to-peer worker overlay, with on-demand leader election and term rotation.'
pubDate: 2026-09-28
author: 'Rohan Nandan'
image: 'cover-cs324-a1-distributed-job-processing-system.webp'
tags: ['Distributed Systems', 'Java']
slug: cs324-a1-distributed-job-processing-system
---

For CS324 Assignment 1 I built a Java 17 + Maven + Java RMI cluster that runs data-parallel jobs across an unstructured peer-to-peer worker overlay under an elected coordinator. This post is the system report: how the pieces fit together, followed by answers to the four assignment questions on bootstrapping, centralisation, message suppression, and thread safety.

## System Overview

| Component | File | Role |
|---|---|---|
| `BootstrapNode` | `bootstrap/BootstrapNode.java` | Directory / rendezvous service on the RMI registry, default port `1099`. |
| `WorkerNode` | `worker/WorkerNode.java` | Peer, compute server, election participant, and when elected, coordinator/scheduler. |
| `WorkerInterface` / `BootstrapInterface` | `common/` | RMI contracts. |
| `JobRequest` / `WorkUnit` / `WorkResult` / `Candidate` / `ComputeOperation` | `common/` | Immutable serializable job model. |
| `ComputeEngine` / `WorkPartitioner` / `ResultAggregator` | `compute/` | Pure computation, splitting, combining. |
| `ClientApp` / `ClientService` / `JobParser` | `client/` | Swing GUI, thin RMI facade, CSV/manual parsing. |

### Startup and Overlay Formation

1. `BootstrapNode.main` creates or locates the RMI `Registry` and rebinds `"BootstrapNode"`.
2. Each `WorkerNode(id, host, port)` binds as `Worker-<id>`, looks up the bootstrap node, and calls `registerWorker(id, rmiAddress)`, which rejects duplicate IDs, picks a random existing worker address via `ThreadLocalRandom` as the join peer, and stores the mapping in a `ConcurrentHashMap<Integer, String>` of active workers.
3. The new worker looks up that peer and creates a bilateral neighbour link (`addNeighbor` both ways). The result is a random unstructured graph held in a `CopyOnWriteArrayList<WorkerInterface>` of neighbours.
4. Workers stay alive via `Thread.currentThread().join()`. Election is lazy — it only happens on the first `submitJob`. A shutdown hook deregisters the worker.

### Job Lifecycle

The supported `ComputeOperation` values are `MAX(list)`, `PRIMECOUNT(list)`, and `PRIMESUM(start, end)`.

1. The client sets host, port, and client ID. A poll timer shows the live worker count via `bootstrap.getActiveWorkers()`.
2. The user enters `2,4,5,11` or loads a CSV (`data/numbers-sm/md/lg.csv`). `JobParser` handles list versus `start,end` input, headers, and `;`, `,`, and whitespace separators.
3. `JobRequest` validates immutably: `MAX` needs a non-empty list, `PRIMECOUNT` allows empty (returns `0`), `PRIMESUM` requires `start<=end`.
4. `ClientService.submit` fetches addresses, resolves stubs, sorts coordinators first, and tries each in order with failover to the next worker on `RemoteException`.
5. Any `WorkerNode.submitJob` that is not the coordinator calls `forwardJobToCoordinator` — and if its `coordinatorRef` is not live, it runs `initiateElection()` first, then forwards.
6. The coordinator's `executeDistributedJob` admits the top-level job (incrementing the JAC and term counters), discovers active workers through `bootstrap.getActiveWorkers()` plus `Naming.lookup` sorted by ID in a `TreeMap`, partitions with `WorkPartitioner.partition(request, N)` into balanced contiguous splits (`min(N, size)`, remainder distributed one-extra to the first partitions; range jobs split by arithmetic sub-ranges), fans out one `WorkUnit` per worker via a dispatch executor with blocking `future.get()`, then aggregates with `ResultAggregator.aggregate` (validating job, operation, and partition IDs, rejecting duplicates and missing pieces; `MAX` takes the max, `PRIMESUM`/`PRIMECOUNT` sum exactly). After the fifth job of a term finishes, a re-election is triggered.

`ComputeEngine` itself is straightforward: linear `max`, trial-division `isPrime` (`divisor <= n / divisor`), plus `primeSum` and `primeCount` built on top.

### Leader Election

Election is flooding + convergecast (echo) over the neighbour graph, triggered on demand and on term expiry:

- Election IDs look like `ELECTION-<initiator>-<seq>`; coordinator announcements look like `COORDINATOR-<electionId>`.
- `propagateElection(id, sender)` floods depth-first to all neighbours except the sender, each subtree returning its best `Candidate` up the recursion.
- `Candidate.isBetterThan` implements the rule: lowest JAC wins, ties broken by highest worker ID.
- The initiator collects the child bests, picks the winner, carries the winner's RMI stub inside the `Candidate` to avoid a lookup, installs the state locally, then floods the decision with `propagateCoordinator`.
- Terms are capped at `MAX_JOBS_PER_TERM = 5`. The `jac` counter is an `AtomicInteger` incremented per coordinator admission, and `jobsInCurrentTerm`, `termClosing`, `termTransitionStarted`, `inFlightJobs`, and `coordinatorTermSequence` together enforce a single coordinator per term. The fifth admission sets `termClosing = true`; once in-flight jobs drain to zero the node steps down and triggers `initiateElection` exactly once.
- A live-coordinator guard in `initiateElection` aborts if `coordinatorRef.isCoordinator()` is still true.

## Question Answers

### Q1. Importance of the Bootstrap Node, and Implementation Without It

The bootstrap node matters in three ways:

1. **Rendezvous for unstructured join.** A new node knows only the bootstrap's `host:port`. The bootstrap returns a random live member so the joiner can attach to the graph without any global configuration.
2. **Unique identity and membership directory.** The synchronized `registerWorker` enforces unique integer IDs, stores `id → rmiAddress`, deregisters on shutdown, and serves `getActiveWorkers` snapshots.
3. **Discovery for clients and coordinators.** Both `ClientService.activeWorkerAddresses` and `WorkerNode.discoverActiveWorkers` depend on `bootstrap.getActiveWorkers()` to resolve stubs and to size partitioning — the worker count determines the partition count. The client prefers a live coordinator but otherwise does not track leadership itself.

Without a bootstrap, any peer-discovery mechanism works in its place:

- **Static configuration:** ship a peer list or config file; the joiner tries known `Worker-X` names sequentially.
- **Multicast discovery:** UDP multicast or mDNS/Bonjour announcements and queries on the LAN.
- **Gossip / seed nodes:** hardcode one or more well-known seeds; membership propagates epidemically as new nodes exchange neighbour lists.
- **Structured overlay:** Chord or Kademlia for deterministic lookup instead of random attachment.
- **External registry:** DNS-SRV, etcd/ZooKeeper, or RMI registry scanning.

The trade-off is the same everywhere: every alternative removes the single well-known address but adds complexity, network assumptions, or still needs at least one known seed.

### Q2. Does the Bootstrap Make the System Centralised?

No. The system is decentralised with a centralised directory bootstrap — a hybrid, not centralised control:

- **It is never on the data or control hot path.** After registration, job submission, partitioning, `executeWorkUnit`, election flooding, and `COORDINATOR` floods are all worker-to-worker RMI over neighbour stubs. The bootstrap never computes, aggregates, elects, or forwards jobs.
- **It holds no coordinator role.** Leadership, JAC accounting, and term rotation are fully peer-executed: any worker can initiate an election and any worker can become coordinator.
- **Failures are isolated.** If the bootstrap crashes after formation, in-flight jobs and elections among already-connected neighbours continue. Only new joins, client bootstrap queries, and coordinator `discoverActiveWorkers` snapshots degrade — a membership-availability loss, not a compute or coordination single point.

The honest caveat: it is a logically centralised membership SPOF (sharing a host with the RMI registry). That can be mitigated by replicating the directory, caching membership and gossiping neighbour lists, or letting the coordinator fall back to neighbour-graph traversal when the bootstrap is unreachable.

### Q3. Duplicate Election-Message Suppression, and Why It Is Required

Suppression is implemented in `WorkerNode` with two seen-sets:

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

The initiator pre-adds its own election and coordinator IDs before flooding, so its own echo is ignored. `Candidate.betterOf(best, null) = best` makes duplicate null returns harmless to the convergecast. An `electionLock` serialises concurrent local initiations, and sender-exclusion prevents immediate ping-pong.

Suppression is required because the network is unstructured: random bilateral links inevitably create cycles and multiple paths between nodes. Without it, a single election message would circulate forever, arrive many times at each node, cause a message storm, recurse until stack overflow, double-count subtrees, and produce inconsistent `best` returns — and `COORDINATOR` messages would loop and flap the coordinator ID. Suppression turns the flood into a spanning-tree traversal: each node expands once per election ID, which guarantees termination, exactly-once contribution to the convergecast, and eventual agreement on a single coordinator.

### Q4. Threads and Thread-Safety

Threads in use:

- **Worker:** a fixed pool of 4 in `computeExecutor` running `computeWorkUnit` via `submit(...).get()` inside `executeWorkUnit`; a fixed pool of 4 in `dispatchExecutor` for parallel remote fan-out in `executeDistributedJob`; RMI runtime threads serving concurrent `submitJob` / `propagateElection` / `propagateCoordinator` / `executeWorkUnit` callbacks; a shutdown-hook thread for deregistration and executor shutdown; the main thread parked on `join`.
- **Bootstrap:** RMI dispatch threads serving concurrent register, deregister, and get calls.
- **Client:** a fixed pool of 8 for submits plus worker-count polling, one `SwingWorker` per job to keep the EDT responsive, a 2-second poll timer, and the EDT itself for table updates via `invokeLater`.

Safety mechanisms, with examples:

1. **Lock-free concurrent collections.** `ConcurrentHashMap` for active workers, `newKeySet()` for the seen election/coordinator IDs, `CopyOnWriteArrayList` for neighbours — safe to iterate during a flood while `addNeighbor` mutates. `getActiveWorkers` returns a defensive copy.
2. **Atomics and volatiles.** `AtomicInteger` for JAC and jobs-in-term, `AtomicLong` for the election sequence, client-side `AtomicInteger` job counters; `volatile` for the coordinator flag, ID, and reference so leadership is visible without locking.
3. **Explicit locks.** `synchronized` register/deregister for check-then-act unique-ID enforcement; one `electionLock` so a node runs a single election at a time with the alive-coordinator check done atomically; a `termStateLock` guarding the term flags and counters across admission, completion, and coordinator installation. Lock ordering is consistent (`electionLock` before `termStateLock`, never reversed), and blocking `future.get()` or remote calls are never held inside the term lock except for short state mutation, which avoids deadlock.
4. **Immutability.** `JobRequest`, `WorkUnit`, and `WorkResult` are records with `List.copyOf`; the partitioner and worker-list helpers return copies — all freely shared across threads and RMI boundaries.
5. **Executor hygiene.** Bounded named pools, `RejectedExecutionException` converted to `RemoteException`, dispatch cancellation with `future.cancel(true)` plus interrupt-status restore, and orderly `shutdown()` / `awaitTermination(5s)` / `shutdownNow()` sequencing.

## Conclusion

The bootstrap keeps the system joinable and discoverable without ever touching a job; flooding with duplicate suppression keeps elections correct on a cyclic overlay; and the combination of lock-free structures, atomics, a strict lock order, and immutable messages keeps the concurrency tractable. The single deliberate compromise is the centralised membership directory — cheap to build, easy to reason about, and the obvious next thing to replicate.
