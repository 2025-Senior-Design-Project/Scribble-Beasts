import { defineConfig } from 'vite';
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
    allowedHosts: ['host.docker.internal', 'scribble-beasts.com'],
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: Number(process.env.CLIENT_PORT) || 3000,
    },
  },
  resolve: {
    alias: {
      '@shared': path.resolve(dirname, '../shared'),
    },
  },
});
