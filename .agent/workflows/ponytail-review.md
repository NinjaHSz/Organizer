---
description: Review changes like the senior developer paged when it breaks (logic, security, scale, tests, lean).
---

# /ponytail-review - Senior Dev Code Review

$ARGUMENTS

---

## Purpose

Quality review of changes (uncommitted, staged, branch, or PR) focusing on correctness, safety, scale under load, tests, speed, and eliminating dead weight/over-engineering.

## Instructions

Read and execute the full protocol defined in `@[skills/ponytail-review]`.
- Start with `What this change does:`
- Group findings into: **Must fix**, **Should fix**, **Nice to have**
- Provide concrete input/case for each finding
- Propose the minimal fix that deletes or minimizes code
- End with `Verdict: Ship.` or `Verdict: fix X first.`
