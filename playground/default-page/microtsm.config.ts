import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from '@microtsm/cli';
import vuePlugin from '@vitejs/plugin-vue';

export default defineConfig({
    plugins: [vuePlugin()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    build: {
        rollupOptions: {
            external: ['vue', '@microtsm/vue', 'vue-router'],
        },
    },
    server: {
        port: 4177,
    },
    preview: {
        port: 4177,
    },
});
