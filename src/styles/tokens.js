const functions = require('./functions');

const sizeBasePx = 16;
const sizeMaxPx = 100;
const sizeScaleSteps = 12;
const sizeScaleRatio = functions.sizeScaleRatio(
  sizeBasePx,
  sizeMaxPx,
  sizeScaleSteps
);

module.exports = {
  environmentVariables: {
    /* --- FONTS --- */
    '--font-body-prefered': 'Literata', //* 'Literata', 'Recursive' */
    '--font-body-critical': 'LiterataCritical', //* 'LiterataCritical' */
    '--font-body-fallback': 'sans-serif',
    '--font-heading-prefered': 'Josefin Sans', //* 'Josefin Sans', 'Recursive' */
    '--font-heading-critical': 'JosefinSansCritical', //* 'JosefinSansCritical', 'RecursiveCritical' */
    '--font-heading-fallback': 'sans-serif',
    '--font-mono-prefered': 'Fira Code', //* 'Fira Code', 'Recursive' */
    '--font-mono-critical': 'FiraCodeCritical', //* 'FiraCodeCritical' */
    '--font-mono-fallback': 'monospace',

    /* --- SIZES --- */
    /* --measure-text: 65ch; */
    '--measure-text': '38rem',

    '--size-base-px': `${sizeBasePx}`, //* unitless px value of base size (if necessary) */
    '--size-max-px': `${sizeMaxPx}`, //* unitless px value of max size cross site (if necessary) */
    '--size-scale-steps': `${sizeScaleSteps}`,
    // ratio is computed with (maxSize / baseSize) ** (1 / steps)
    /* (baseSize = 16, maxSize = 100, steps = 12) => 1.16499 */
    '--size-scale-ratio': `${sizeScaleRatio}`,

    '--size-lock-screen-min': '20',
    '--size-lock-screen-max': '88',
    /* TODO: does not work */
    /* --fluid-min-screen-px: 400;
      --fluid-min-screen: calc(var(--fluid-min-screen-px) / var(--size-base-px));
      --fluid-max-screen-px: 600;
      --fluid-max-screen: calc(var(--fluid-max-screen-px) / (var(--size-base-max) * var(--size-base-px))); */

    '--branding-padding': '20px',
    '--branding-small': '600px',
    '--main-color': 'orange',
  },
};
// export default {
//   environmentVariables: {
//     '--branding-padding': '20px',
//     '--branding-small': '600px',
//     '--main-color': 'orange',
//   },
// };
