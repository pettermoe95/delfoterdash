import * as child from 'child_process';
import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import svgrPlugin from 'vite-plugin-svgr';

const commitHash = child.execSync('git rev-parse --short HEAD').toString();

// https://vitejs.dev/config/
// eslint-disable-next-line import/no-default-export
export default ({ mode }: { mode: string }) => {
    process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

    const isCI =
        process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';

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
            // Generate sourcemaps only if we are not running in a CI pipeline,
            // to avoid large memory usage and pointless maps during CI builds.
            sourcemap: !isCI,
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
                    target: process.env.VITE_API_URL
                        ? process.env.VITE_API_URL
                        : 'http://0.0.0.0:4040/api',
                    rewrite: (path) => path.replace(/^\/api/, ''),
                    changeOrigin: true,
                    secure: false,
                    ws: true,
                },
                '/ws': {
                    target: 'http://0.0.0.0:4040/',
                    changeOrigin: true,
                    secure: false, // Set to true if your target uses HTTPS with a valid certificate
                    ws: true, // Enable WebSocket proxying
                },
            },
        },
    });
};
