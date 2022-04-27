// Full Astro Configuration API Documentation:
// https://astro.build/config
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'

// @type-check enabled!
// VSCode and other TypeScript-enabled text editors will provide auto-completion,
// helpful tooltips, and warnings if your exported object is invalid.
// You can disable this by removing "@ts-check" and `@type` comments below.

// @ts-check
export default defineConfig({
  // your configuration options here...
  site: 'https://www.wanna-play.be/',
  // trailingSlash: 'always', // 'always' is the default
  integrations: [
    sitemap({
      filter: (page) => page !== 'https://www.wanna-play.be/styleguide',
    }),
  ],
  vite: {
    // NOTE: necessary for astro-icon apparently (https://github.com/natemoo-re/astro-icon)
    ssr: {
      external: ['svgo'],
    },
    plugins: [viteCommonjs()],
  },
})
