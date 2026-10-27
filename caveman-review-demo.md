# Caveman Review Demo

Following the `caveman-review/SKILL.md` skill: one line per finding, format `L<line>: <problem>. <fix.`, severity prefixes optional.

## aiService.ts Reviews

- `L28: 🟡 risk: apiKey can be empty string if env var missing. Add explicit check for `import.meta.env.VITE_OPENROUTER_API_KEY === ''` before throw.`
- `L65: 🔴 bug: makeRequest not awaited in try catch — `try { return await makeRequest(primaryModel) }` returns promise rejection silently. Use `const result = await makeRequest(...); return result;`.`
- `L93: 🟡 risk: jsonMatch regex `/\\{[\\s\\S]*\\}/` is greedy and could match too much. Use more specific pattern or validate parsed result structure.`
- `L115: 🔵 nit: console.warn format inconsistent — some use template literal with err, others use string concatenation. Standardize to template literals.`

## supabase.ts Reviews

- `L22: 🟡 risk: `url.includes('YOUR_SUPABASE')` check is fragile — supabase.com URLs could contain 'your' subdomain. Use explicit prefix check or env var presence flag.`
- `L45: 🟡 risk: `cache_tasks` localStorage set without checking quota — could cause silent failure on large task lists. Consider size limit or error boundary.`
- `L78: 🔵 nit: `dbStatus` variable assigned but never used after `dbPayload` construction on lines 51-58. Remove dead assignment.`
- `L112: ❓ q: `push_subscriptions` table uses `subscription->>endpoint` filter — is this a JSONB column? Verify schema matches the `subJson` structure being stored.`

## Format Check

All comments follow: `L<line>: <problem>.<fix.`
- Severity prefixes used: 🔴 🟡 🔵 ❓
- No throat-clearing phrases ("I noticed that", "it seems like")
- No restating what the line does
- No hedging ("perhaps", "maybe", "I think")
- Exact line numbers and symbol names preserved