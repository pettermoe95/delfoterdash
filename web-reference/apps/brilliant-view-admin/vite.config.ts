import * as child from 'child_process';
import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import svgrPlugin from 'vite-plugin-svgr';

const commitHash = child.execSync('git rev-parse --short HEAD').toString();

// https://vitejs.dev/config/
export default ({ mode }: { mode: string }) => {
    process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

    return defineConfig({
        plugins: [react(), svgrPlugin()],
        resolve: {
            alias: [
                {
                    find: '~',
                    replacement: path.resolve(__dirname, './src'),
                },
            ],
        },
        define: {
            __COMMIT_HASH__: JSON.stringify(commitHash),
        },
        build: {
            target: 'es2022',
            manifest: true,
            minify: false,
            reportCompressedSize: true,
            rollupOptions: {
                output: {
                    entryFileNames: '[name]-[hash].js',
                    chunkFileNames: '[name]-[hash].js',
                    assetFileNames: '[name]-[hash].[ext]',
                },
            },
        },
        server: {
            proxy: {
                '/api': {
                    target: process.env.VITE_API_URL,
                    rewrite: (path) => path.replace(/^\/api/, ''),
                    changeOrigin: true,
                    secure: false,
                    ws: true,
                },
            },
        },
    });
};
