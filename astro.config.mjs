// Full Astro Configuration API Documentation:
// https://astro.build/config
import 'dotenv/config'
import { defineConfig } from 'astro/config'
import svelte from '@astrojs/svelte'
import sitemap from '@astrojs/sitemap'
import robotsTxt from 'astro-robots-txt'
import critters from 'astro-critters'
import icon from 'astro-icon'
import { PAGE_ADMIN } from './src/utils/env'
import Biome from '@playform/format'

// @type-check enabled!
// VSCode and other TypeScript-enabled text editors will provide auto-completion,
// helpful tooltips, and warnings if your exported object is invalid.
// You can disable this by removing "@ts-check" and `@type` comments below.

// @ts-check
export default defineConfig({
  site: 'https://www.wanna-play.be/',
  cacheDir: '.cache',
  image: {
    // Allow Astro image optimization on CMS images.
    // NOTE: Only usefull if we want to process images with Astro instead of serving directly from the CMS.
    domains: ['cms.wanna-play.be'],
  },
  integrations: [
    Biome(),
    svelte(),
    sitemap({
      filter: page =>
        !page.match(/\/(styleguide|email-error)\/$/) &&
        !(PAGE_ADMIN && page.endsWith(`${PAGE_ADMIN}/`)),
    }),
    robotsTxt({
      host: 'wanna-play.be',
      policy: [
        {
          userAgent: '*',
          allow: '/',
          disallow: ['/styleguide', '/email-error'],
        },
      ],
    }),
    (await import('astro-critters')).default({
      logger: 1, // default is 2
      fonts: true,
      exclude: [file => file.startsWith('./dist/fr/e')],
    }),
    // critters({
    //   logger: 1, // default is 2
    //   fonts: true,
    //   exclude: [file => file.startsWith('./dist/fr/e')],
    // }),
    icon(),
  ],
})
