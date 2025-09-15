// @ts-check

import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  vite: {
    envPrefix: "OIDC_",
    plugins: [tailwindcss()],
  },

  integrations: [react()],
});
