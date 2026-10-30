# Brilliant View Frontend

This is the official Brilliant View Frontend monorepo.

It is managed with `Turborepo`, and contains several packages.

## Getting started.

Make sure to [install `pnpm`](https://pnpm.io/installation).

```bash
# Install dependendcies for all apps
pnpm install
# Setup some static files that are required to run dev scripts
pnpm pre-build
# Run all dev frontends!
pnpm dev
```

### Does nothing work?

```bash
# Reset all node modules and cache
pnpm clean
pnpm install
# Generate all required static assets
pnpm pre-build
```

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

-   `brilliant-view`: The Brilliant View frontend! 🚀
-   `components-playground`: Playground for testing Brilliant Components 🧪
-   `@bv/graph-components`: Graph components for Brilliant View 📈
-   `@brilliant/components`: Base Component Library for Brilliant Projects 🧱
-   `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
-   `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

-   [TypeScript](https://www.typescriptlang.org/) for static type checking
-   [ESLint](https://eslint.org/) for code linting
-   [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```bash
pnpm build
```

### Develop

To develop all apps and packages, run the following command:

```bash
pnpm dev
```

## WIP: REMOVE OR REWRITE TEMPLATE BELOW

### Remote Caching

Turborepo can use a technique known as [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup), then enter the following commands:

```
cd my-turborepo
npx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
npx turbo link
```

## Useful Links

Learn more about the power of Turborepo:

-   [Tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
-   [Caching](https://turbo.build/repo/docs/core-concepts/caching)
-   [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
-   [Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
-   [Configuration Options](https://turbo.build/repo/docs/reference/configuration)
-   [CLI Usage](https://turbo.build/repo/docs/reference/command-line-reference)

## Code style and formatting

As per now, it looks like we are using the following code style and formatting:

### Naming

-   Use `camelCase` for variables and functions.
-   Use `PascalCase` for classes and React components.
-   Use `UPPER_CASE` for constants.
-   Use `kebab-case` for directories.
-   Use `PascalCase` for files. (We have diverging practices here, but even maybe we should use `PascalCase` for component files and `camelCase` for utility, hooks and context provider files.)

## Release frontend

### Steps:

1. Tag the desired point in the repository's history and push it to origin
    ```bash
    git tag
    git push origin <tagname>
    ```
2. Run the [release frontend workflow](https://github.com/Brilliant-AS/brilliant_view_frontend/actions/workflows/release_frontend.yml) from github actions with the desired tag and environment (The release admin panel has its own [workflow](https://github.com/Brilliant-AS/brilliant_view_frontend/actions/workflows/release_admin_panel.yml))
3. Create a new [release](https://github.com/Brilliant-AS/brilliant_view_frontend/releases) with the new released tag
