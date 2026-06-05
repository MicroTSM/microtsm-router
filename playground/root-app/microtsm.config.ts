import { defineRootAppConfig } from "@microtsm/cli";

export default defineRootAppConfig({
  cssImportMap: ["./public/importmaps/stylesheets.json"],
  importMap: [
    "./public/importmaps/core-importmap.json",
    "./public/importmaps/modules-importmap.json",
  ],
  moduleLoader:
    "https://cdn.jsdelivr.net/npm/microtsm@0.0.76/dist/module-loader/index.js",
});
