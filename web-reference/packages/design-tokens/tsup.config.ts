import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/tokens/index.ts'],
    format: ['esm', 'cjs'],
    splitting: false,
    sourcemap: true,
    clean: true,
    dts: {
        compilerOptions: {
            ignoreDeprecations: '6.0',
        },
    },
});
