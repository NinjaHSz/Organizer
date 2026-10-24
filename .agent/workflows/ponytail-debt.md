---
description: Harvest deferred shortcuts into a debt ledger so temporary workarounds are tracked.
---

# /ponytail-debt - Technical Debt Ledger

$ARGUMENTS

---

## Purpose

Harvest `shortcut:` (or `ponytail:`) comments across the codebase into a clean debt ledger so intentional shortcuts don't become forgotten tech debt.

## Instructions

Read and execute the instructions defined in `@[skills/ponytail-debt]`.
- Scan code with grep for comment markers.
- If user provides custom marker (e.g. `/ponytail-debt TODO`), scan for that keyword.
- Output clean ledger of debt, ceilings, and planned upgrades.
