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

export function createPath({ locale = 'fr', type, slug, event, organization }) {
  if (type === 'events') return `${locale}/e`
  if (type === 'event') return `${locale}/e/${slug}`
  if (type === 'organizations') return `${locale}/o`
  if (type === 'organization') return `${locale}/o/${slug}`
  if (type === 'articles') return `${locale}/a`
  if (type === 'article') return `${locale}/a/${slug}`

  if (event) return `${locale}/e/${event.slug}`
  if (organization) return `${locale}/o/${organization.slug}`
  return null
}
