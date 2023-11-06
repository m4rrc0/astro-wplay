import { Directus } from '@directus/sdk'
import { slugify, createPath, areasBe } from '@utils'

const DIRECTUS_URL = import.meta.env.DIRECTUS_URL || process.env.DIRECTUS_URL
const DIRECTUS_EMAIL =
  import.meta.env.DIRECTUS_EMAIL || process.env.DIRECTUS_EMAIL
const DIRECTUS_PW = import.meta.env.DIRECTUS_PW || process.env.DIRECTUS_PW
const ENV = import.meta.env.MODE || process.env.NODE_ENV // 'development' or 'production'

export const directus = new Directus(DIRECTUS_URL)

// --- STATIC VALUES --- //

const cmsBaseUrl = DIRECTUS_URL
const cmsAssetsUrl = `${cmsBaseUrl}/assets`

const imageFields = (preString) => [
  preString + 'id',
  preString + 'filename_download',
  preString + 'title',
  preString + 'type',
  preString + 'filesize',
  preString + 'width',
  preString + 'height',
  preString + 'description',
  preString + 'image_alt',
  preString + 'image_title',
]
const blockFields = (preString) => [
  preString + `id`,
  `${preString}status`,
  `${preString}code_name`,
  `${preString}translations.languages_code`,
  `${preString}translations.title`,
  `${preString}translations.subtitle`,
  ...imageFields(`${preString}translations.featured_image.`),
  `${preString}translations.text`,
  ...imageFields(`${preString}translations.background_image.`),
  ...imageFields(`${preString}translations.gallery.*.`),
]
const pageDataFields = (preString) => [
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
export const areas = [
  { code_name: 'antwerp', fr: 'Anvers' },
  { code_name: 'flemish-brabant', fr: 'Brabant Flamand' },
  { code_name: 'walloon-brabant', fr: 'Brabant Wallon' },
  { code_name: 'brussels', fr: 'Bruxelles' },
  { code_name: 'west-flanders', fr: 'Flandre Occidentale' },
  { code_name: 'east-flanders', fr: 'Flandre Orientale' },
  { code_name: 'hainaut', fr: 'Hainaut' },
  { code_name: 'liege', fr: 'Liège' },
  { code_name: 'limburg', fr: 'Limbourg' },
  { code_name: 'luxembourg', fr: 'Luxembourg' },
  { code_name: 'namur', fr: 'Namur' },
].map((a) => {
  const slug = { fr: slugify(a.fr) }
  const path = { fr: createPath({ type: 'area', slug: slug.fr }) }
  const name = { fr: a.fr }
  return {
    code_name: a.code_name,
    name,
    slug,
    path,
  }
})
/* prettier-ignore */
const dico = [
  // links names
  { code_name: 'website', fr: 'Site web', iconName: 'ph:link' },
  { code_name: 'web_page', fr: 'Page web', iconName: 'ph:link' },
  { code_name: 'facebook_page', fr: 'Page Facebook', iconName: 'ph:facebook-logo' },
  { code_name: 'facebook_event', fr: 'Événement Facebook', iconName: 'ph:facebook-logo' },
  { code_name: 'twitter', fr: 'Twitter', iconName: 'ph:twitter-logo' },
  { code_name: 'instagram', fr: 'Instagram', iconName: 'ph:instagram-logo' },
  { code_name: 'youtube_channel', fr: 'Youtube', iconName: 'ph:youtube-logo' },

  { code_name: 'spotify', fr: 'Spotify', iconName: 'ph:spotify-logo' },
  { code_name: 'shop', fr: 'Boutique', iconName: 'ph:shopping-cart-simple' },
  { code_name: 'tripadvisor', fr: 'Tripadvisor', iconName: 'cib:tripadvisor' },
  { code_name: 'facebook_group', fr: 'Groupe Facebook', iconName: 'ph:facebook-logo' },
  { code_name: 'forum', fr: 'Forum', iconName: 'ph:chats' },
  { code_name: 'talk', fr: 'Le Talk', iconName: 'ri:kakao-talk-line' },
  // Areas
  ...areas,
  // Organization types
  { code_name: 'association', fr: 'Association' },
  { code_name: 'club', fr: 'Club' },
  { code_name: 'bar', fr: 'Bar' },
  { code_name: 'restaurant', fr: 'Restaurant' },
  { code_name: 'toy_library', fr: 'Ludothèque' },
  { code_name: 'shop', fr: 'Boutique' },
  { code_name: 'festival', fr: 'Festival' },
  { code_name: 'escape_room', fr: 'Escape Room' },
  // Days of week
  { code_name: 'monday', fr: 'Lundi' },
  { code_name: 'tuesday', fr: 'Mardi' },
  { code_name: 'wednesday', fr: 'Mercredi' },
  { code_name: 'thursday', fr: 'Jeudi' },
  { code_name: 'friday', fr: 'Vendredi' },
  { code_name: 'saturday', fr: 'Samedi' },
  { code_name: 'sunday', fr: 'Dimanche' },
  // Games services
  { code_name: 'yes_games', fr: 'Jeux sur place' },
  { code_name: 'animators', fr: 'Animateurs' },
  { code_name: 'buy_new', fr: 'Achat neuf' },
  { code_name: 'buy_used', fr: "Achat d'occasion" },
  { code_name: 'video_games', fr: 'Jeux vidéos' },
  // Amenities
  { code_name: 'snacks', fr: 'Snacks' },
  { code_name: 'drinks', fr: 'Boissons' },
  { code_name: 'food', fr: 'Nourriture' },
  { code_name: 'vegetarian', fr: 'Végétarien' },
  { code_name: 'vegan', fr: 'Végan' },
  { code_name: 'handicapped', fr: 'Accessible' },
  { code_name: 'children', fr: 'Enfants bienvenus' },
]

// --- UTILITY FUNCTIONS --- //

const translateFromCodeName = (code_name) => {
  const match = dico.find((el) => el.code_name === code_name)

  if (!match) {
    console.warn(
      `--SELF WARNING-- No match in dico for code_name '${code_name}'`,
    )
    return {
      code_name,
      fr: code_name,
    }
  }

  return match
}

const reduceTranslatedMarkdown = ({ translations, fieldName }) =>
  translations.reduce(
    (accu, current) => ({
      ...accu,
      [current.languages_code]: { markdown: current[fieldName] },
    }),
    {},
  )

function removeEmptyPropOnObject(obj) {
  if (typeof obj === 'object' && !Array.isArray(obj)) {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v || v === false),
    )
  }
  return obj
}

const translationFromCode = (translations, code) =>
  removeEmptyPropOnObject(
    translations?.find((translation) => translation.languages_code === code),
  )

// --- START DIRECTUS --- //

export async function start() {
  // But, we need to authenticate if data is private
  let authenticated = false

  // Try to authenticate with token if exists
  await directus.auth
    .refresh()
    .then(() => {
      authenticated = true
    })
    .catch(() => {})

  // Let's login in case we don't have token or it is invalid / expired
  while (!authenticated) {
    await directus.auth
      .login({ email: DIRECTUS_EMAIL, password: DIRECTUS_PW })
      .then(() => {
        authenticated = true
        console.info('--SELF INFO-- DIRECTUS AUTH = OK')
      })
      .catch(() => {
        console.error('Invalid credentials')
      })
  }
}

// --- FETCH AND TRANSFORM --- //

// --- TRANSFORM FIELDS --- //

const transformDateTime = (str) => {
  if (!str) return str

  const hasTime = str?.length > 10

  const dateOptions = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
  const timeOptions = { hour: '2-digit', minute: '2-digit' }

  const date = new Date(str)
  return {
    dateTimeRaw: str,
    hasTime,
    fr: {
      date: date.toLocaleDateString('fr', dateOptions),
      ...(hasTime
        ? {
            time: date.toLocaleTimeString('fr', timeOptions),
            hours: date.toLocaleTimeString('fr', { hour: '2-digit' }),
            minutes: date.toLocaleTimeString('fr', { minute: '2-digit' }),
          }
        : {}),
      weekday: date.toLocaleDateString('fr', { weekday: 'short' }),
      day: date.toLocaleDateString('fr', { day: 'numeric' }),
      month: date.toLocaleDateString('fr', { month: 'short' }),
      monthShort: date.toLocaleDateString('fr', { month: 'short' }),
      monthLong: date.toLocaleDateString('fr', { month: 'long' }),
      year: date.toLocaleDateString('fr', { year: 'numeric' }),
    },
  }
}

const transformLink = ({ name, url }) => {
  const linkNameTranslated = translateFromCodeName(name)
  let { iconName } = linkNameTranslated

  if (!iconName) {
    console.warn(`--SELF WARNING-- No icon found with code_name '${name}'`)
    iconName = 'ph:question'
  }

  return {
    name: linkNameTranslated,
    url,
    iconName,
  }
}

function transformImage(i) {
  return i?.id
    ? {
        ...i,
        src: `${cmsAssetsUrl}/${i?.id}`,
      }
    : i
}

function transformAddress(address) {
  const a = (address?.[0]?.zip && address?.[0]) || (address?.zip && address)
  if (!a) return null

  const string = [
    [a.street, a.number].filter((z) => z).join(' '),
    [a.zip, a.city].filter((z) => z).join(' '),
  ]
    .filter((z) => z)
    .join(', ')
  const gMapLink = `https://maps.google.com/maps?q=${string.replace(
    /\s/g,
    '+',
  )}+belgium`

  let area = areasBe.find(
    (area) => a.zip >= area.zipMin && a.zip <= area.zipMax,
  )
  if (!area)
    console.warn(`--SELF WARNING-- ZIP missing for address: '${string}'`)

  area = area && {
    ...area,
    ...translateFromCodeName(area.code_name),
  }

  return { ...a, string, gMapLink, area }
}

function transformPageData(page_data) {
  // TODO: flatten properly to account for overriding the first entry in the list with the next etc.
  return page_data?.[0]
}

function transformUserProfile(user_profileRaw) {
  const avatar = transformImage(
    user_profileRaw?.avatar || user_profileRaw?.directus_user?.avatar,
  )

  return { ...user_profileRaw, avatar }
}

function transformBlock(blockRaw, languages) {
  const translations = blockRaw?.translations?.map((t) => ({
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
  const { data: languages } = await directus.items('languages').readByQuery({
    limit: -1,
    fields: ['*'],
  })
  return languages
}

// --- F&T PAGES --- //

export async function fetchPages() {
  return directus.items('Pages').readByQuery({
    limit: -1,
    fields: [
      '*',
      'translations.*',
      'main.collection',
      'main.item.*',
      'main.item.layout.markup',
      'main.item.translations.*',
    ],
  })
}

// --- F&T ORGANIZATIONS --- //

export function transformOrganization(o) {
  if (!o) return o

  const {
    status,
    slug,
    types,
    opening_hours,
    games_services,
    amenities,
  } = o
  // Create Path
  const path = createPath({ type: 'organization', slug })
  // Distort Name if not published
  const name =
    status !== 'published' && ENV !== 'production'
      ? `_${status?.toUpperCase()}_${o.name}`
      : o.name
  // Transform Address
  const address = transformAddress(o.address)
  // Transform types
  const typesTranslated = types?.map(translateFromCodeName)
  // Transform opening_hours
  const opening_hours_strings = opening_hours?.map(({ days, time_slots }) => {
    const daysTranslated = days?.map(translateFromCodeName)
    const daysString = daysTranslated?.map(({ fr }) => fr).join(', ')
    const timeSlotsFormatted = time_slots?.map(({ time_start, time_end }) => {
      const timeSlotString = [
        time_start?.substring(0, 5),
        time_end?.substring(0, 5),
      ].filter((z) => z).join(' → ')
      return { time_start, time_end, str: timeSlotString }
    })
    const timeSlotsString = timeSlotsFormatted?.map(({ str }) => str).join(', ')
    return (
      (daysString ? `<strong>${daysString}</strong>` : '') +
      (timeSlotsString ? `: ${timeSlotsString}` : '')
    )
  })


  // Transform games_services
  const games_services_translated = games_services?.map(translateFromCodeName)
  // Transform amenities
  const amenities_translated = amenities?.map(translateFromCodeName)
  // Transform images
  const logo = transformImage(o?.logo)
  const gallery = o?.gallery?.map(transformImage)
  const cover_image = transformImage(o?.cover_image)
  // Transform links
  const links = o.links?.map(transformLink)

  const d = new Date()
  const today = d.toISOString().substring(0, 10)
  const inSixMonths = new Date(d.setMonth(d.getMonth() + 6))
    .toISOString()
    .substring(0, 10)

  const events = o.events?.filter(({ events_id: e }) => !!e).map(({ events_id: e }) => {
    const nameSlug = slugify(e.name)
    const hasNoSchedule = !e.schedule?.[0]?.time_start
    // Transform datetimes
    const scheduleFormatted = !hasNoSchedule
      ? e.schedule.map(({ time_start: tsRaw, time_end: teRaw }) => {
          const time_start = transformDateTime(tsRaw)
          const time_end = transformDateTime(teRaw)
          const isSameDay = time_start?.fr?.date === time_end?.fr?.date
  
          return {
            time_start,
            time_end,
            isSameDay,
          }
        })
      : null
    const dateSlug = scheduleFormatted?.[0].time_start.dateTimeRaw.substring(
      0,
      10,
    )
    const slug = `${nameSlug}-${dateSlug}`
    const address = transformAddress(e.address)
    
    return {
      ...e,
      path: createPath({ type: 'event', slug }),
      cover_image: transformImage(e.cover_image),
      address,
      time_start: scheduleFormatted?.[0].time_start,
      time_end: scheduleFormatted?.[0].time_end
    }
  }).filter((event) => {
    return (
      event?.time_end?.dateTimeRaw > today &&
      event?.time_end?.dateTimeRaw < inSixMonths
    )
  }).sort((prev, next) => {
    const a = prev?.time_start?.dateTimeRaw
    const b = next?.time_start?.dateTimeRaw
    if (a > b) return 1
    if (a < b) return -1
    return 0
  })

  return {
    ...o,
    path,
    name,
    address,
    typesTranslated,
    opening_hours_strings,
    games_services_translated,
    amenities_translated,
    logo,
    gallery,
    cover_image,
    links,
    events
  }
}

export async function fetchOrganizations() {
  const organizationsRaw = await directus.items('organizations').readByQuery({
    limit: -1,
    sort: '-date_updated',
    filter: { status: { _in: ['published', 'to_check'] } },
    fields: [
      'status',
      'date_updated',
      'name',
      'slug',
      'types',
      ...imageFields('logo.'),
      ...imageFields('cover_image.'),
      'opening_hours',
      'games_services',
      'address',
      'amenities',
      'links',
      'translations.*',
      ...imageFields('gallery.*.'),
      'events.events_id.status',
      'events.events_id.date_updated',
      'events.events_id.name',
      'events.events_id.address',
      ...imageFields('events.events_id.cover_image.'),
      'events.events_id.recurring',
      'events.events_id.schedule',
      'events.events_id.links',
    ],
  })

  const organizations = organizationsRaw.data?.map(transformOrganization)

  return organizations
}

// --- F&T EVENTS --- //

function fallbackOnParentsOfEvent({
  eventRaw,
  parent,
  organizers,
  mainOrganizer,
  languages,
  hasParent,
}) {
  // process translations fields first
  const translations = languages
    .map(({ code }) => {
      const eventFields = removeEmptyPropOnObject(
        translationFromCode(eventRaw?.translations, code),
      )
      const parentFields = removeEmptyPropOnObject(
        translationFromCode(parent?.translations, code),
      )
      const organizerFields = translationFromCode(
        mainOrganizer?.translations,
        code,
      )

      // TODO: account for fallback language on a node level (only)

      // don't create a translation if no one has it
      if (!eventFields && !parentFields && !organizerFields) return null

      return {
        ...(organizerFields || {}),
        ...(parentFields || {}),
        ...(eventFields || {}),
        fallback_language: undefined,
      }
    })
    .filter((t) => t)

  const e = {
    ...(mainOrganizer
      ? removeEmptyPropOnObject({
          name: mainOrganizer.name,
          address: mainOrganizer.address,
          cover_image: mainOrganizer.cover_image,
          games_services_translated: mainOrganizer.games_services_translated,
          amenities_translated: mainOrganizer.amenities_translated,
          gallery: mainOrganizer.gallery,
        })
      : {}),
    ...(hasParent
      ? removeEmptyPropOnObject({
          name: parent.name,
          address: parent.address,
          cover_image: parent.cover_image
        })
      : {}),
    ...removeEmptyPropOnObject(eventRaw),
    organizers,
    translations,
  }

  return e
}

export function transformEvent(eventRaw, languages) {
  const parent =
    eventRaw?.parent_event && transformEvent(eventRaw?.parent_event)
  const organizers =
    (eventRaw?.organizers?.[0]?.organizations_id &&
      eventRaw?.organizers?.map(({ organizations_id: o }) =>
        transformOrganization(o),
      )) ||
    (parent?.organizers?.[0] &&
      parent?.organizers?.map(({ organizations_id: o }) =>
        transformOrganization(o),
      ))

  const mainOrganizer = organizers?.[0]

  // Inject booleans
  const isRecurring =
    eventRaw.recurring ||
    eventRaw.schedule?.length + eventRaw.event_instances?.length > 1
  const parentIsRecurring = parent?.recurring || parent?.schedule?.length > 0
  const hasNoSchedule = !eventRaw?.schedule?.[0]?.time_start
  const hasParent = !!parent

  // Fallback values from parent_event or first Organizer
  const e = languages
    ? fallbackOnParentsOfEvent({
        eventRaw,
        parent,
        organizers,
        mainOrganizer,
        languages,
        hasParent,
      })
    : eventRaw

  // Transform datetimes
  const scheduleFormatted = !hasNoSchedule
    ? e.schedule.map(({ time_start: tsRaw, time_end: teRaw }) => {
        const time_start = transformDateTime(tsRaw)
        const time_end = transformDateTime(teRaw)
        const isSameDay = time_start?.fr?.date === time_end?.fr?.date

        return {
          time_start,
          time_end,
          isSameDay,
        }
      })
    : null

  // Create Slug
  const nameSlug = slugify(e.name)
  const dateSlug = scheduleFormatted?.[0].time_start.dateTimeRaw.substring(
    0,
    10,
  )
  const slug = `${nameSlug}-${dateSlug}`
  // TODO: should probably create "paths" for translated paths
  const path = createPath({ type: 'event', slug })
  // Transform images
  const cover_image = transformImage(e?.cover_image)
  // Transform Address
  const address = transformAddress(e.address)
  // Transform links
  const links = e.links?.map(transformLink)

  return {
    ...e,
    isRecurring,
    parentIsRecurring,
    hasNoSchedule,
    hasParent,
    parent_event: parent,
    scheduleFormatted,
    slug,
    path,
    cover_image,
    address,
    links,
  }
}

const flattenEvents = (eventsUnflat) => {
  // - can take info from parent event fields
  // - can take info from first organizer fields
  // - can take info from first orga from parent event
  let eventsFlatten = []

  eventsUnflat.forEach((event) => {
    if (event.hasNoSchedule) {
      // skip event entirely because it will be used by children if it is a recurring one
      return null
    } else {
      // TODO: need to verify that code
      const instancesFromSchedule = event.scheduleFormatted?.map((sched) => ({
        ...event,
        ...sched,
      }))
      eventsFlatten.push(...instancesFromSchedule)
    }

    // TODO: think about data inconsistencies if recurring is true but only one date for example
    // this is possible if only one date has been provided for now
  })

  return eventsFlatten
}

export async function fetchEvents() {
  const languages = await fetchLanguages()

  const eventsRaw = await directus.items('events').readByQuery({
    limit: -1,
    filter: {
      _and: [
        { status: { _eq: 'published' } },
        // { date_updated: { _gte: '$NOW(-6 months)' } }, // TODO: change this when we can check the last event time in schedule
      ],
    },
    fields: [
      '*',
      'status',
      'date_updated',
      'name',
      'address',
      ...imageFields('cover_image.'),
      'recurring',
      'schedule',
      'links',
      'organizers.organizations_id.status',
      'organizers.organizations_id.name',
      'organizers.organizations_id.slug',
      'organizers.organizations_id.address',
      ...imageFields('organizers.organizations_id.logo.'),
      ...imageFields('organizers.organizations_id.cover_image.'),
      'organizers.organizations_id.games_services',
      'organizers.organizations_id.amenities',
      ...imageFields('organizers.organizations_id.gallery.*.'),
      'organizers.organizations_id.translations.languages_code',
      'organizers.organizations_id.translations.description',
      'translations.languages_code',
      'translations.highlighted_details',
      'translations.description',
      'parent_event',
      'parent_event.status',
      'parent_event.name',
      'parent_event.address',
      'parent_event.recurring',
      'parent_event.schedule',
      'parent_event.links',
      ...imageFields('parent_event.cover_image.'),
      'parent_event.translations.languages_code',
      'parent_event.translations.highlighted_details',
      'parent_event.translations.description',
      'parent_event.organizers.organizations_id.status',
      'parent_event.organizers.organizations_id.name',
      'parent_event.organizers.organizations_id.slug',
      'parent_event.organizers.organizations_id.address',
      ...imageFields('parent_event.organizers.organizations_id.logo.'),
      ...imageFields('parent_event.organizers.organizations_id.cover_image.'),
      'parent_event.organizers.organizations_id.games_services',
      'parent_event.organizers.organizations_id.amenities',
      ...imageFields('parent_event.organizers.organizations_id.gallery.*.'),
      'parent_event.organizers.organizations_id.translations.languages_code',
      'parent_event.organizers.organizations_id.translations.description',
      'event_instances',
    ],
  })

  const eventsUnflat = eventsRaw.data?.map((e) => transformEvent(e, languages))
  const eventsUnfiltered = flattenEvents(eventsUnflat)

  const d = new Date()
  const today = d.toISOString().substring(0, 10)
  const inSixMonths = new Date(d.setMonth(d.getMonth() + 6))
    .toISOString()
    .substring(0, 10)

  const events = eventsUnfiltered.filter((event) => {
    return (
      event?.time_end?.dateTimeRaw > today &&
      event?.time_end?.dateTimeRaw < inSixMonths
    )
  })

  events.sort((prev, next) => {
    const a = prev?.time_start?.dateTimeRaw
    const b = next?.time_start?.dateTimeRaw
    if (a > b) return 1
    if (a < b) return -1
    return 0
  })

  return events
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
  const authors = authorsRaw?.map((authorRaw) =>
    transformUserProfile(authorRaw?.user_profiles_id),
  )
  const date_published = transformDateTime(articleRaw.date_published)
  const date_modified = transformDateTime(articleRaw.date_modified)
  const header = headerRaw?.map((i) => transformBlock(i, languages))
  const main = mainRaw?.map((i) => transformBlock(i, languages))
  const footer = footerRaw?.map((i) => transformBlock(i, languages))

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
  const languages = await fetchLanguages()

  const articlesRaw = await directus.items('articles').readByQuery({
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

  const articles = articlesRaw.data?.map((a) => transformArticle(a, languages))

  return articles
}
