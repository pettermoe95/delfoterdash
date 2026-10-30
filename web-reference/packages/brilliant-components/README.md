# Brilliant React Components

Generic react component library for Brilliant View.

# Getting Started

Installing:

-   Install dependencies: `yarn install`
-   Run storybook (shows all components): `yarn storybook`

Local code verification:

-   Run eslint (checks common mistakes and fixes formatting): `yarn eslint`
-   Run type compiler check (checks for invalid type usage): `yarn tsc`
-   Run all checks: `yarn verify`

Stylelint is still work in progress. Used to verify SCSS usage. Run stylelint: `yarn stylelint`

# Deployment

-   The project uses vite for building. See `vite.config.ts`.
    -   Vite compiles the typescript while providing type declarations
    -   Rollup options ensures component libary uses the react/react DOM from the parent project.
-   The entry point `src/main.ts` must export every component to be used
-   This exposes components to be imported like this:

```ts
import { Button } from "@brilliant/components";
```
