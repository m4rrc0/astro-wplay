// Full Astro Configuration API Documentation:
// https://astro.build/config
import { defineConfig } from 'astro/config'
import svelte from '@astrojs/svelte'
import sitemap from '@astrojs/sitemap'
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'
import critters from 'astro-critters'
import { astroImageTools } from 'astro-imagetools'

// @type-check enabled!
// VSCode and other TypeScript-enabled text editors will provide auto-completion,
// helpful tooltips, and warnings if your exported object is invalid.
// You can disable this by removing "@ts-check" and `@type` comments below.

// @ts-check
export default defineConfig({
  experimental: {
    integrations: true,
  },
  site: 'https://www.wanna-play.be/',
  integrations: [
    svelte(),
    sitemap({
      filter: (page) => page !== 'https://www.wanna-play.be/styleguide',
    }),
    critters(),
    astroImageTools,
  ],
  vite: {
    // NOTE: necessary for astro-icon apparently (https://github.com/natemoo-re/astro-icon)
    ssr: {
      external: ['svgo'],
    },
    plugins: [viteCommonjs()],
  },
})
