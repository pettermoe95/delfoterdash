import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgrPlugin from 'vite-plugin-svgr';
import dts from 'vite-plugin-dts';
import path from 'path';
import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
// eslint-disable-next-line import/no-default-export
export default defineConfig(({ mode }) => ({
    plugins: [
        react(),
        viteTsconfigPaths(),
        // svgrPlugin(),
        dts({
            insertTypesEntry: true,
        }),
    ],
    test: {
        environment: 'jsdom',
        setupFiles: ['./src/setupTests.ts'],
    },
    resolve: {
        alias: [
            {
                find: '~',
                replacement: path.resolve(__dirname, './src'),
            },
        ],
        conditions: mode === 'test' ? ['browser'] : [],
    },
    build: {
        manifest: true,
        minify: false,
        reportCompressedSize: true,
        emptyOutDir: process.env.NODE_ENV !== 'development',
        lib: {
            entry: path.resolve(__dirname, 'src/main.ts'),
            fileName: 'main',
            formats: ['es', 'cjs'],
        },
        rollupOptions: {
            external: ['react', 'react-dom', 'tailwindcss'],
            output: {
                globals: {
                    react: 'react',
                    'react-dom': 'react-dom',
                },
            },
        },
    },
}));
