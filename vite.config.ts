/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // The production build is served from a GitHub Pages *project* site at
  // /tempo-test-assesment/, so its asset URLs must carry that prefix (a default
  // base of '/' would 404 every JS/CSS chunk there). Dev and tests stay at '/'
  // so the local server and e2e specs need no path juggling.
  base: command === 'build' ? '/tempo-test-assesment/' : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    // Playwright specs live in e2e/ and must not be picked up by Vitest.
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
  },
}))
