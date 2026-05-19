import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({
    plugins: [react()],
    server: {
        port: 45678,
        proxy: {
            '/api': {
                target: 'http://localhost:38765',
                changeOrigin: true
            },
            '/ws': {
                target: 'ws://localhost:38765',
                ws: true
            }
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    }
});
