// @ts-check
import { defineConfig } from "astro/config";

import netlify from "@astrojs/netlify";

import db from "@astrojs/db";

// https://astro.build/config
export default defineConfig({
  output: "server",

  i18n: {
    locales: ["es", "en"],
    defaultLocale: "en",
    // routing: "manual",
  },

  adapter: netlify(),
  integrations: [db()],
});