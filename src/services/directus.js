import { Directus } from '@directus/sdk'
import { slugify, createPath, areasBe } from '@utils'

// const DIRECTUS_EMAIL = import.meta.env.PUBLIC_DIRECTUS_EMAIL
// const DIRECTUS_PW = import.meta.env.PUBLIC_DIRECTUS_PW
const DIRECTUS_URL = import.meta.env.DIRECTUS_URL
const DIRECTUS_EMAIL = import.meta.env.DIRECTUS_EMAIL
const DIRECTUS_PW = import.meta.env.DIRECTUS_PW
const ENV = 'development'

console.log('-------HERE-------', import.meta.env)

export const directus = new Directus(DIRECTUS_URL)

// --- STATIC VALUES --- //

// const cmsBaseUrl = `http://localhost:8055`
const cmsBaseUrl = DIRECTUS_URL
const cmsAssetsUrl = `${cmsBaseUrl}/assets`

const imageFields = (preString) => [
  preString + 'id',
  // preString + "storage",
  // preString + "filename_disk",
  preString + 'filename_download',
  preString + 'title',
  preString + 'type',
  // preString + "folder",
  // preString + "uploaded_by",
  // preString + "uploaded_on",
  // preString + "modified_by",
  // preString + "modified_on",
  // preString + "charset",
  preString + 'filesize',
  preString + 'width',
  preString + 'height',
  // preString + "duration",
  // preString + "embed",
  preString + 'description',
  // preString + "location",
  // preString + "tags",
  // preString + "metadata",
  preString + 'image_alt',
  preString + 'image_title',
]
/* prettier-ignore */
const dico = [
  // links names
  { code_name: 'website', fr: 'Site web', iconName: 'gridicons:share-computer' },
  { code_name: 'facebook_page', fr: 'Page Facebook', iconName: 'brandico:facebook-rect' },
  { code_name: 'twitter', fr: 'Twitter', iconName: 'fa:twitter-square' },
  { code_name: 'instagram', fr: 'Instagram', iconName: 'fa-brands:instagram-square' },
  { code_name: 'youtube_channel', fr: 'Youtube', iconName: 'fa-brands:youtube-square' },
  // Areas
  { code_name: 'walloon-brabant', fr: 'Brabant Wallon' },
  { code_name: 'flemish-brabant', fr: 'Brabant Flamand' },
  { code_name: 'brussels', fr: 'Bruxelles' },
  { code_name: 'antwerp', fr: 'Anvers' },
  { code_name: 'limburg', fr: 'Limbourg' },
  { code_name: 'liege', fr: 'Liège' },
  { code_name: 'namur', fr: 'Namur' },
  { code_name: 'hainaut', fr: 'Hainaut' },
  { code_name: 'luxembourg', fr: 'Luxembourg' },
  { code_name: 'west-flanders', fr: 'Flandre Occidentale' },
  { code_name: 'east-flanders', fr: 'Flandre Orientale' },
  // Organization types
  { code_name: 'association', fr: 'Association' },
  { code_name: 'club', fr: 'Club' },
  { code_name: 'bar', fr: 'Bar' },
  { code_name: 'restaurant', fr: 'Restaurant' },
  { code_name: 'toy_library', fr: 'Ludothèque' },
  { code_name: 'shop', fr: 'Boutique' },
  { code_name: 'festival', fr: 'Festival' },
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

// const iconsDico = [
//   { code_name: 'facebook', iconName: 'brandico:facebook-rect' },
// ]

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

const formatDateTime = (str) => {
  const dateOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  const timeOptions = { hour: '2-digit', minute: '2-digit' }

  const date = new Date(str)
  return `${date.toLocaleDateString(
    'fr',
    dateOptions,
  )} - ${date.toLocaleTimeString('fr', timeOptions)}`
}

function removeEmptyPropOnObject(obj) {
  if (typeof obj === 'object' && !Array.isArray(obj)) {
    // return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null))
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
    // const email = window.prompt('Email:');
    // const password = window.prompt('Password:');
    // const email = "marcoet@gmail.com";
    // const password = "sheron";
    // const email = DIRECTUS_EMAIL;
    // const password = DIRECTUS_EMAIL;

    await directus.auth
      .login({ email: DIRECTUS_EMAIL, password: DIRECTUS_PW })
      .then(() => {
        authenticated = true
        console.info('--SELF INFO-- DIRECTUS AUTH = OK')
      })
      .catch(() => {
        window.alert('Invalid credentials')
      })
  }
}

// --- FETCH AND TRANSFORM --- //

// --- TRANSFORM FIELDS --- //

function transformImage(i) {
  return i
    ? {
        ...i,
        src: `${cmsAssetsUrl}/${i?.id}`,
      }
    : null
}

function transformAddress(address) {
  const a = address?.[0]?.zip && address?.[0]
  if (!a) return { ...address, string: null, gMapLink: null }

  const string = `${a.street} ${a.number}, ${a.zip} ${a.city}`
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
    name: translateFromCodeName(area.slug),
  }

  return { ...a, string, gMapLink, area }
}

// --- F&T PAGES --- //

export async function fetchPages() {
  return directus.items('Pages').readMany({
    limit: -1,
    // filter: { status: { _eq: 'published' } },
    // fields: [ "*", "translations.*", "main.*", "main.item.*", "main.item.translations.*", "main.item.content.*", "main.item.content.item.*", "main.item.content.item.*" ]
    // fields: [ "*", "translations.*", "main.*", "main.*.*", "main.*.*.*", "main.*.*.*.*", "main.*.*.*.*.*" ]
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
    translations,
    games_services,
    amenities,
  } = o
  // Create Path
  const path = createPath({ organization: { slug } })
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
      const timeSlotString = `${time_start.substring(
        0,
        5,
      )} → ${time_end.substring(0, 5)}`
      return { time_start, time_end, str: timeSlotString }
    })
    const timeSlotsString = timeSlotsFormatted?.map(({ str }) => str).join(', ')
    return `<strong>${daysString}:</strong> ${timeSlotsString}`
  })

  // // Transform opening_hours_remark
  // const opening_hours_remark = reduceTranslatedMarkdown({
  //   translations,
  //   fieldName: 'opening_hours_remark',
  // })
  // // Transform description
  // const description = reduceTranslatedMarkdown({
  //   translations,
  //   fieldName: 'description',
  // })
  // Transform games_services
  const games_services_translated = games_services?.map(translateFromCodeName)
  // Transform amenities
  const amenities_translated = amenities?.map(translateFromCodeName)
  // Transform images
  const logo = transformImage(o?.logo)
  const gallery = o?.gallery?.map(transformImage)
  const cover_image = transformImage(o?.cover_image)

  const links = o.links?.map(({ name, url }) => {
    const linkNameTranslated = translateFromCodeName(name)
    let { iconName } = linkNameTranslated

    if (!iconName) {
      console.warn(`--SELF WARNING-- No icon found with code_name '${name}'`)
      iconName = 'bi:question-square'
    }

    return {
      name: linkNameTranslated,
      url,
      iconName,
    }
  })

  return {
    ...o,
    path,
    name,
    address,
    typesTranslated,
    opening_hours_strings,
    // opening_hours_remark,
    // description,
    games_services_translated,
    amenities_translated,
    logo,
    gallery,
    cover_image,
    links,
  }
}

export async function fetchOrganizations() {
  const organizationsRaw = await directus.items('organizations').readMany({
    limit: -1,
    // filter: { status: { _eq: 'published' } },
    // fields: [ "*", "translations.*", "main.*", "main.item.*", "main.item.translations.*", "main.item.content.*", "main.item.content.item.*", "main.item.content.item.*" ]
    // fields: [ "*", "translations.*", "main.*", "main.*.*", "main.*.*.*", "main.*.*.*.*", "main.*.*.*.*.*" ]
    fields: [
      'status',
      'date_updated',
      'name',
      'slug',
      'types',
      // "logo.*",
      ...imageFields('logo.'),
      // "cover_image.*",
      ...imageFields('cover_image.'),
      'opening_hours',
      'games_services',
      'address',
      'amenities',
      'links',
      // 'website',
      // 'facebook_page',
      // 'instagram',
      // 'twitter',
      // 'youtube_channel',
      'translations.*',
      // "gallery.*",
      ...imageFields('gallery.*.'),
      // "*",
    ],
  })

  const organizations = organizationsRaw.data.map(transformOrganization)

  return organizations
}

// --- F&T EVENTS --- //

function fallbackOnParentsOfEvent({
  eventRaw,
  parent,
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
        // fallback_language: eventFields?.fallback_language,
        fallback_language: undefined,
      }
    })
    .filter((t) => t)

  const e = {
    ...(mainOrganizer
      ? removeEmptyPropOnObject({
          name: mainOrganizer.name,
          address: mainOrganizer.address,
          addressString: mainOrganizer.addressString,
          addressLink: mainOrganizer.addressLink,
          cover_image: mainOrganizer.cover_image,
          games_servicesTranslated: mainOrganizer.games_servicesTranslated,
          amenitiesTranslated: mainOrganizer.amenitiesTranslated,
          gallery: mainOrganizer.gallery,
        })
      : {}),
    ...(hasParent
      ? removeEmptyPropOnObject({
          name: parent.name,
          address: parent.address,
          addressString: parent.addressString,
          addressLink: parent.addressLink,
          cover_image: parent.cover_image,
          organizers: parent.organizers,
        })
      : {}),
    ...removeEmptyPropOnObject(eventRaw),
    translations,
  }

  return e
}

export function transformEvent(eventRaw, languages) {
  const parent = eventRaw.parent_event
  const mainOrganizerRaw =
    eventRaw?.organizers?.[0]?.organizations_id ||
    parent?.organizers?.[0]?.organizations_id
  const mainOrganizer = transformOrganization(mainOrganizerRaw)

  // Inject booleans
  const isRecurring =
    eventRaw.recurring ||
    eventRaw.schedule.length + eventRaw.event_instances.length > 1
  const hasNoSchedule = !eventRaw?.schedule?.[0]?.time_start
  const hasParent = !!parent
  // const hasDescriptionOrHighlighted = eventRaw.translations.inde

  // Fallback values from parent_event or first Organizer
  const e = fallbackOnParentsOfEvent({
    eventRaw,
    parent,
    mainOrganizer,
    languages,
    hasParent,
  })

  // Transform datetimes
  const scheduleFormatted = !hasNoSchedule
    ? e.schedule.map(({ time_start, time_end }) => {
        const time_start_string = formatDateTime(time_start)
        const time_end_string = formatDateTime(time_end)

        return {
          time_start,
          // time_start_date,
          time_start_string,
          time_end,
          time_end_string,
        }
      })
    : null

  // Create Slug
  const nameSlug = slugify(e.name)
  const dateSlug = scheduleFormatted[0].time_start.substring(0, 10)
  const slug = `${nameSlug}-${dateSlug}`
  const path = createPath({ event: { slug } })

  // Transform images
  const cover_image = transformImage(e?.cover_image)

  // Transform Address
  const address = transformAddress(e.address)

  return {
    ...e,
    isRecurring,
    hasNoSchedule,
    hasParent,
    scheduleFormatted,
    slug,
    path,
    cover_image,
    address,
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
      const instancesFromSchedule = event.scheduleFormatted.map((sched) => ({
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
  const { data: languages } = await directus.items('languages').readMany({
    limit: -1,
    fields: ['*'],
  })

  const eventsRaw = await directus.items('events').readMany({
    limit: -1,
    // filter: { status: { _eq: 'published' } },
    // fields: [ "*", "translations.*", "main.*", "main.item.*", "main.item.translations.*", "main.item.content.*", "main.item.content.item.*", "main.item.content.item.*" ]
    // fields: [ "*", "translations.*", "main.*", "main.*.*", "main.*.*.*", "main.*.*.*.*", "main.*.*.*.*.*" ]
    fields: [
      // '*',
      'status',
      'name',
      'address',
      ...imageFields('cover_image.'),
      'recurring',
      'schedule',
      'links',
      // 'links.web_page',
      // 'links.facebook_event',
      // 'links.other_links',
      // 'organizers.organizations_id.*',
      'organizers.organizations_id.name',
      'organizers.organizations_id.slug',
      'organizers.organizations_id.address',
      ...imageFields('organizers.organizations_id.cover_image.'),
      'organizers.organizations_id.games_services',
      'organizers.organizations_id.amenities',
      ...imageFields('organizers.organizations_id.gallery.*.'),
      'organizers.organizations_id.translations.languages_code',
      'organizers.organizations_id.translations.description',
      // 'translations.*',
      'translations.languages_code',
      // 'translations.fallback_language',
      'translations.highlighted_details',
      'translations.description',
      // parent_event
      'parent_event',
      'parent_event.status',
      'parent_event.name',
      'parent_event.address',
      'parent_event.links',
      ...imageFields('parent_event.cover_image.'),
      'parent_event.translations.languages_code',
      // 'parent_event.translations.fallback_language',
      'parent_event.translations.highlighted_details',
      'parent_event.translations.description',
      // 'parent_event.translations.main_url',
      // 'parent_event.translations.facebook_event_url',
      // 'parent_event.translations.other_links',
      'parent_event.organizers.organizations_id.name',
      'parent_event.organizers.organizations_id.slug',
      'parent_event.organizers.organizations_id.address',
      ...imageFields('parent_event.organizers.organizations_id.cover_image.'),
      'parent_event.organizers.organizations_id.games_services',
      'parent_event.organizers.organizations_id.amenities',
      ...imageFields('parent_event.organizers.organizations_id.gallery.*.'),
      'parent_event.organizers.organizations_id.translations.languages_code',
      'parent_event.organizers.organizations_id.translations.description',

      'event_instances',
    ],
  })

  const eventsUnflat = eventsRaw.data.map((e) => transformEvent(e, languages))
  const events = flattenEvents(eventsUnflat)
  // const events = eventsUnflat

  return events
}
