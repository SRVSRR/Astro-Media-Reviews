---
title: 'What Is Software? Product Types, Cost Realities, and Why Software Ages'
description: 'A theory-first breakdown of software as programs, data structures, and documentation, including product categories and maintenance economics.'
pubDate: 2026-04-20
author: 'Rohan Nandan'
image: 'image1.webp'
tags: ['Intro to Software Engineering']
slug: software-definition-product-types-cost-and-evolution
---

Software is often misunderstood as "just code." In software engineering, that view is incomplete. Software is a long-lived engineering product that must be designed, built, evolved, and supported under changing technical and business conditions.

## **Software as an Engineered Product**

In CS140 terms, software includes three integrated parts:

1. **Programs** - executable instructions that deliver required behavior.
2. **Data structures** - organized representations that allow storage and manipulation of information.
3. **Documentation** - operational and usage knowledge that allows software to be built, maintained, and used correctly.

This definition matters because engineering decisions affect all three. A system can have working code but still fail in production if data modeling is weak or documentation is poor.

## **Software Product Categories**

Software products are typically grouped into two broad classes:

- **Generic products**: built for a market, then sold or licensed to many customers (for example office suites or CAD tools).
- **Customized products**: commissioned for specific organizational needs (for example air-traffic management or embedded industrial control systems).

The ownership model also differs. In generic products, the vendor usually controls the specification and release strategy. In customized products, requirements are negotiated with a specific client and contractual ownership often shifts toward the customer.

## **The Cost Reality: Maintenance Dominates**

A central software engineering insight is that long-term cost is not concentrated in initial development. In many systems, especially long-lived enterprise and infrastructure systems, **maintenance cost exceeds development cost by a large margin**.

Why does this happen?

- Requirements evolve with business change.
- Dependencies (platforms, frameworks, standards) change over time.
- Security and compliance expectations increase.
- New integrations and interfaces become necessary.

This is why maintainability is not a "nice-to-have" quality attribute. It is an economic requirement.

## **Why Software Ages Even If It Does Not Wear Out**

Physical products wear out through mechanical use. Software does not degrade physically, but it can still deteriorate through uncontrolled change.

Two important observations from foundational software engineering:

- Software is **engineered, not manufactured**. Once created, copying is cheap; design quality is where risk concentrates.
- Software may follow a **bathtub-like quality pattern** where early defects are removed, but later change-driven complexity can increase failure likelihood if architecture and process are weak.

In short, software quality decays when design integrity is not protected over time.

## **Major Software Application Classes**

Understanding software categories helps explain why one process model never fits every project:

1. **System software** (compilers, file utilities, editors)
2. **Application software** (task-specific end-user tools)
3. **Engineering and scientific software** (computation-intensive domains)
4. **Embedded software** (software inside devices/products)
5. **Product-line software** (targeted consumer/market families)
6. **Web applications** (network-centric, service-integrated software)
7. **AI software** (non-numerical or heuristic problem-solving)
8. **Open-source software** (community-accessible source and collaboration models)

Each class introduces different constraints in reliability, performance, deployment, and governance.

## **Software Engineering vs Computer Science**

The IEEE framing of software engineering emphasizes a **systematic, disciplined, and quantifiable approach** across development, operation, and maintenance.

That practical orientation distinguishes it from adjacent disciplines:

- **Computer science** focuses on computational theory and fundamentals.
- **Software engineering** focuses on building and evolving useful software under real constraints.
- **Systems engineering** spans software, hardware, and broader process integration.

Software engineering therefore occupies the boundary between theory and delivery.

## **Attributes of Good Software**

Your notes identify four core quality attributes that remain widely accepted:

- **Maintainability** - ability to evolve safely and efficiently.
- **Dependability and security** - reliability, safety, and resistance to misuse.
- **Efficiency** - responsible use of processing, memory, and response time budgets.
- **Acceptability** - usability, understandability, and ecosystem compatibility.

These attributes are interdependent. For example, poor maintainability eventually harms dependability, and weak acceptability can make technically correct systems operationally unsuccessful.

## **Conclusion**

Software is best viewed as a socio-technical product that combines executable logic, information structures, and operational knowledge. Its real challenge is not only initial construction, but sustained evolution. Teams that recognize product type, quality attributes, and maintenance economics early are better positioned to deliver software that remains useful and trustworthy over time.
