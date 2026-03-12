// Full Astro Configuration API Documentation:
// https://astro.build/config
import 'dotenv/config'
import { defineConfig } from 'astro/config'
import svelte from '@astrojs/svelte'
import sitemap from '@astrojs/sitemap'
import robotsTxt from 'astro-robots-txt'
import icon from 'astro-icon'
import mdx from '@astrojs/mdx' // import MDX files
import { PAGE_ADMIN } from './src/utils/env'
// import Biome from '@playform/format'

// @type-check enabled!
// VSCode and other TypeScript-enabled text editors will provide auto-completion,
// helpful tooltips, and warnings if your exported object is invalid.
// You can disable this by removing "@ts-check" and `@type` comments below.

const isProd = process.env.NODE_ENV === 'production'
console.log('NODE_ENV: ', process.env.NODE_ENV)
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
    // Biome(),
    mdx(), // import MDX files
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
    (await import('@playform/inline')).default({
      Logger: isProd ? 0 : 2, // default is 2
      Fonts: true, // Not sure this is still working or needed...
      Exclude: [file => /dist\/fr\/e/.test(file)],
    }),
    // (await import('astro-critters')).default({
    //   logger: 1, // default is 2
    //   fonts: true,
    //   Exclude: [file => /dist\/fr\/e/.test(file)],
    // }),
    // critters({
    //   logger: 1, // default is 2
    //   fonts: true,
    //   exclude: [file => file.startsWith('./dist/fr/e')],
    // }),
    icon(),
  ],
})