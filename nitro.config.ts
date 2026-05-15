import { defineConfig } from "nitro";

export default defineConfig({
  routes: {
    "/**": "./src/index.ts",
  },
});
