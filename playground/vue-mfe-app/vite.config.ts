import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) =>
            ["router-link", "router-view"].includes(tag),
        },
      },
    }),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      external: ["vue", "@microtsm/vue", "@microtsm/router"],
    },
  },
});
