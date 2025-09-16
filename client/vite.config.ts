import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import sveltePreprocess from 'svelte-preprocess'

export default defineConfig({
    plugins: [svelte({
        preprocess: sveltePreprocess(),
        compilerOptions: {
            runes: true
        }
    })],
    server: {
        port: Number(process.env.CLIENT_PORT) || 3000,
        host: '0.0.0.0',
        allowedHosts: ['host.docker.internal'],
        hmr: {
            protocol: 'ws',
            host: 'localhost',
            port: Number(process.env.CLIENT_PORT) || 3000,
        },
    }
})