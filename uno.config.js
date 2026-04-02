import path from 'node:path'
import {
  defineConfig,
  // presetAttributify,
  // presetIcons,
  // presetTypography,
  // presetWebFonts,
  presetWind4,
  // transformerDirectives,
  // transformerVariantGroup
} from 'unocss'
import presetWebFonts from '@unocss/preset-web-fonts'
import { createLocalFontProcessor } from '@unocss/preset-web-fonts/local'
// import presetWind4 from '@unocss/preset-wind4'
import layoutRules from './src/utils/unoCssRules/ctx-layouts.js'
import utilitiesRules from './src/utils/unoCssRules/ctx-utilities.js'
import atomsRules from './src/utils/unoCssRules/ctx-atoms.js'

// Some Wind4 rules are colliding with our own rules
const presetWind4mod = presetWind4({
  preflights: {
    reset: false,
    // theme: false,
  },
})
const hRegexCollides = /^(?:size-)?(min-|max-)?([wh])-?(.+)$/
// Force '-' between w or h and the number or attribute. E.g. h-10 not h10
// To avoid collision with our own rules for heading styles .h1, .h6, .h000, .h8
const hRegexReplacement = /^(?:size-)?(min-|max-)?([wh])-(.+)$/
const modRuleIndex = presetWind4mod.rules.findIndex(
  ruleArr => ruleArr[0].source === hRegexCollides.source
)
presetWind4mod.rules[modRuleIndex][0] = hRegexReplacement

export default defineConfig({
  preflights: [
    // { getCSS: ({ theme }) => `` },
    { getCSS: () => `a[href^="mailto:"] b {display: none;}` },
  ],
  rules: [...layoutRules, ...utilitiesRules, ...atomsRules],
  // shortcuts: [
  //   // ...
  // ],
  // theme: {
  //   colors: {
  //     // ...
  //   }
  // },
  presets: [
    presetWebFonts({
      provider: 'fontsource', // 'google' | 'bunny' | 'fontshare' | 'fontsource' | 'coollabs' | 'none'
      fonts: {
        // Add your custom fonts here
      },
      extendTheme: false, // default: true
      // themeKey: "fontFamily", // default: 'fontFamily'
      inlineImports: true, // default: true
      processors: createLocalFontProcessor({
        cacheDir: path.join('.cache', 'unocss', 'fonts'), // Directory to cache the fonts
        fontAssetsDir: 'public/assets/fonts', // Placed in public for fast resolution by Astro during dev
        fontServeBaseUrl: '/assets/fonts', // Base URL to serve the fonts from the client
        // fetch: async (url) => {
        //   console.log({ url });
        //   return fetch(url);
        // }, // Custom fetch function to download the fonts
      }),
    }),
    presetWind4mod,
    //   presetAttributify(),
    //   presetIcons(),
    //   presetTypography(),
  ],
  // transformers: [
  //   transformerDirectives(),
  //   transformerVariantGroup(),
  // ],
})
