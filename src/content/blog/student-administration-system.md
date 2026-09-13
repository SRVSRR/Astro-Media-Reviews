---
title: 'Bula High School: Building a Full-Stack Student Administration System'
description: 'A university group-project case study on a role-based student administration system built with Next.js and Spring Boot — assessments, marks, cascading deletes, and two bugs honest enough to admit.'
pubDate: 2026-09-15
author: 'Rohan Nandan'
image: 'sas-dashboard.png'
tags: ['Full-Stack Engineering', 'Backend Engineering']
slug: student-administration-system
---

## Problem

Small schools running admin on spreadsheets hit the same wall every term: no single source of truth for who is enrolled in which class, no enforcement of grading rules, and report generation that means someone manually copying numbers into a document.

This was the **CS241 Software Design and Implementation** group project — five of us building a Student Administration System for a fictional school ("Bula High School") — with the brief of covering the full academic-admin loop: staff, students, classes, subjects, enrollments, assessments, marks, and reporting, gated behind proper role-based access. We received an **A+**.

## Approach

The system has three roles — Admin, Teacher, Student — enforced both at the API layer (Spring Security route matchers plus method-level `@PreAuthorize`) and in the frontend (an `AuthGuard` component wrapping pages with an `allowedRoles` prop). Admins manage staff and students, teachers manage their own class's assessments and marks, and students see only their own enrollment and marks.

### 1. The class and assessment side

My part was the class and assessment side of the system, full-stack:

- Class and assessment management end-to-end — creation, editing, and cascading deletion.
- Mark entry and the assessment-weighting rules: a class-subject's assessments cannot add up to more than 100% weight, validated server-side on both create and update.
- Subject report generation, exported as PDF client-side.
- The RBAC-aware dashboard and the enrolled-student class view.
- A UI pass — swapping icon libraries, adding toast notifications, and tightening loading states.

Some of the business rules baked into the backend are the kind that are easy to get wrong:

- A class must have exactly 5 unique subjects.
- A teacher can only be assigned to one class at a time.
- Grading uses Fiji's secondary-school letter scale rather than a generic A–F curve — `getLetterGrade()` caps at A+ from 85% and floors at E below 40%, with letter colours to match in the UI.

![Class management view with the enrolled students list|large](/images/sas-classes.png)

### 2. Authentication and reporting

Auth is JWT-based, issued by Spring Security on login and carrying the user's role and school ID as claims, checked on every request by a `JwtAuthenticationFilter` ahead of Spring's own auth chain. Password reset runs on a token table with expiry and single-use enforcement, emailed out via Spring Mail.

Report generation runs entirely in the browser: `pdfExport.ts` builds class marksheets and per-subject reports with jsPDF and jspdf-autotable, computing the weighted subject grade and overall grade client-side.

![Assessment management with mark entry and weights|large](/images/sas-assessments.png)

## Stack

- **Frontend:** Next.js 15, React, TypeScript, Tailwind CSS.
- **Backend:** Spring Boot, Java 17, Spring Security, JWT (jjwt).
- **Database:** PostgreSQL via JPA/Hibernate — `User` (single table for Student/Teacher/Admin), `ClassEntity` (many-to-many with `Subject` and `User` for enrollment), `ClassSubject` as the join entity that `Assessment` hangs off, and `Mark` tying a student, an assessment, and a score together.
- **PDF export:** jsPDF + jspdf-autotable, generated client-side.
- **Email:** Spring Mail for password-reset links.
- **Repository:** [github.com/SRVSRR/student-administration-system](https://github.com/SRVSRR/student-administration-system)

Seven controllers (`/api/assessments`, `/api/auth`, `/api/classes`, `/api/class-subjects`, `/api/marks`, `/api/subjects`, `/api/users`) covering roughly 30 REST endpoints in total.

## Results

- **A+** in CS241 (Software Design and Implementation).
- 94 commits from 5 contributors over about five and a half weeks (Sept 7 – Oct 16, 2025).
- 16 of those commits are mine, concentrated on class management, assessment creation/editing, mark entry, and report generation — touching both the Java service/controller layer and the corresponding Next.js pages.
- A working PDF export pipeline for class marksheets and per-subject reports, generated entirely in the browser.
- Full RBAC enforcement across three roles, checked at both the network and UI layer.

## Lessons

1. **The duplicate marks table was invisible until delete-time.** The schema holds both a `Mark` entity and a leftover `AssessmentMark` that do almost the same job. You can see the scar tissue directly in the deletion code: `AssessmentService.deleteAssessment()` deletes from both tables "just in case" — a defensive move that is really a tell that the schema drifted mid-project without a follow-up migration to consolidate it.
2. **Auth-adjacent flows need a done-check.** `EmailService.sendPasswordResetEmail()` takes a `toEmail` parameter and then ignores it — the message is hardcoded to one contributor's personal Gmail. The kind of placeholder that slips through easily in a group project. A short checklist (every parameter actually used? hardcoded recipients or secrets? token expiry and single-use verified?) would have caught it at merge time instead of in my retro.
3. **Never leave credentials in source.** The JWT signing key is a hardcoded string in `JwtUtil`, and the mail account's app password sits in plaintext in the committed `application.properties`. Env vars and secrets managers from day one — especially on a public repo where every contributor has the clone.
4. **Shared controllers are a merge bottleneck.** Five people committing into overlapping files like `ClassController` and `AssessmentService` generates constant conflict cost. Clear ownership boundaries, smaller commits, and a rebase cadence made the second half of the project noticeably smoother.
5. **"Exactly 5 unique subjects" was a strict-enough rule, then it bit.** It fitted the fictional school perfectly and made the enrollment screen simple — but it is policy, not physics, and real schools vary by term. Where a business rule encodes convention rather than constraint, keep it out of `createClass` and make it config.

My sixteen commits covered far more of the stack than any of my previous projects, and that breadth is exactly what made the mark-entry, weighting, deletion, and reporting logic worth writing about at all. The two bugs above are not blemishes on the story — they are the most instructive parts of it.