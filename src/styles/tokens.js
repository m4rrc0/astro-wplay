const functions = require('./functions')

const sizeBasePx = 16
const sizeMaxPx = 100
const sizeScaleSteps = 12
const sizeScaleRatio = functions.sizeScaleRatio(
  sizeBasePx,
  sizeMaxPx,
  sizeScaleSteps,
)

module.exports = {
  environmentVariables: {
    /* --- FONTS --- */
    // '--font-body-prefered': 'Literata', //* 'Literata', 'Recursive' */
    // '--font-body-critical': 'LiterataCritical', //* 'LiterataCritical' */
    '--font-body-prefered': 'Quicksand',
    '--font-body-critical': 'QuicksandCritical', //* 'LiterataCritical' */
    '--font-body-fallback': 'sans-serif',
    '--font-heading-prefered': 'Quicksand', //* 'Josefin Sans', 'Recursive' */
    '--font-heading-critical': 'QuicksandCritical', //* 'JosefinSansCritical', 'RecursiveCritical' */
    '--font-heading-fallback': 'sans-serif',
    '--font-mono-prefered': 'monospace', //* 'Fira Code', 'Recursive' */
    '--font-mono-critical': 'monospace', //* 'FiraCodeCritical' */
    '--font-mono-fallback': 'monospace',

    /* --- SIZES FOR FONTS AND SPACES --- */
    '--size-base-px': `${sizeBasePx}`, //* unitless px value of base size (if necessary) */
    '--size-max-px': `${sizeMaxPx}`, //* unitless px value of max size cross site (if necessary) */
    '--size-scale-steps': `${sizeScaleSteps}`,
    // ratio is computed with (maxSize / baseSize) ** (1 / steps)
    /* (baseSize = 16, maxSize = 100, steps = 12) => 1.16499 */
    '--size-scale-ratio': `${sizeScaleRatio}`,
    '--size-relative-ratio': '1.618',

    '--size-lock-screen-min': '20',
    '--size-lock-screen-max': '88',
    /* TODO: does not work */
    /* --fluid-min-screen-px: 400;
    --fluid-min-screen: calc(var(--fluid-min-screen-px) / var(--size-base-px));
      --fluid-max-screen-px: 600;
      --fluid-max-screen: calc(var(--fluid-max-screen-px) / (var(--size-base-max) * var(--size-base-px))); */

    /* --- WIDTHS --- */
    /* --measure-text: 65ch; */
    '--width-measure': '38rem',
    '--width-measure-relative': '38em',
    '--width-measure-ratio': '38',
    '--width-max': '75rem' /* more or less 1200px here */,
    '--width-relative-ratio': '0.618',
    '--width-narrow': '50rem',

    /* BORDER RADIUS */
    '--border-radius-s': '0.3rem',
    '--border-radius-m': '0.618rem',
    '--border-radius-l': '1rem',
    '--border-radius-circle': '50%',

    /* COLORS */

    // TESTS //
    // '--branding-padding': '20px',
    // '--branding-small': '600px',
    // '--main-color': 'orange',
  },
}
// export default {
//   environmentVariables: {
//     '--branding-padding': '20px',
//     '--branding-small': '600px',
//     '--main-color': 'orange',
//   },
// };
