import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';
import path from 'node:path';
import url from 'node:url';

const dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    svelte({
      preprocess: sveltePreprocess(),
      compilerOptions: {
        runes: true,
      },
    }),
  ],
  server: {
    port: Number(process.env.CLIENT_PORT) || 3000,
    host: '0.0.0.0',
    allowedHosts: [
      'host.docker.internal',
      'scribble-beasts.com',
      'playtest.scribble-beasts.com',
    ],
    hmr: {
      protocol: 'wss',
      host: 'scribble-beasts.com',
    },
  },
  resolve: {
    conditions: ['browser'],
    alias: {
      '@shared': path.resolve(dirname, '../shared'),
    },
  },
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
    },
    include: ['src/**/*.{test,spec}.{js,ts}'],
    setupFiles: ['./src/setupTest.ts'],
    globals: true,
  },
});
