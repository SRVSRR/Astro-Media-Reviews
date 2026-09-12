---
title: 'Computer-System Operation: Interrupts, I/O, and Storage Hierarchy'
description: 'Explains CPU and device concurrency, interrupts and traps, bootstrapping, I/O flow, and storage hierarchy basics.'
pubDate: 2026-05-31
author: 'Rohan Nandan'
image: 'image4.4.webp'
tags: ['Operating Systems']
slug: computer-system-operation-interrupts-io-storage
---

Operating system fundamentals are clarified by examining how hardware, I/O, and storage interact at runtime. This article summarizes the core mechanisms that keep a system responsive and coordinated.

## Computer-System Operation

A modern computer system is built around shared access and concurrent activity:

- One or more CPUs and device controllers connect through a common bus and share main memory.
- CPUs and I/O devices can execute concurrently and compete for memory cycles.
- Each device controller is responsible for a specific device type and maintains a local buffer.
- Each controller type has an operating system device driver to manage it.
- The CPU moves data between main memory and controller buffers.
- I/O flows from the device to the controller buffer, then to main memory.

This layout explains why the OS is coordination-heavy: the system executes multiple activities concurrently.

## Interrupts and Traps

**Interrupts** are events raised by hardware or software. They signal the processor to finish the current instruction and immediately handle an **Interrupt Service Routine (ISR)**.

Key points:

- An interrupt transfers control to an ISR through the **interrupt vector**, which stores the addresses of service routines.
- The interrupt architecture must save the address of the interrupted instruction.
- A **trap** (or exception) is a software-generated interrupt caused by an error or a user request.
- Operating systems are **interrupt driven**: the OS reacts to events rather than polling constantly.

## Bootstrapping and Startup

When a machine powers on or reboots, a **bootstrap program** runs first:

- It is stored in ROM or EPROM (firmware).
- It initializes system components.
- It loads the operating system kernel and starts execution.

Without a reliable bootstrap sequence, nothing else in the system can run.

## I/O Control Flow

Two core I/O control styles appear in OS design:

### Synchronous I/O (Blocking)

- After I/O starts, control returns to the user program **only after** I/O completion.
- A **wait** instruction can idle the CPU until the next interrupt.
- With a simple wait loop, there is contention for memory access.
- At most one I/O request is outstanding at a time (no simultaneous I/O).

### Asynchronous I/O (Non-blocking)

- After I/O starts, control returns to the user program **without waiting** for completion.
- A system call allows the user program to wait for I/O completion if needed.
- A **device-status table** stores the type, address, and state of each I/O device.
- The OS indexes into this table on interrupts to update device state and completion status.

## Main Memory and Secondary Storage

**Main memory** is the only large storage the CPU can access directly:

- Random access, typically volatile.
- Usually DRAM (Dynamic Random-Access Memory).

**Secondary storage** extends main memory capacity:

- Nonvolatile and large-capacity.
- Includes Hard Disk Drives (HDDs) and Solid State Drives (SSDs).
- **Non-volatile memory (NVM)** devices are faster than disks and increasingly common as prices drop.

## Bits, Bytes, and Words

Storage is built from bits:

- A **bit** stores 0 or 1.
- A **byte** is 8 bits and is the smallest convenient unit on most systems.
- A **word** is the native data size of the architecture, often 64 bits (8 bytes) on modern systems.

CPUs execute most operations in word-sized chunks rather than bit by bit.

## Storage Units (Binary Prefixes)

Storage is measured in bytes and their binary multiples:

- 1 KB = 1,024 bytes
- 1 MB = 1,024^2 bytes
- 1 GB = 1,024^3 bytes
- 1 TB = 1,024^4 bytes
- 1 PB = 1,024^5 bytes

Manufacturers often round these to powers of ten, but systems typically use the binary values. Networking is the exception, measuring throughput in **bits** rather than bytes.

## Storage Hierarchy and Caching

Storage systems are organized in a hierarchy defined by:

- **Speed**
- **Cost**
- **Volatility**

**Caching** copies data into faster storage layers. Main memory can be viewed as a cache for secondary storage.

## Device Drivers and OS Interfaces

Each controller type has a **device driver** that:

- Manages the device and its buffer.
- Provides a uniform interface between controller and kernel.

This abstraction allows the OS to treat diverse hardware consistently.

## Direct Memory Access (DMA)

For high-speed devices, **DMA** allows the controller to transfer blocks of data directly to main memory without CPU intervention.

- Only one interrupt is generated per block, not one per byte.
- This reduces overhead and improves throughput.

## Conclusion

Computer-system operation is defined by concurrency, interrupts, and layered storage. The OS orchestrates device controllers, memory, and I/O so that user programs can run smoothly and safely. These mechanisms are the foundation for everything from desktop responsiveness to high-performance server throughput.
