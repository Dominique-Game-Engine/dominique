import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  base: "./",
  build: {
    lib: {
      entry: resolve(__dirname, "./src/dominique/index.ts"),
      name: "dominique",
      fileName: "dominique"
    }
  }
});