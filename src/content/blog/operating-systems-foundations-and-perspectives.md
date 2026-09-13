---
title: 'Operating Systems Foundations: Components, Perspectives, and the Kernel'
description: 'Breaks down system components, user and OS viewpoints, kernel responsibilities, and the API vs system call model.'
pubDate: 2026-05-30
author: 'Rohan Nandan'
image: 'image6.webp'
tags: ['Operating Systems']
slug: operating-systems-foundations-and-perspectives
---

Operating systems sit at the center of modern computing, but they are best understood by first decomposing the computer system into its major parts and then examining the roles of the OS and kernel.

## Computer System Components

A computer system can be divided into four components:

- **Hardware** provides basic computing resources like CPU, memory, and I/O devices.
- **Operating system** controls and coordinates the use of hardware among various applications and users.
- **Application programs** define how system resources are used to solve user problems (word processors, compilers, web browsers, database systems, video games).
- **Users** include people, machines, and other computers.

This breakdown matters because the OS is not just another program. It is the coordinator that decides how resources are shared across the entire system.

## Operating System Viewpoints

The OS looks different depending on the point of view:

- **Users** want convenience, ease of use, and good performance. They do not care about resource utilization.
- **Shared systems** (mainframes and minicomputers) must keep all users satisfied at once, so the OS acts as a resource allocator and a control program.
- **Dedicated workstations** have local resources but still rely on shared services and servers.
- **Mobile devices** are resource poor and optimized for usability and battery life, with interfaces like touch and voice recognition.
- **Embedded systems** (cars, appliances, medical devices) may have little or no user interface and run primarily without user intervention.

In every case, the OS balances convenience with control, and efficiency with fairness.

## Kernel vs Operating System

The **kernel** is the core system software inside an OS.

- Manages memory, disk, and tasks.
- Serves as the interface between applications and hardware.
- Translates user commands into machine-level operations.
- An OS cannot function without a kernel.

The **operating system** includes the kernel plus additional system software and services.

- Manages hardware and software resources.
- Provides security and access control.
- Serves as the interface between hardware and the user.
- A computer cannot operate without an OS.

In summary, the kernel is the essential core, while the OS is the complete environment that makes the system usable.

## API vs System Calls: The Restaurant Model

A common way to conceptualize the OS layers is a restaurant analogy:

- **API (Application Programming Interface)** is the menu. It is a set of functions exposed to programmers, such as `printf()` or `open()`.
- **System call** is the order. It is a specific request made by a program to the kernel, such as "write this data to disk."
- **Kernel** is the chef. It has the authority to execute the request.
- **Operating system** is the entire restaurant, which includes the kitchen, dining room, staff, and utilities.

This model highlights an important concept: user programs do not access hardware directly; they request services from the kernel.

## What Counts as an Operating System?

There is no universally accepted definition. A practical approximation is: **"everything a vendor ships when an operating system is ordered."** But even that varies across platforms.

A helpful breakdown is:

- **Kernel**: the one program running at all times. This is part of the operating system.
- **System programs**: ship with the OS but are not part of the kernel (utilities, shells, system tools).
- **Application programs**: everything not associated with the OS itself.

Modern general-purpose and mobile OSes also include **middleware**—software frameworks that provide services to application developers, such as databases, multimedia, and graphics.

## Further Reading

For a deeper, structured treatment of these concepts, see:

- Silberschatz, A., Galvin, P. B., and Gagne, G. (2018). *Operating System Concepts* (10th ed.). John Wiley and Sons. ISBN 81-265-0962-7.

## Conclusion

Operating systems are both resource managers and control programs. They keep shared systems fair, keep mobile devices efficient, and keep embedded systems reliable. At the center is the kernel, translating high-level requests into machine actions. Understanding these roles and boundaries clarifies the rest of OS design.
