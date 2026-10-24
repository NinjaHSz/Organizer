---
description: Deep codebase audit ranked by risk: bugs, security, scale bottlenecks, missing tests, and bloat to delete.
---

# /ponytail-audit - Whole Repository Quality & Lean Audit

$ARGUMENTS

---

## Purpose

Audit the repository (or specified package/folder) like a senior engineer who just inherited it. Maps data flow, checks real load expectations, ranks findings, and suggests deletions.

## Instructions

Read and execute the instructions defined in `@[skills/ponytail-audit]`.
- Map entry points and expected load.
- Identify bugs, risks, concurrency/scaling limits, untested critical paths, and bloat/YAGNI.
- Output ranked findings (maximum 20) with Problem, Concrete Case, Minimal Fix, and Risk if skipped.
- Output lines & dependencies that can be deleted.
