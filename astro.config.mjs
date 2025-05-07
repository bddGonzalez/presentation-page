// @ts-check
import { defineConfig } from "astro/config";

import netlify from "@astrojs/netlify";

// https://astro.build/config
export default defineConfig({
  output: "server",

  i18n: {
    locales: ["es", "en"],
    defaultLocale: "en",
    // routing: "manual",
  },

  adapter: netlify(),
});
