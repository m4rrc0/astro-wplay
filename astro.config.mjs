// Full Astro Configuration API Documentation:
// https://docs.astro.build/reference/configuration-reference

// @type-check enabled!
// VSCode and other TypeScript-enabled text editors will provide auto-completion,
// helpful tooltips, and warnings if your exported object is invalid.
// You can disable this by removing "@ts-check" and `@type` comments below.

// REMARK: was necessary as Astro wasn't handling private env vars properly
// import dotenv from 'dotenv'
// import fs from 'fs/promises'
// const env = dotenv.parse(await fs.readFile('.env'))

// @ts-check
export default /** @type {import('astro').AstroUserConfig} */ ({
  // Comment out "renderers: []" to enable Astro's default component support.
  // renderers: [],
  vite: {
    // REMARK: was necessary as Astro wasn't handling private env vars properly
    // expose private env var on the server only
    // as seen on https://github.com/withastro/astro/issues/1765
    // define: {
    //   'process.env.DIRECTUS_URL': `"${env.DIRECTUS_URL}"`,
    //   'process.env.DIRECTUS_EMAIL': `"${env.DIRECTUS_EMAIL}"`,
    //   'process.env.DIRECTUS_PW': `"${env.DIRECTUS_PW}"`,
    // },
    // NOTE: necessary for astro-icon apparently (https://github.com/natemoo-re/astro-icon)
    ssr: {
      external: ['svgo'],
    },
  },
})
