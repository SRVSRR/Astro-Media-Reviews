---
title: 'Building a Custom TCP File Transfer Protocol from Scratch'
description: 'A CS310 Computer Networking assignment: hand-rolling a request/response protocol on top of raw TCP sockets in Python, and where the server and client implementations actually diverge in robustness.'
pubDate: 2026-09-13
author: 'Rohan Nandan'
image: 'tcp-connection.png'
tags: ['Networking', 'Backend Engineering']
slug: tcp-file-transfer-protocol
---

> Source: [github.com/SRVSRR/CS310-Client-Server-TCP-File-Transfer](https://github.com/SRVSRR/CS310-Client-Server-TCP-File-Transfer)

## Problem

Most file-transfer code people write day to day sits on top of something that already handles framing, retries, and error semantics — HTTP, SFTP, whatever. This **CS310 Computer Networking** assignment strips that away: build a client and server that move a file over a **raw TCP socket**, with a protocol you design yourself, and get the boring-but-critical parts right — knowing where one message ends and the next begins, validating what the other side sends you, and not letting a client request a file outside the intended directory.

The pair assignment with Zhixian Chen was built and committed in a single day, against a deadline that made protocol correctness and delivery of a working demo the two competing priorities.

## Approach

The protocol is deliberately simple and text-based for the control messages, then switches to raw binary for the payload:

- **Request:** `FILE_REQUEST|<filename>\n`
- **Success response:** `STATUS|OK|<filename>|<filesize>\n`, followed by the raw file bytes
- **Error response:** `STATUS|ERROR|<message>\n`

### 1. Path traversal is stopped on both sides

Both sides run the requested filename through `os.path.basename()` before touching the filesystem, which strips any directory components a malicious client could smuggle in (`../../etc/passwd` becomes just `passwd`). It is a small line of code that is the difference between a working assignment and a path-traversal vulnerability — and it is present on the server (before opening the file) and the client (before writing the download to disk).

### 2. The two sides are not equally careful

The client's response parser (`recv_line`) reads one byte at a time in a loop until it hits `\n`, which correctly handles a header arriving split across multiple TCP packets — a real possibility, not a theoretical one.

The server's request handler does a single `conn.recv(1024)` and assumes the entire request arrived in one call. For a short `FILE_REQUEST|filename` line over loopback this works essentially every time, but it is not protocol-correct — a request that happened to arrive split across two TCP segments would silently corrupt the parse. Worth being specific about rather than describing the two sides as symmetric.

### 3. Payload streaming and integrity

The file payload streams in fixed 4096-byte chunks in both directions. The client tracks bytes received against the server-declared file size, prints progress in 5% increments, and raises if the final byte count does not match the declared size. The server also is not concurrent: `listen(1)` plus a single-threaded `while True: accept() → handle_client()` loop serves one client at a time by design — reasonable for an assignment scoped to one client and one transfer.

## Stack

- **Language:** Python 3, standard library only — `socket` and `os`, no external dependencies on either side.
- **Transport:** Raw TCP (`AF_INET`, `SOCK_STREAM`).
- **Files:** `fileserver.py` (104 lines), `client.py` (161 lines).

## Results

- A working request → validate → stream → verify round trip over TCP loopback.
- Path-traversal protection on both the server and the client.
- Client-side download progress reporting and a byte-count integrity check after transfer.
- Clean separation of concerns even at this size — header building/parsing, file I/O, and connection handling are each their own function rather than one long script.
- Graded **A** in CS310 Computer Networking.

## Lessons

1. **"Works in the demo" is not "correct per the transport."** The client's careful byte-by-byte `recv_line()` exists because TCP does not guarantee message boundaries align with `recv()` calls; the server's single `recv(1024)` gets away with skipping that because the request line is short and everything runs over loopback in practice. The shortcut is fine to take deliberately, as long as you can say why — the gap only bites when you do not notice the transport never promised what you assumed.
2. **Timeline pressure forces explicit trade-offs.** A one-day build meant choosing correctness where it was cheap (both-sides path sanitization) and pragmatism where it was costly (server-side header framing). Naming each trade-off, as we did in the retro, is what turns deadline pressure into a lesson instead of just debt.
3. **Frame every header the same way.** With more time, the server would read its request line byte-by-byte exactly like the client reads responses — one framing function, used on both sides, instead of two different assumptions about message boundaries.
4. **Byte count is a weak integrity check, not a hash.** The verify step proves byte-for-byte size equality, not that the content survived intact. Chunked hashing (e.g. comparing SHA-256 digests) would catch corruption that happens to preserve length.
5. **Concurrency is a feature decision, not an omission.** `listen(1)` and a single-threaded accept loop were scoped for one transfer at a time. Turning the loop into a per-connection thread pool is the obvious next step, but only when the assignment actually needs it.