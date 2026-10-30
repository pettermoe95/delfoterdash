import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './tests/setup.ts',
        includeSource: ['src/**/*.{ts,tsx}'],
    },
    resolve: {
        alias: [
            {
                find: '~',
                replacement: path.resolve(__dirname, './src'),
            },
        ],
    },
});
