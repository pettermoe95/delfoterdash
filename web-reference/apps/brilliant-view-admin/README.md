# React + TypeScript + Vite

## Delfoter games without a backend

From the repository root:

```sh
pnpm --filter brilliant-view-admin dev:arcade
```

Open http://127.0.0.1:7576/delfoter-arcade (the root URL also opens the arcade).
Both games work without an API. This mode uses a local player profile, skips
authentication requests, and binds the dev server to the loopback interface.
The sidebar shows **Delfoter / Local Player**. Logging out returns to the arcade;
there is no backend session to end. Other admin features still require an API.

Stop the server and use the normal `pnpm --filter brilliant-view-admin dev`
command to restore real authentication. The bypass is only enabled when
`VITE_LOCAL_AUTH_BYPASS=true` **and** Vite is running in development. Production
builds always use real authentication, including builds using `--mode arcade`.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

-   [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
-   [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

-   Configure the top-level `parserOptions` property like this:

```js
export default {
    // other rules...
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['./tsconfig.json', './tsconfig.node.json'],
        tsconfigRootDir: __dirname,
    },
};
```

-   Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
-   Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
-   Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
