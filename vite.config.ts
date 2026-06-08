import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "MicroTsmRouter",
      fileName: (format) => `microtsm-router.${format}.js`,
      formats: ["es"],
    },
    rollupOptions: {
      // No external dependencies — this is a pure TS library
    },
  },
  plugins: [
    // Generate .d.ts declaration files automatically for MFE developers
    dts({
      tsconfigPath: resolve(__dirname, "tsconfig.build.json"),
      bundleTypes: true,
    }),
  ],
});
