import { defineConfig } from 'cypress';
import coveragePlugin from '@cypress/code-coverage/task';

export default defineConfig({
    video: false,
    e2e: {
        baseUrl: 'http://localhost:5173',
        setupNodeEvents(on, config) {
            coveragePlugin(on, config);
            return config;
        },
    },
    component: {
        video: false,
        devServer: {
            framework: 'react',
            bundler: 'vite',
        },
    },
});
