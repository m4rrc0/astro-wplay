export const eleventyFetchOptions = {
  duration: process.env.ELEVENTY_FETCH_DURATION || '0s',
  verbose: process.env.ELEVENTY_FETCH_VERBOSE === 'true',
  type: process.env.ELEVENTY_FETCH_TYPE || 'buffer',
  returnType: process.env.ELEVENTY_FETCH_RETURN_TYPE || undefined,
  directory: process.env.ELEVENTY_FETCH_DIRECTORY || '.cache',
  removeUrlQueryParams: process.env.ELEVENTY_FETCH_REMOVE_URL_QUERY_PARAMS === 'true',
  concurrency: Number(process.env.ELEVENTY_FETCH_CONCURRENCY) || 10,
}

export const DIRECTUS_URL = import.meta.env.DIRECTUS_URL || process.env.DIRECTUS_URL
export const DIRECTUS_EMAIL = import.meta.env.DIRECTUS_EMAIL || process.env.DIRECTUS_EMAIL
export const DIRECTUS_PW = import.meta.env.DIRECTUS_PW || process.env.DIRECTUS_PW
export const ENV = import.meta.env.MODE || process.env.NODE_ENV // 'development' or 'production'
export const PAGE_ADMIN = import.meta.env.PAGE_ADMIN || process.env.PAGE_ADMIN || null
