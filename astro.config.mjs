// Full Astro Configuration API Documentation:
// https://astro.build/config
import "dotenv/config"
import { defineConfig } from "astro/config"
import svelte from "@astrojs/svelte"
import sitemap from "@astrojs/sitemap"
import robotsTxt from "astro-robots-txt"
import critters from "astro-critters"

const PAGE_ADMIN = process.env.PAGE_ADMIN || null

// @type-check enabled!
// VSCode and other TypeScript-enabled text editors will provide auto-completion,
// helpful tooltips, and warnings if your exported object is invalid.
// You can disable this by removing "@ts-check" and `@type` comments below.

// @ts-check
export default defineConfig({
  site: "https://www.wanna-play.be/",
  integrations: [
    svelte(),
    sitemap({
      filter: (page) =>
        !page.match(/\/(styleguide|email-error)\/$/) &&
        !(PAGE_ADMIN && page.endsWith(`${PAGE_ADMIN}/`)),
    }),
    robotsTxt({
      policy: [
        {
          userAgent: "*",
          allow: "/",
          disallow: ["/styleguide", "/email-error"],
        },
      ],
    }),
    critters({
      logger: 1, // default is 2
      fonts: true,
      exclude: [(file) => file.startsWith("./dist/fr/e")],
    })
  ]
})
