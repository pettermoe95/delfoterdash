import baseConfig from "@repo/eslint-config/base";
import reactConfig from "@repo/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
    {
        ignores: ["!node_modules/*", "config/", "scripts/", "!.storybook"],
    },
    ...baseConfig,
    ...reactConfig,
];
