# Delfoter games — Unreal Engine port reference

The `web-reference/` directory contains the complete tracked frontend source snapshot from `brilliant_view_frontend` commit `2e5b85cd73fae465fe7be78595347dbc2f093289` (`delfoter dash!`). All three games and their assets are included, together with the workspace packages and build configuration they depend on. `SOURCE_SNAPSHOT.json` records the commit and SHA-256 of every copied file.

This is the original React/TypeScript implementation, ready to use as a behavioral and visual reference for an Unreal Engine port. No Unreal project or C++/Blueprint conversion has been created yet. Keep the Unreal project separate from `web-reference/` so the original implementation remains available for comparison.

## Where the games live

Paths below are relative to `web-reference/apps/brilliant-view-admin/`.

| Game / feature | Source | Assets |
| --- | --- | --- |
| Delfoter Dash | `src/site/delfoter-dash/` | `public/delfoter-dash/` |
| Delfoter TD: AI Takeover | `src/site/delfoter-td/` | `public/delfoter-td/` |
| Delfoter Adventure | `src/site/DelfoterAdventurePage.tsx`, `src/site/delfoter/` | Pixel/canvas art is generated in code |
| Arcade picker and music | `src/site/DelfoterArcadePage.tsx`, `src/site/arcade-lobby/` | `public/delfoter-arcade/` |
| Music generators | `scripts/generate-dash-soundtracks.mjs`, `scripts/generate-arcade-soundtrack.mjs` | Generated WAV files are included |

Dash's `levels.ts`, `worlds.ts`, `types.ts`, and `engine.ts` define its courses, progression, entities, and physics. TD's `towers.ts`, `enemies.ts`, `waves.ts`, `maps.ts`, and combat modules define its configurable units and gameplay. Both directories include further README documentation and focused tests. Much of the artwork and sound effects is drawn or synthesized in TypeScript rather than stored as importable sprites or audio files.

## Run the original games locally

From `web-reference/`, with Node.js 22 and pnpm 9.5.0:

```sh
corepack pnpm install
corepack pnpm pre-build
corepack pnpm --filter brilliant-view-admin dev:arcade
```

Open `http://127.0.0.1:7576/delfoter-arcade`. The existing arcade development mode enables the local auth bypass so the games can be tested without a working backend.

The source repository's Git history, installed dependencies, untracked local files, and generated build outputs are not copied. This repository's own `.git` directory is preserved. The original frontend deployment workflows are retained inside the reference directory, not installed as workflows for this new repository.
