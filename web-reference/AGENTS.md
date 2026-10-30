# AGENTS.md

## Purpose
This file defines how Codex should operate as a PR review agent for `brilliant_view_frontend`.

Primary goal: find real bugs, regressions, and missing coverage quickly, with minimal noise.

## Repository Snapshot
- Monorepo managed with `pnpm` + `turbo`.
- Workspaces: `apps/*`, `packages/*`, `tooling/*`.
- Main apps:
  - `apps/brilliant-view` (main frontend, Vite + React + TS, port `7575`)
  - `apps/brilliant-view-admin` (admin frontend, Vite + React + TS, port `7576`)
  - `apps/design-docs` (Storybook/design docs)
- Shared packages:
  - `packages/api` (`@bv/api`, request/schemas layer with zod)
  - `packages/graph-components`
  - `packages/brilliant-view-ui` (`@bv/ui`)
  - `packages/bds-core`
  - `packages/design-tokens`
  - `packages/brilliant-components`
- Tooling packages:
  - `tooling/eslint` (`@repo/eslint-config`)
  - `tooling/prettier` (`@repo/prettier-config`)
  - `tooling/typescript-config`
  - `tooling/github` (shared GH actions)

## Diff scope
Every review begins by identifying what changed:

1. Run git diff --name-only origin/main...HEAD to get the changed file list.
2. Limit findings to changed code and its direct callers/consumers.
3. Do NOT review unchanged files unless a changed file's contract affects them (see Blast Radius below).
4. When reading changed files, load enough surrounding context (the full function/component, relevant imports) to understand intent — but scope findings to the diff.

## Blast radius - Shared package changes
Changes in packages/* can silently break downstream consumers. When a shared package is modified:

1. Identify all consuming workspaces: pnpm why <package-name> or check package.json files importing it.
2. Run typecheck and tests for all affected consumers, not just the changed package.
3. For breaking changes to exports, types, or API contracts in shared packages, verify every import site still compiles.
4. Flag any shared package change that lacks downstream validation as Crucial.

Example triggers: changed type signatures in @bv/api, modified component props in @bv/ui, updated design tokens.

## Ground Truth Checks
When reviewing a PR, align recommendations with CI behavior in `.github/workflows/pull_request_ci.yml`:
1. Build (design docs excluded unless changed):
   - If `apps/design-docs` unchanged: `turbo run build --filter=!design-docs`
   - If changed: `turbo run build`
2. Validation stage:
   - `turbo run pre-build typecheck test format`

If local scope is small, run targeted checks first, then escalate to broader checks if risk is high.
Default mode: targeted checks unless risk is high.

## Review Priorities
Order findings by severity and user impact:
1. Correctness and runtime safety
2. Regressions in behavior, routing, or auth flows
3. Data/API contract drift
4. State/query consistency and cache invalidation
5. Security/privacy issues
6. Performance issues with visible impact
7. Maintainability and readability
8. Style and consistency feedback

## Repo-Specific Risk Checklist
- TanStack Query usage:
  - Prefer stable query keys (`as const` where literal arrays).
  - Validate invalidation keys after mutation changes.
  - Avoid returning `undefined` for query data unless explicitly handled.
- API/schema consistency:
  - If API responses or request payloads changed, confirm matching zod schema updates in `packages/api` and consumers.
- Environment variables:
  - If new `VITE_*` vars are introduced, check app env schema files and `turbo.json` env/globalEnv if relevant.
- Routing/auth:
  - Verify route changes in `routes.ts`/`AppRouter.tsx` and auth boundaries (`AuthenticatedLayout`, `UnauthenticatedLayout`, etc.).
- Styling system:
  - Prefer design tokens and shared UI primitives over hardcoded values or one-off styles.
- Package boundaries:
  - Keep imports package-safe and avoid deep cross-package coupling.
- Build/release impact:
  - Check workflow updates under `.github/workflows` and deployment scripts for branch/environment correctness.
- Dependency/security (mandatory):
  - Treat changes to `package.json`/`pnpm-lock.yaml`, auth/session flows, secrets usage, and env handling as high-attention review areas.
  - Flag vulnerable, unnecessary, or risky dependency changes and supply-chain concerns.
  - Review workflow security posture (permissions, token use, untrusted input handling, secret exposure risk).

## Local Commands for Review
Run from repo root unless stated otherwise.

Baseline:
- `pnpm install`
- `pnpm pre-build`

Core:
- `pnpm typecheck`
- `pnpm test`
- `pnpm format`
- `pnpm build`

PR-CI parity shortcut:
- `pnpm run-pr-ci` (requires `gh act` available locally)

Targeted examples:
- `pnpm --filter brilliant-view test`
- `pnpm --filter brilliant-view-admin typecheck`
- `pnpm --filter @bv/graph-components test`
- `pnpm --filter design-docs build`

## Expected Review Output Format
Use this structure when returning a PR review:

1. `Findings` (required, highest severity first)
   - Include: severity, file path + line, issue, impact, concrete fix direction.
2. `Open Questions / Assumptions`
   - List unclear product or architecture intent that affects correctness.
3. `Validation Run`
   - Commands executed and whether they passed/failed.
4. `Summary`
   - Short risk summary and merge readiness.

If no issues are found, explicitly state: `No blocking findings found`, then list residual risks or missing test coverage.
Do not enforce a hard no-merge gate; instead, mark high-severity findings as `Crucial` and explain why they should be resolved before merge.

## Review Rules
- Focus on real defects and regression risk, not stylistic nits.
- Include style-only comments as well, but keep them clearly separated from defect/risk findings.
- Do not request broad refactors in a PR review unless they block correctness or safety.
- If suggesting a change, keep it minimal and scoped to the PR’s intent.
- When tests are missing for changed behavior, call that out explicitly as advisory and suggest concrete tests to add.
- Prefer evidence-based comments: cite exact paths and lines.
- Encourage Linear linkage conventions (`BRI-####`) when useful, but do not treat missing linkage as a blocker.
- Apply the same review strictness to CI/workflow changes as to app/package code changes.
