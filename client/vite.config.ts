/// <reference types="vitest" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/app',

  server: {
    port: 3000,

    proxy: {
      '/api': 'http://127.0.0.1:8080',
    },
  },

  build: {
    outDir: '../dist/app',
  },

  plugins: [react()],

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
});
