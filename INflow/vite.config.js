import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import istanbul from 'vite-plugin-istanbul';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        istanbul({
            cypress: true,
            include: 'src/*',
            extension: ['.js', '.jsx', '.ts', '.tsx'],
            requireEnv: false
        }),
    ],
    test: {
        coverage: {
            provider: 'istanbul',
        },
    },
});
