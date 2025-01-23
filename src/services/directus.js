import { createDirectus, rest, authentication, readItems } from '@directus/sdk'
import Fetch from '../utils/Fetch'
import { createPath } from '@utils'
import { transformImage } from '../store/transforms/utils'
import { transformDateTime } from '../store/transforms/dates'
import { DIRECTUS_URL, DIRECTUS_EMAIL, DIRECTUS_PW } from '@utils/env'

export const client = createDirectus(DIRECTUS_URL, {
  globals: {
    fetch: Fetch,
  },
})
  .with(rest())
  .with(authentication('json', { credentials: 'include', autoRefresh: true }))

// export const client = createDirectus(DIRECTUS_URL).with(rest()).with(authentication('json'))

// Queries
const imageFields = preString => [
  preString + 'id',
  preString + 'filename_download',
  preString + 'title',
  preString + 'type',
  preString + 'filesize',
  preString + 'width',
  preString + 'height',
  preString + 'description',
  // preString + "image_alt",
  // preString + "image_title",
]
const blockFields = preString => [
  preString + `id`,
  `${preString}status`,
  `${preString}code_name`,
  `${preString}translations.languages_code`,
  `${preString}translations.title`,
  `${preString}translations.subtitle`,
  ...imageFields(`${preString}translations.featured_image.`),
  `${preString}translations.text`,
  ...imageFields(`${preString}translations.background_image.`),
  // ...imageFields(`${preString}translations.gallery.*.`),
]
const pageDataFields = preString => [
  `${preString}id`,
  `${preString}status`,
  `${preString}slug`,
  `${preString}translations.id`,
  `${preString}translations.languages_code`,
  `${preString}translations.status`,
  `${preString}translations.title`,
  `${preString}translations.description`,
  `${preString}translations.slug`,
  `${preString}translations.redirect_here`,
]

// --- START DIRECTUS --- //

export async function start() {
  let authenticated = false
  let authFailedNumber = 0
  const allowedAuthFail = 20
  const maxRetries = 3

  const authenticate = async (retryCount = 0) => {
    try {
      // First try to refresh the token
      await client.refresh()
      authenticated = true
      console.info('--SELF INFO-- DIRECTUS AUTH = OK (via refresh)')
    } catch (refreshError) {
      // If refresh fails, try login
      try {
        await client.login(DIRECTUS_EMAIL, DIRECTUS_PW)
        authenticated = true
        console.info('--SELF INFO-- DIRECTUS AUTH = OK (via login)')
      } catch (loginError) {
        console.error('Authentication failed:', loginError?.message || 'Unknown error')
        if (retryCount < maxRetries) {
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
          return authenticate(retryCount + 1)
        }
        authFailedNumber++
      }
    }
  }

  while (!authenticated && authFailedNumber < allowedAuthFail) {
    await authenticate()
  }

  if (authFailedNumber >= allowedAuthFail) {
    throw `Auth failed ${allowedAuthFail} times. Exiting Build.`
  }
}

// --- FETCH AND TRANSFORM --- //

// --- TRANSFORM FIELDS --- //

function transformPageData(page_data) {
  // TODO: flatten properly to account for overriding the first entry in the list with the next etc.
  return page_data?.[0]
}

function transformUserProfile(user_profileRaw) {
  const avatar = transformImage(user_profileRaw?.avatar || user_profileRaw?.directus_user?.avatar)

  return { ...user_profileRaw, avatar }
}

function transformBlock(blockRaw, languages) {
  const translations = blockRaw?.translations?.map(t => ({
    ...t,
    featured_image: transformImage(t.featured_image),
    background_image: transformImage(t.background_image),
    gallery: t?.gallery?.map(transformImage),
  }))
  return {
    ...blockRaw,
    translations,
  }
}

// --- FETCH LANGUAGES --- //
export const fetchLanguages = async () => {
  // await client.refresh()
  const result = await client.request(readItems('languages'))

  return result

  // TODO: Remove implementation from old sdk when ready
  // const { data: languages } = await directus.items("languages").readByQuery({
  //   limit: -1,
  //   fields: ["*"],
  // })
}

// --- F&T PAGES --- //

// export async function fetchPages() {
//   // await client.refresh()
//   // const result = await client.request(readItems("languages"))
//   return await client.request(
//     readItems('Pages', {
//       fields: [
//         '*',
//         'translations.*',
//         'main.collection',
//         'main.item.*',
//         'main.item.layout.markup',
//         'main.item.translations.*',
//       ],
//     })
//   )
// }

// --- F&T DICTIONARY --- //

export async function fetchDictionary() {
  await client.refresh()
  return await client.request(
    readItems('dictionary', {
      limit: -1,
      fields: [
        'tag_categories',
        'code_name',
        'colorPalette',
        'translations.language_code',
        'translations.default_label',
      ],
    })
  )
}

// --- F&T ARTICLES --- //

export function transformArticle(articleRaw, languages) {
  // variables
  const {
    authors: authorsRaw,
    header: headerRaw,
    main: mainRaw,
    footer: footerRaw,
  } = articleRaw || {}
  const page_data = transformPageData(articleRaw?.page_data)
  const slug = page_data?.slug

  // Booleans
  const hasNoHeader = !headerRaw || !headerRaw?.[0]
  const hasNoMain = !mainRaw || !mainRaw?.[0]
  const hasNoFooter = !footerRaw || !footerRaw?.[0]

  // Early return
  if (hasNoHeader && hasNoMain && hasNoFooter) return null

  // Computed fields
  const path = createPath({ type: 'article', slug })
  const authors = authorsRaw?.map(authorRaw => transformUserProfile(authorRaw?.user_profiles_id))
  const date_published = transformDateTime(articleRaw.date_published)
  const date_modified = transformDateTime(articleRaw.date_modified)
  const header = headerRaw?.map(i => transformBlock(i, languages))
  const main = mainRaw?.map(i => transformBlock(i, languages))
  const footer = footerRaw?.map(i => transformBlock(i, languages))

  return {
    ...articleRaw,
    path,
    authors,
    date_published,
    date_modified,
    header,
    main,
    footer,
  }
}

export async function fetchArticles() {
  // await client.refresh()

  const languages = await fetchLanguages()

  const articlesRaw = await client.request(
    readItems('articles', {
      limit: -1,
      filter: { status: { _eq: 'published' } },
      sort: '-date_published',
      fields: [
        'status',
        'code_name',
        ...pageDataFields('page_data.'),
        'authors.user_profiles_id.id',
        'authors.user_profiles_id.status',
        'authors.user_profiles_id.display_name',
        ...imageFields('authors.user_profiles_id.avatar.'),
        'authors.user_profiles_id.directus_user.id',
        'authors.user_profiles_id.directus_user.first_name',
        'authors.user_profiles_id.directus_user.last_name',
        ...imageFields('authors.user_profiles_id.directus_user.avatar.'),
        'date_published',
        'date_modified',
        ...blockFields('header.'),
        ...blockFields('main.'),
        ...blockFields('footer.'),
      ],
    })
  )

  const articles = articlesRaw?.map(a => transformArticle(a, languages))

  return articles
}
