---
title: 'USP BSE Resources: The Public Past-Paper Archive'
description: 'Why I maintain a public GitHub archive of past exams, solutions, and study notes from the USP Bachelor of Software Engineering — and how it is organized.'
pubDate: 2026-09-14
author: 'Rohan Nandan'
image: 'usp-bse-cover.webp'
tags: ['Study Resources', 'Software Engineering']
slug: usp-bse-resources
---

> Source: [github.com/SRVSRR/USP-BSE-Resources](https://github.com/SRVSRR/USP-BSE-Resources)

## Why the archive exists

For a Bachelor of Software Engineering, the exam cycle at USP — mid-semester tests, topic tests, and end-of-semester finals — rewards familiarity with past papers more than almost anything else in the course pack. Question styles repeat, mark allocations shift slowly, and the fastest way to calibrate "how much depth does the lecturer actually expect" is to read a paper a previous cohort sat.

The problem is that those papers are scattered across course pages, shared drives, and WhatsApp groups. If a student far from campus, or studying after hours, wants to revise, they depend on whoever happens to forward the right file at the right time. The archive exists to fix that: a single, searchable, public home for everything I and my classmates could find, kept in one structure instead of ten inboxes.

## What is in it

The repository holds about 160 files covering Year 1 to Year 3 of the BSE program:

- **Mid-semester and topic tests** — marked papers (MST), solutions (`_Sol`), and alternate versions (`2022_T2_V1`, `2022_T2_V2`) when more than one paper existed in a semester.
- **Final exams** — question papers and worked solutions across many years, from 2010 through to the most recent 2025 papers.
- **Mock and practice papers** — including mock MSTs faculty published ahead of real exams.
- **Notes and revision guides** — lecture notes, an assembled "Ultimate guide" revision folder for CS241, lab resources, and rules sheets such as the DFD guide for systems analysis courses.
- **Prescribed textbooks** — PDFs of the required texts where they are not distributed per-semester, since the same textbook is prescribed across multiple offerings.
- **Group assignments** — a few submission PDFs and decks kept as exemplars of how previously graded work was structured.

The file naming uses a compact, consistent convention — `2014s1_MST_Sol.pdf`, `2023_FE_QP.pdf`, `2022_T2_V1.pdf` — with `_QP` for question papers, `_Sol` for solutions, `_MST`/`_FE`/`T1`/`T2` for the assessment type, and a trailing version when duplicates exist. That one naming rule is what makes the archive usable: every file is sortable by year, and a student can find all past MSTs for a course with a single `ls` or GitHub search.

## How it is organized

The layout mirrors the degree structure itself rather than any internal preference:

```
USP-BSE-Resources/
├── Year 1/
│   └── CS140/           # introductory computing notes
├── Year 2/
│   ├── CS211/           # 25 items — data structures, mostly papers + solutions
│   ├── CS214/           # software engineering theory
│   ├── CS219/           # 2014s1_MST_Sol.pdf ...
│   ├── CS230/
│   ├── CS241/           # systems analysis — incl. an "Ultimate guide" revision folder
│   ├── IS221/
│   └── IS222/
└── Year 3/
    ├── CS310/           # computer networking
    ├── CS311/
    ├── CS352/
    └── IS333/
```

Two structural decisions matter. First, everything sits under `Year N/<course>/`, so the folder tree reads like the degree plan and nothing needs a README to navigate. Second, materials are not filtered by source: my own solutions sit beside solutions shared by classmates (`2024_A1_Ishal.pdf`, `2024 CS219 MST Anav Solutions.pdf`), precisely because several solutions to the same paper are often how a tricky question finally clicks.

## Why it is public

Keeping it on GitHub rather than a private drive costs nothing and gains three things:

- **Discoverability** — the repository shows up in searches; students two cohorts ahead can find it without asking anyone.
- **History** — every commit is a record of which papers existed in each semester, which is useful in itself for spotting how exam scope changed.
- **No single point of failure** — a shared drive lives and dies with the person who owns it; a public repository does not.

## Lessons

1. **Consistent naming beats folders.** `2014s1_MST_Sol.pdf` sorts correctly, deduplicates trivially, and survives being moved to any structure; "MST sol 2014 v1.pdf" does not.
2. **Solutions are the asset.** Papers without worked answers are useful; papers with four different solutions to question 3 are how a course is actually learned, so never discard a "duplicate" solution.
3. **A public archive outlasts its owner.** The value compounds when the files are not locked behind whoever collected them.
4. **Mirror the curriculum, not your preferences.** When the folder tree matches the degree structure, anyone who has taken one course in the program can navigate it without instructions.