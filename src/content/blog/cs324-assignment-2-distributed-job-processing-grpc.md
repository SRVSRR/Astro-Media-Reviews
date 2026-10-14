---
title: 'Building a Distributed Job System with gRPC: Leader Election, Progress Streaming, and Failure Recovery'
description: 'A retrospective on rebuilding our RMI computing cluster with gRPC, a JAC-based flood election, live progress streaming, and failure recovery.'
pubDate: 2026-10-12
author: 'Rohan Nandan'
image: 'cover-cs324-assignment-2-distributed-job-processing-grpc.webp'
tags: ['Distributed Systems', 'Java', 'gRPC']
slug: cs324-assignment-2-distributed-job-processing-grpc
series: 'Distributed Job Processing'
---

We rebuilt our distributed computing cluster for CS324 Assignment 2, replacing every RMI call with gRPC and Protocol Buffers. Four of us designed the services, the election, the progress streaming, and the failure handling together.

## From RMI to gRPC: why we rewrote the transport

Assignment 1 ran on Java RMI, which made remote calls easy but left us with brittle wiring and no clean contract for new features. For Assignment 2 we chose gRPC because every interaction — registration, election, task dispatch, progress — could be expressed as an explicit `.proto` contract, and streaming gave us the progress feature almost for free. The layout we settled on was three services:

- `BootstrapService` (`bootstrap.proto`) — worker registry and liveness
- `WorkerService` (`worker.proto`) — single-partition task execution plus a `Ping` probe
- `CoordinatorService` (`coordinator.proto`) — election, heartbeats, state replication, job submission, progress streaming

That raised the obvious question: with a Bootstrap node in the picture, was the system centralised after all?

## Discovery without central control

It was not. The Bootstrap node is a directory, nothing more — it never votes, schedules, or computes. Workers register with `RegisterWorker`, renew a lease with `Heartbeat` every 2 seconds, and disappear from the snapshot after 8 seconds of silence; everyone else follows joins and leaves over the `WatchMembership` stream. We also added `GetRandomWorker` so a joining node could pick a random peer, and `GetActiveWorkers` as a named alias for the snapshot. The actual computing topology lives one layer above this directory, which led directly to the next problem: how does a job flow through the cluster?

## The life of a job: split evenly, then recombined

Clients submit one of three job types — `MAX(numbers)`, `PRIMECOUNT(numbers)`, `PRIMESUM(start, end)` — to whichever coordinator node they can reach; followers forward to the leader. The coordinator partitions the work as evenly as possible: list jobs are dealt out with `baseSize + remainder` chunking, and range jobs are sliced into contiguous sub-ranges (four per worker, capped at 32 tasks so replication stays cheap). Each partition becomes a `WorkUnit` executed as an `ExecuteTask` call, and `ResultAggregator` folds the partial values back into one answer with `max` for `MAX` and exact addition for the prime jobs. That immediately forced the scheduling question: which node gets to be the coordinator?

## Electing a coordinator with the JAC flood

We kept the Assignment 1 rule because it was simple and fair: every worker owns a Job Allocation Counter (JAC), incremented once per job it admits as coordinator, and the election is won by the lowest JAC. The sequence runs in two floods:

1. Any worker with no live leader initiates and floods an `ELECTION` message carrying a unique `election_id`.
2. Each recipient folds in its own candidacy and returns the best candidate of its subtree (a convergecast).
3. The initiator installs the winner locally, then floods a `COORDINATOR` announcement so every reachable worker learns the result.

Terms are monotonic, stale terms are rejected, and a leader serves at most five jobs before stepping down for a fresh election. The subtle part was not the rule itself but the network it runs on: our overlay is unstructured, so cycles were guaranteed. How did we stop an election from looping forever?

## Cycles, duplicates, and the neighbour overlay

Each worker links to only a subset of peers — a joining node connects to one randomly chosen active worker, bilaterally, via `AddNeighbor` — so every flood can revisit a node through a second edge. We gave every `ELECTION` and `COORDINATOR` message a unique ID and made each worker process each ID at most once: duplicates short-circuit with `duplicate=true` (election) or `accepted=false` (coordinator), and the caller simply ignores that subtree. The first visit effectively traces a spanning tree over whatever is reachable, which is exactly the set the spec asks us to consider. When links were missing entirely (a cold start), the flood falls back to the Bootstrap snapshot rather than failing. That solved correctness, but two workers could still initiate at the same instant — so who wins then?

## Concurrent elections and the five-job term

We made same-term conflicts deterministic: if two announcements arrive for one term, every node keeps the better JAC candidate, so order of arrival cannot split the cluster. Terms also bound leadership in time — five admissions close a term, the leader drains its in-flight work first (a deliberate finish-then-step-down choice, so no admitted job is orphaned by the rotation itself), then a new election runs. A term can also end early when the coordinator dies, which the heartbeat timeout detects. With agreement settled, the next problem was much more mundane: everything happens at once.

## Threads, pools, and shared counters

Each worker runs several jobs concurrently, so we isolated the concerns into pools: a bounded `ThreadPoolExecutor` for task computation, a dispatch pool on the coordinator for fan-out and elections, and a single-threaded timer for heartbeats and timeouts. Shared state — JAC, term counters, seen-ID sets, task tables — is guarded with atomics and a fixed `stateLock → termStateLock` ordering. The subtlest coordination point was admission: the check-then-increment for the five-job cap holds both locks, so two racing submissions cannot both become the fifth job. Once jobs ran correctly in parallel, the client work could start: how do you show progress that means something?

## Progress from checkpoints, not timers

The GUI shows one bar per job, and we refused to fake it. Every mutation on the coordinator — admit, assign, complete, retry, job done — takes the next global progress number and replicates the full snapshot to followers. The bar is `completed / total` computed from those checkpoints and pushed over the `SubscribeJobProgress` server stream; the stream only emits when the progress index actually moves. Clicking a bar opens the per-worker breakdown (tasks, statuses, attempts, results), which stays correct across reassignment because every task carries a stable `taskId` plus an `attempt` number, and stale completions are fenced out. Because followers hold replicas, a progress stream survives the coordinator dying underneath it. Which left the hardest requirement for last: failure itself.

## Losing workers and losing the coordinator

We chose boring, explainable mechanisms over clever ones:

- **Detection:** leader heartbeats every 150 ms with a randomised 500–1000 ms follower timeout (a slow worker still heartbeats in time; a dead one misses the whole window); Bootstrap heartbeats every 2 s with expiry after 8 s; neighbour links drop after 3 consecutive RPC failures plus a membership watcher that prunes departed peers.
- **Worker failure:** failed tasks retry elsewhere up to a capped attempt count, `RUNNING` work left by a dead owner returns to `PENDING`, and new workers can join mid-job through the normal register-and-link path.
- **Coordinator failure:** the survivors elect a replacement with the same JAC flood, the winner reclaims in-flight tasks, keeps completed results, resumes unfinished jobs from its replica, and clients roam to the new leader and re-subscribe — no full restart.

## Conclusion

The deliberate trade-offs were flood elections over quorum voting (simpler on an unstructured overlay, chattier per election), full-snapshot replication (easy recovery, cost growing with tasks × mutations, hence the 32-task cap), and per-node JAC ownership (no stale copy can win, at the cost of losing a dead node's counter). With more time we would add persistent JAC and term journals so a restarted worker rejoins with its history, backpressure on the dispatch queues under burst load, and chaos tests that kill nodes mid-flood rather than only mid-job.
