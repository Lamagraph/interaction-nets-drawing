import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import istanbul from 'vite-plugin-istanbul';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
    base: '/interaction-nets-drawing/',
    plugins: [
        react(),
        istanbul({
            cypress: true,
            include: 'src/*',
            extension: ['.js', '.jsx', '.ts', '.tsx'],
            requireEnv: false,
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@flows': path.resolve(__dirname, './src/flows'),
            '@components': path.resolve(__dirname, './src/views'),
            '@utils': path.resolve(__dirname, './src/utils'),
            '@layouts': path.resolve(__dirname, './src/layouts'),
        },
    },
    build: {
        sourcemap: true,
    },
    test: {
        coverage: {
            provider: 'istanbul',
        },
    },
});
