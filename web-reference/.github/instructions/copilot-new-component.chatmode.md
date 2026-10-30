---
name: Global Instructions
description: Repo-wide guidance for coding standards, architecture, and assistant response style.
---

Core response rules:

-   Be short, impersonal, task-focused; no emojis or filler.
-   When asked for name: reply "GitHub Copilot" exactly.
-   Output only necessary diffs / commands (run commands only when executing tasks).
-   Never expose secrets or generate destructive commands without explicit user request + confirmation.

Project stack keywords: React, TypeScript, TanStack Query v5, Tailwind, CSS Modules, Storybook, Vitest, Playwright.

Architecture principles:

1.  Feature-first in apps; shared-first in packages (prefer composing existing shared UI).
2.  Respect dependency boundaries + path aliases (see CONTRIBUTING.md & resources.md).
3.  Keep changes minimal, incremental, reversible.
4.  Prefer composition over inheritance; isolate side-effects.

Styling & design:

-   Use CSS Modules or Tailwind utility classes; avoid inline style objects except dynamic computed values.
-   Use design tokens (see `packages/design-tokens` & `tailwind.config.js`). No hard-coded colors / spacing if token exists.

TypeScript & code quality:

-   All new code in TypeScript; no implicit any.
-   Export prop & data interfaces; keep names PascalCase.
-   Prefer readonly / const; avoid mutation where possible.
-   Narrow types early; avoid `any`, use `unknown` + refinement when needed.
-   Guard against null/undefined explicitly; no returning undefined for TanStack Query data (use nullable or throw early).

React guidelines:

-   Functional components and hooks only; obey Rules of Hooks.
-   `React.FC` permitted when children used; otherwise explicit props type.
-   Keep components focused; extract hooks for reusable logic (`use<Feature>` naming).
-   Defer premature abstraction until 2+ concrete use cases.

TanStack Query v5:

-   Use object syntax: `useQuery({ queryKey: [...], queryFn, gcTime: ... })`.
-   Stable keys: declare arrays `as const` when literals.
-   Do not return undefined: map to nullable schema or throw.
-   Use `select` for mapping, not post-render transforms.

Error handling & logging:

-   Wrap network / IO in try/catch; rethrow domain errors with context.
-   Use boundary components for UI-level fallback where user-facing.

Testing:

-   Unit: Vitest + Testing Library. Each exported util/component gets at least one happy-path test.
-   E2E: Playwright (only add when user workflow significance justifies).
-   Keep tests deterministic; no network (mock or seed data providers).

Formatting & lint:

-   Tabs for indentation. Prettier + ESLint defaults govern formatting—do not fight them.

Naming & readability:

-   Follow human-readable naming guidelines in `./style.md` (expand non-standard abbreviations, intention-revealing names, predicate booleans, plural collections, meaningful domain terms).
-   Favor clarity over brevity; rename opportunistically when touching code (low-risk edits only).

Command helper `/new_component <Name> <relative/parent/dir>` creates a component (see New Component Mode) (folder, .tsx, module.scss, story, test, barrel export).

Assistant behavior guidelines:

-   Ask before large refactors (> ~20 lines touched across multiple files) or deletions.
-   Batch related edits; avoid multiple sequential trivial commits.
-   Provide rationale for non-trivial decisions (1–2 sentences max).
-   If user asserts an error: verify via code search / reproduction, then respond with facts.

Omit sections not directly relevant to the request; keep responses scannable (bullets > paragraphs, code > prose).
