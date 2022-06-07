export * from './areas/be.js'

export function slugify(string) {
  const a =
    'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìıİłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
  const b =
    'aaaaaaaaaacccddeeeeeeeegghiiiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------'
  const p = new RegExp(a.split('').join('|'), 'g')

  return string
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(p, (c) => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}

export function createPath({ locale = 'fr', type, slug }) {
  if (type === 'home') return `${locale}`
  if (type === 'events') return `${locale}/e`
  if (type === 'event') return `${locale}/e/${slug}`
  if (type === 'organizations') return `${locale}/o`
  if (type === 'organization') return `${locale}/o/${slug}`
  if (type === 'articles') return `${locale}/a`
  if (type === 'article') return `${locale}/a/${slug}`
  if (type === 'areas') return `${locale}/be`
  if (type === 'area') return `${locale}/be/${slugify(slug)}`

  return null
}

export async function io(Astro) {
  const { slots } = Astro
  const { $skip, $skipNoInner, ...props } = Astro.props

  let content = ''
  if (slots.has('default')) {
    content = (await slots?.render('default')) || ''
  }

  const $render =
    !($skip === true) && !($skipNoInner === true && content === '')

  return { ...Astro, props, $render }
}
export const conditionalRendering = io

// Directus API info: https://docs.directus.io/reference/files/#requesting-a-thumbnail
export function imageDirectusSrc({
  src: srcRaw,
  fit,
  width,
  height,
  quality,
  withoutEnlargement,
  format,
}) {
  const querryParams = {
    fit,
    width,
    height,
    quality,
    withoutEnlargement,
    format,
  }
  if (!srcRaw) return srcRaw

  const querryString = Object.entries(querryParams)
    .map(([param, val]) => {
      return (typeof val).match(/undefined|null/) ? val : `${param}=${val}`
    })
    .filter((e) => e)
    .join('&')
  // console.log({querryParams, querryString})
  const src = `${srcRaw}${querryString ? '?' + querryString : ''}`

  return src
}
