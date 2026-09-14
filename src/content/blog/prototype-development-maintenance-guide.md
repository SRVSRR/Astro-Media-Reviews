---
title: 'Prototype Development and Software Maintenance'
description: 'The prototype development process from first prototype to release candidates, plus software maintenance types.'
pubDate: 2026-02-01
author: 'Rohan Nandan'
image: 'cover-prototype-development-maintenance-guide.webp'
tags: ['Prototyping', 'Maintenance']
slug: prototype-development-maintenance-guide
---

Prototyping is a powerful approach to software development that allows teams to iteratively build, test, and refine software based on real user feedback. This article covers the complete prototype lifecycle from initial creation to long-term maintenance.

## First Prototype Guidelines

When transitioning from concept to code, the following guidelines apply:

1. **Transition from paper prototype to software design** — Start with low-fidelity sketches before committing to code
2. **Prototype a user interface** — Focus on the user-facing elements first
3. **Create a virtual prototype** — Build a working model that simulates the final product
4. **Add input and output to the prototype** — Ensure data flows correctly through the system
5. **Engineer the algorithms** — Implement the core logic that powers the system
6. **Test the prototype** — Validate functionality before moving forward
7. **Prototype with deployment in mind** — Consider how the final product will be delivered



## Prototype Evaluation

Effective evaluation ensures the prototype meets user needs:

1. **Provide scaffolding when asking for prototype feedback** — Give users context and guidance
2. **Test the prototype with representative users** — Use representative users from the target audience
3. **Ask the right questions** — Focus on usability, functionality, and user satisfaction
4. **Be neutral when presenting alternatives to users** — Avoid biasing feedback
5. **Adapt while testing** — Be flexible and responsive to unexpected findings
6. **Allow users to contribute ideas** — Users often have valuable insights for improvement



## Go/No-Go Decision

After evaluating a prototype, the team must assess whether to continue development:

| Assessment Area | Consideration |
|-----------------|---------------|
| **Cost Estimates** | Revised based on changes requested during prototype evaluation |
| **Schedule Changes** | Updated timeline based on new requirements |
| **Budget Risk** | Risk of exceeding the allocated budget |
| **Delivery Risk** | Risk of missing the project delivery date |
| **User Expectations** | Risk of failing to satisfy user expectations |

> **Goal:** Obtain commitment from stakeholders and management to provide the resources needed to create the next prototype.



## Recommended Prototype Evolutionary Process

### 1. Requirements Engineering
- Gather user stories from all stakeholders
- Have stakeholders describe acceptance criteria for user stories

### 2. Preliminary Architectural Design
- Make use of paper prototypes and models
- Assess alternatives using nonfunctional requirements
- Document architecture design decisions

### 3. Estimate Required Project Resources
- Use historic data to estimate time to complete each user story
- Organize the user stories into sprints
- Determine the number of sprints needed to complete the product
- Revise the time estimates as user stories are added or deleted

### 4. Construct First Prototype
- Select subset of user stories most important to stakeholders
- Create paper prototype as part of the design process
- Design a user interface prototype with inputs and outputs
- Engineer the algorithms needed for first prototype
- Prototype with deployment in mind

### 5. Evaluate Prototype
- Create test cases while prototype is being designed
- Test prototype using appropriate users
- Capture stakeholder feedback for use in revision process

### 6. Go/No-Go Decision
- Determine the quality of the current prototype
- Revise time and cost estimates for completing development
- Determine the risk of failing to meet stakeholder expectations
- Obtain commitment to continue development

### 7. Evolve System
- Define new prototype scope
- Construct new prototype
- Evaluate new prototype and include regression testing
- Assess risks associated with continuing evolution

### 8. Release Prototype
- Perform acceptance testing
- Document defects identified
- Share quality risks with management

### 9. Maintain Software
- Understand code before making changes
- Test software after making changes
- Document changes
- Communicate known defects and risks to all stakeholders



## Testing New Prototypes

Effective testing is critical for prototype quality:

- Testing should be performed by **developers using test cases** created during the design process before programming was completed
- Each user story has **acceptance criteria** attached that should guide test case creation
- Prototypes need to be tested for **defects and performance issues**
- **Regression testing** ensures that adding new features doesn't break existing functionality

> **Key Principle:** Ensure that adding new features to evolutionary prototypes does not inadvertently break features that worked correctly in the previous prototype.



## Release Candidates

A prototype considered as a release candidate undergoes additional scrutiny:

| Stage | Activity |
|-------|----------|
| **Acceptance Testing** | User acceptance tests based on acceptance criteria from user stories |
| **Feedback Organization** | User feedback organized by user-visible functions via the UI |
| **Change Management** | Changes made only if they won't delay the release |
| **Verification** | Second round of acceptance testing if changes are made |
| **Documentation** | Issues and lessons learned documented for project postmortem |

### Post-Release Considerations

- Information from the release should be considered before deciding to undertake future development
- Lessons learned improve cost and time estimates for similar projects



## Software Release Maintenance

**Maintenance** encompasses all activities needed to keep software operational after it has been accepted and released in the end-user environment.

### Types of Maintenance

| Type | Nature | Description |
|------|--------|-------------|
| **Corrective** | Reactive | Modification of software to repair problems discovered after delivery |
| **Adaptive** | Reactive | Modification to keep software usable in a changing environment |
| **Perfective** | Proactive | Modification to provide new user features, better code structure, or improved documentation |
| **Preventive** | Proactive | Modification to correct product faults before discovery by users |

### Maintenance in Agile

In agile process models, much (but not all) of the maintenance work is **preventive or perfective** as new features are added. This aligns with the iterative nature of agile development, where continuous improvement is built into the process.


## Conclusion

The prototype development lifecycle follows a structured yet flexible path:

1. **Build** — Create prototypes following established guidelines
2. **Evaluate** — Test with real users and gather feedback
3. **Decide** — Make informed go/no-go decisions based on risk assessment
4. **Evolve** — Iterate based on feedback and changing requirements
5. **Release** — Deploy thoroughly tested release candidates
6. **Maintain** — Support the software through its operational lifetime

Understanding this lifecycle helps teams deliver software that meets user needs while managing risk and resources effectively.
