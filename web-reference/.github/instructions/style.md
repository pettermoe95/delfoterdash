---
name: Code Style & Naming
description: Human-readable, intention-revealing naming and style principles applied across the repo.
---

Naming & Readability Principles

1. Prefer clear, human-readable, intention-revealing names over brevity.
2. Expand abbreviations unless industry-standard (id, URL, HTML ok; cfg, cnt, arr, obj not ok).
3. Functions: verb or verb phrase (calculateGrowthRate, buildTooltipPortal, fetchUserProfile).
4. Booleans: predicate form (isLoading, hasError, shouldRender, canRetry).
5. Collections: plural nouns (users, linePoints, legendEntries).
6. Avoid redundant suffixes/prefixes (userDataObj, valueVar, listArray).
7. Convey domain meaning (hourlyRateTarget vs targetValue2).
8. When a variable’s responsibility changes, rename it—do not keep legacy terminology.
9. Extract magic numbers / strings into named constants (UPPER_SNAKE_CASE) near usage or in a dedicated constants module when shared.
10. Prefer explicit over implicit: totalRevenueCurrentYear > revCY.
11. Keep helper modules cohesive: one clear purpose (e.g., numberFormatter, dateFormatter, legendTexts).
12. Stable public API names: avoid churn; batch renames with migration notes.
13. Avoid meaningless temporal names (newData, latestList) unless context-limited and short-lived.
14. Default to pure functions; indicate side effects in names (updateCache, syncRemoteUser).
15. Short circuit early for invalid inputs with clear guard names (isInvalidInput -> return).

Do / Don’t Examples

-   Do: const hourlyRateCurrentYear
-   Don’t: const rateCY
-   Do: const legendTexts = extractLegendTexts(config)
-   Don’t: const arr = getLegTxt(cfg)

Refactoring Guidance

-   If you touch a block and can improve a misleading name safely, do it (low-risk opportunistic cleanup).
-   Large-scale renames (spanning many files) require confirmation before proceeding.

Testing Names

-   Tests mirror subject: file UserCard.test.tsx => describe('UserCard', ...)
-   Scenario names describe behavior, not implementation ("formats number with spaces" not "calls Intl.NumberFormat").

These principles supplement global instructions; assistants and contributors should apply them consistently.
