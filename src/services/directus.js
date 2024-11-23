import { createDirectus, rest, authentication, readItems } from '@directus/sdk'
import rrule from 'rrule'
import { slugify, createPath, areasBe, toTzDate, stripDate, datePlus1Day } from '@utils'

const { datetime, RRule, RRuleSet, rrulestr } = rrule

const DIRECTUS_URL = import.meta.env.DIRECTUS_URL || process.env.DIRECTUS_URL
const DIRECTUS_EMAIL = import.meta.env.DIRECTUS_EMAIL || process.env.DIRECTUS_EMAIL
const DIRECTUS_PW = import.meta.env.DIRECTUS_PW || process.env.DIRECTUS_PW
const ENV = import.meta.env.MODE || process.env.NODE_ENV // 'development' or 'production'

// export const directus = new Directus(DIRECTUS_URL)
export const client = createDirectus(DIRECTUS_URL).with(rest()).with(authentication('json'))

// --- STATIC VALUES --- //

const cmsBaseUrl = DIRECTUS_URL
const cmsAssetsUrl = `${cmsBaseUrl}/assets`

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
].map(a => {
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
	{ code_name: "website", fr: "Site web", iconName: "ph:link" },
	{ code_name: "web_page", fr: "Page web", iconName: "ph:link" },
	{
		code_name: "facebook_page",
		fr: "Page Facebook",
		iconName: "ph:facebook-logo",
	},
	{
		code_name: "facebook_event",
		fr: "Événement Facebook",
		iconName: "ph:facebook-logo",
	},
	{ code_name: "twitter", fr: "Twitter", iconName: "ph:twitter-logo" },
	{ code_name: "instagram", fr: "Instagram", iconName: "ph:instagram-logo" },
	{ code_name: "youtube_channel", fr: "Youtube", iconName: "ph:youtube-logo" },

	{ code_name: "spotify", fr: "Spotify", iconName: "ph:spotify-logo" },
	{ code_name: "shop", fr: "Boutique", iconName: "ph:shopping-cart-simple" },
	{ code_name: "tripadvisor", fr: "Tripadvisor", iconName: "cib:tripadvisor" },
	{
		code_name: "facebook_group",
		fr: "Groupe Facebook",
		iconName: "ph:facebook-logo",
	},
	{ code_name: "forum", fr: "Forum", iconName: "ph:chats" },
	{ code_name: "talk", fr: "Le Talk", iconName: "ri:kakao-talk-line" },
	// Areas
	...areas,
	// Days of week
	{ code_name: "monday", fr: "Lundi" },
	{ code_name: "tuesday", fr: "Mardi" },
	{ code_name: "wednesday", fr: "Mercredi" },
	{ code_name: "thursday", fr: "Jeudi" },
	{ code_name: "friday", fr: "Vendredi" },
	{ code_name: "saturday", fr: "Samedi" },
	{ code_name: "sunday", fr: "Dimanche" },
	// Amenities
	{ code_name: "snacks", fr: "Snacks" },
	{ code_name: "drinks", fr: "Boissons" },
	{ code_name: "food", fr: "Nourriture" },
	{ code_name: "vegetarian", fr: "Végétarien" },
	{ code_name: "vegan", fr: "Végan" },
	{ code_name: "handicapped", fr: "Accessible" },
	{ code_name: "children", fr: "Enfants bienvenus" },

	// More generic matches last just to be sure to match the rest first
	{
		code_name: "facebook",
		fr: "Page Facebook",
		iconName: "ph:facebook-logo",
	},
	{ code_name: "youtube", fr: "Youtube", iconName: "ph:youtube-logo" },
	{
		code_name: "linkedin",
		fr: "LinkedIn",
		iconName: "ph:linkedin-logo",
	},
	{
		code_name: "linktr.ee|linktree",
		fr: "Linktree",
		iconName: "ph:linktree-logo",
	},
	{
		code_name: "pinterest",
		fr: "Pinterest",
		iconName: "ph:pinterest-logo",
	},
	{
		code_name: "discord",
		fr: "Discord",
		iconName: "ph:discord-logo",
	},
	{
		code_name: "tiktok",
		fr: "TikTok",
		iconName: "ph:tiktok-logo",
	},
	{
		code_name: "twitch",
		fr: "Twitch",
		iconName: "ph:twitch-logo",
	},
	{
		code_name:
			"ticket|tickets|inscription|réservation|billets|billet|billeterie",
		// fr: "LinkedIn",
		iconName: "ph:ticket-light",
	},
	{
		code_name:
			"date|dates|agenda|calendrier|calendrier|agenda|planning|plannings|event",
		iconName: "ph:calendar-dots-light",
	},
	{
		code_name:
			"my ludo|myludo|Board game geek|boardgamegeek|jeux",
		fr: "My Ludo",
		iconName: "ph:checkerboard-thin",
	},
	{
		code_name: "catalogue",
		iconName: "ph:book-open-text-thin",
	},
	{ code_name: "web", fr: "Web", iconName: "ph:link" },
]

// --- UTILITY FUNCTIONS --- //

const translateFromCodeName = (code_name, warningCue) => {
  const codeNameLow = code_name?.toLowerCase()

  let match = dico.find(el => el.code_name === code_name)

  if (!match) {
    // Wider matching logic to match more generic strings
    match = dico.find(el => {
      const dicoRex = new RegExp(el.code_name, 'i')
      return dicoRex.test(codeNameLow)
    })
    if (match) {
      match.fr = code_name
    }
  }
  if (!match) {
    console.warn(
      `--SELF WARNING-- No match in dico for code_name '${code_name}'${warningCue ? " (in '" + warningCue + "')" : ''}`
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
    {}
  )

function removeEmptyPropOnObject(obj) {
  if (typeof obj === 'object' && !Array.isArray(obj)) {
    return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v || v === false))
  }
  return obj
}

const translationFromCode = (translations, code) =>
  removeEmptyPropOnObject(translations?.find(translation => translation.languages_code === code))

// --- START DIRECTUS --- //

export async function start() {
  // But, we need to authenticate if data is private
  let authenticated = false
  let authFailedNumber = 0
  const allowedAuthFail = 20

  // Try to authenticate with token if exists
  await client
    .refresh()
    .then(() => {
      authenticated = true
    })
    .catch(() => {})

  // Let's login in case we don't have token or it is invalid / expired
  while (!authenticated && authFailedNumber < allowedAuthFail) {
    await client
      .login(DIRECTUS_EMAIL, DIRECTUS_PW)
      .then(() => {
        authenticated = true
        console.info('--SELF INFO-- DIRECTUS AUTH = OK')
      })
      .catch(() => {
        console.error('Invalid credentials')
        authFailedNumber += 1
      })
  }
  if (authFailedNumber >= allowedAuthFail) {
    throw `Auth failed ${allowedAuthFail} times. Exiting Build.`
  }
}

// --- FETCH AND TRANSFORM --- //

// --- TRANSFORM FIELDS --- //

const transformDateTime = dateRaw => {
  if (!dateRaw) return dateRaw

  const date = toTzDate(dateRaw)

  const dateOptions = {
    timeZone: 'UTC',
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
  const timeOptions = { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' }

  // date = new Date(dateRaw)
  const dateStr = stripDate(date).slice(0, -3)
  const hasTime = dateStr?.length > 10

  return {
    // dateTimeRaw: dateRaw,
    dateTimeRaw: dateStr,
    dateStr,
    hasTime,
    fr: {
      date: date.toLocaleString('fr', dateOptions),
      ...(hasTime
        ? {
            time: date.toLocaleString('fr', timeOptions),
            hours: date.toLocaleString('fr', {
              timeZone: 'UTC',
              hour: '2-digit',
            }),
            minutes: date.toLocaleString('fr', {
              timeZone: 'UTC',
              minute: '2-digit',
            }),
          }
        : {}),
      weekday: date.toLocaleString('fr', { timeZone: 'UTC', weekday: 'short' }),
      day: date.toLocaleString('fr', { timeZone: 'UTC', day: 'numeric' }),
      month: date.toLocaleString('fr', { timeZone: 'UTC', month: 'short' }),
      monthShort: date.toLocaleString('fr', {
        timeZone: 'UTC',
        month: 'short',
      }),
      monthLong: date.toLocaleString('fr', { timeZone: 'UTC', month: 'long' }),
      year: date.toLocaleString('fr', { timeZone: 'UTC', year: 'numeric' }),
    },
  }
}

const transformLink = ({ name, url }, warningCue) => {
  const linkNameTranslated = translateFromCodeName(name, warningCue)
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

function transformAddress(location) {
  const l = location?.postalCode && location
  if (!l) return null

  const string = [
    [l.streetAddress, l.streetNumber].filter(z => z).join(' '),
    [l.postalCode, l.addressLocality].filter(z => z).join(' '),
  ]
    .filter(z => z)
    .join(', ')

  const fullString = `${l.name ? l.name + ' - ' : ''}${string}`
  const gMapLink = `https://maps.google.com/maps?q=${string.replace(/\s/g, '+')}+belgium`

  let area = areasBe.find(area => l.postalCode >= area.zipMin && l.postalCode <= area.zipMax)
  if (!area) console.warn(`--SELF WARNING-- ZIP missing for place: '${string}'`)

  area = area && {
    ...area,
    ...translateFromCodeName(area.code_name),
  }

  return { ...l, string, fullString, gMapLink, area }
}

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

export async function fetchPages() {
  // await client.refresh()
  // const result = await client.request(readItems("languages"))
  return await client.request(
    readItems('Pages', {
      fields: [
        '*',
        'translations.*',
        'main.collection',
        'main.item.*',
        'main.item.layout.markup',
        'main.item.translations.*',
      ],
    })
  )

  // TODO: Remove implementation from old sdk when ready
  // return directus.items("Pages").readByQuery({
  //   limit: -1,
  //   fields: [
  //     "*",
  //     "translations.*",
  //     "main.collection",
  //     "main.item.*",
  //     "main.item.layout.markup",
  //     "main.item.translations.*",
  //   ],
  // })
}

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

// --- F&T ORGANIZATIONS --- //

export function transformOrganization(o, languages) {
  if (!o) return o

  const { status, slug, opening_hours, amenities, organization_types, games_related_services } = o
  // Create Path
  const path = createPath({ type: 'organization', slug })
  // Distort Name if not published
  const name =
    status !== 'published' && ENV !== 'production' ? `_${status?.toUpperCase()}_${o.name}` : o.name
  // Transform Location
  const location = transformAddress(o.location)
  // Transform types
  const typesTranslated = organization_types?.map(t => t.type)
  // Transform services
  const servicesTranslated = games_related_services?.map(t => t.service)
  // Transform opening_hours
  const opening_hours_strings = opening_hours?.map(({ days, time_slots }) => {
    const daysTranslated = days?.map(translateFromCodeName)
    const daysString = daysTranslated?.map(({ fr }) => fr).join(', ')
    const timeSlotsFormatted = time_slots?.map(({ time_start, time_end }) => {
      const timeSlotString = [time_start?.substring(0, 5), time_end?.substring(0, 5)]
        .filter(z => z)
        .join(' → ')
      return { time_start, time_end, str: timeSlotString }
    })
    const timeSlotsString = timeSlotsFormatted?.map(({ str }) => str).join(', ')
    return (
      (daysString ? `<strong>${daysString}</strong>` : '') +
      (timeSlotsString ? `: ${timeSlotsString}` : '')
    )
  })

  // Transform amenities
  const amenities_translated = amenities?.map(translateFromCodeName)
  // Transform images
  const logo = transformImage(o?.logo)
  const gallery = o?.gallery?.map(transformImage)
  const cover_image = transformImage(o?.cover_image)
  // Transform links
  const links = o.links?.map(link => transformLink(link, o.name))

  const eventsUnflat = o.events
    ?.filter(({ events_id: e } = {}) => !!e && e.status === 'published')
    ?.map(({ events_id: e } = {}) => transformEvent(e, languages))

  const eventsUnfiltered = flattenEvents(eventsUnflat)

  const d = new Date()
  const today = d.toISOString().substring(0, 10)
  const inSixMonths = new Date(d.setMonth(d.getMonth() + 6)).toISOString().substring(0, 10)

  let events = eventsUnfiltered.filter(event => {
    if (event.isCanonical) return false

    if (!event.time_start) {
      if (!event.isCanonical) {
        console.error(`Event instance of "${event.name}" has no Start Date`)
      }
      return false
    }

    if (!event?.time_end) {
      return (
        event?.time_start?.dateStr > today
        // && event?.time_start?.dateStr < inSixMonths
      )
    }
    return (
      event?.time_end?.dateStr > today
      // && event?.time_end?.dateStr < inSixMonths
    )
  })

  events.sort((prev, next) => {
    const a = prev?.time_start?.dateStr
    const b = next?.time_start?.dateStr
    if (a > b) return 1
    if (a < b) return -1
    return 0
  })

  return {
    ...o,
    path,
    name,
    location,
    typesTranslated,
    servicesTranslated,
    opening_hours_strings,
    amenities_translated,
    logo,
    gallery,
    cover_image,
    links,
    events,
  }
}

export async function fetchOrganizations() {
  // await client.refresh()
  const organizationsRaw = await client.request(
    readItems('organizations', {
      limit: -1,
      sort: '-date_updated',
      filter: { status: { _in: ['published', 'to_check'] } },
      fields: [
        'status',
        'date_updated',
        'name',
        'slug',
        'organization_types.type.code_name',
        'organization_types.type.colorPalette',
        'organization_types.type.translations.language_code',
        'organization_types.type.translations.default_label',
        'boardgame_related',
        ...imageFields('logo.'),
        ...imageFields('cover_image.'),
        'opening_hours',
        'games_related_services.service.code_name',
        'games_related_services.service.colorPalette',
        'games_related_services.service.translations.language_code',
        'games_related_services.service.translations.default_label',
        'location.*',
        'amenities',
        'links',
        'translations.*',
        // ...imageFields("gallery.*."),
        // Related Events
        'events.events_id.id',
        'events.events_id.status',
        'events.events_id.date_updated',
        'events.events_id.name',
        {
          'events.events_id.location': [
            // "*",
            'name',
            'streetAddress',
            'streetNumber',
            'postalCode',
            'addressLocality',
            'addressRegion',
            'geo',
          ],
        },
        ...imageFields('events.events_id.cover_image.'),
        'events.events_id.recurrence',
        'events.events_id.startDate',
        'events.events_id.endDate',
        'events.events_id.startTime',
        'events.events_id.endTime',
        {
          'events.events_id.eventSchedule': [
            // "*",
            'status',
            'description',
            'startDate',
            'endDate',
            'startTime',
            'endTime',
            'repeatCount',
            'frequency',
            'interval',
            'byDay',
            'byMonth',
            'byMonthWeek',
            'byMonthDay',
            'bySetPos',
            'exceptDate',
            'addDate',
          ],
        },
        'events.events_id.schedule',
        'events.events_id.links',
        'events.events_id.organizers.organizations_id.status',
        'events.events_id.organizers.organizations_id.name',
        'events.events_id.organizers.organizations_id.slug',
        'events.events_id.organizers.organizations_id.location.*',
        ...imageFields('events.events_id.organizers.organizations_id.logo.'),
        ...imageFields('events.events_id.organizers.organizations_id.cover_image.'),
        'events.events_id.organizers.organizations_id.games_related_services.service.code_name',
        'events.events_id.organizers.organizations_id.games_related_services.service.colorPalette',
        'events.events_id.organizers.organizations_id.games_related_services.service.translations.language_code',
        'events.events_id.organizers.organizations_id.games_related_services.service.translations.default_label',
        'events.events_id.organizers.organizations_id.amenities',
        // ...imageFields(
        // 	"events.events_id.organizers.organizations_id.gallery.*.",
        // ),
        'events.events_id.organizers.organizations_id.translations.languages_code',
        'events.events_id.organizers.organizations_id.translations.description',
        'events.events_id.translations.languages_code',
        'events.events_id.translations.highlighted_details',
        'events.events_id.translations.description',
        // "events.events_id.parent_event",
        // "events.events_id.parent_event.status",
        // "events.events_id.parent_event.name",
        // "events.events_id.parent_event.recurring",
        // "events.events_id.parent_event.schedule",
        // "events.events_id.parent_event.links",
        // ...imageFields("events.events_id.parent_event.cover_image."),
        // "events.events_id.parent_event.translations.languages_code",
        // "events.events_id.parent_event.translations.highlighted_details",
        // "events.events_id.parent_event.translations.description",
        // "events.events_id.parent_event.organizers.organizations_id.status",
        // "events.events_id.parent_event.organizers.organizations_id.name",
        // "events.events_id.parent_event.organizers.organizations_id.slug",
        // ...imageFields(
        // 	"events.events_id.parent_event.organizers.organizations_id.logo.",
        // ),
        // ...imageFields(
        // 	"events.events_id.parent_event.organizers.organizations_id.cover_image.",
        // ),
        // "events.events_id.parent_event.organizers.organizations_id.games_services",
        // "events.events_id.parent_event.organizers.organizations_id.amenities",
        // ...imageFields(
        // 	"events.events_id.parent_event.organizers.organizations_id.gallery.*.",
        // ),
        // "events.events_id.parent_event.organizers.organizations_id.translations.languages_code",
        // "events.events_id.parent_event.organizers.organizations_id.translations.description",
        // "events.events_id.event_instances",
      ],
    })
  )

  const languages = await fetchLanguages()
  const organizations = organizationsRaw?.map(organization =>
    transformOrganization(organization, languages)
  )

  return organizations
}

// --- F&T EVENTS --- //

function fallbackOnParentsOfEvent({
  eventRaw,
  // parent,
  organizers,
  mainOrganizer,
  languages,
  // hasParent,
}) {
  // process translations fields first
  const translations = languages
    .map(({ code }) => {
      const eventFields = removeEmptyPropOnObject(translationFromCode(eventRaw?.translations, code))
      // const parentFields = removeEmptyPropOnObject(
      // 	translationFromCode(parent?.translations, code),
      // )
      const organizerFields = translationFromCode(mainOrganizer?.translations, code)

      // TODO: account for fallback language on a node level (only)

      // don't create a translation if no one has it
      if (
        !eventFields &&
        // !parentFields &&
        !organizerFields
      )
        return null

      return {
        ...(organizerFields || {}),
        // ...(parentFields || {}),
        ...(eventFields || {}),
        fallback_language: undefined,
      }
    })
    .filter(t => t)

  const e = {
    ...(mainOrganizer
      ? removeEmptyPropOnObject({
          name: mainOrganizer.name,
          location: mainOrganizer.location,
          cover_image: mainOrganizer.cover_image,
          games_related_services: mainOrganizer.games_related_services,
          amenities_translated: mainOrganizer.amenities_translated,
          gallery: mainOrganizer.gallery,
        })
      : {}),
    // ...(hasParent
    //   ? removeEmptyPropOnObject({
    //       name: parent.name,
    //       location: parent.location,
    //       cover_image: parent.cover_image,
    //     })
    //   : {}),
    ...removeEmptyPropOnObject(eventRaw),
    organizers,
    translations,
  }

  return e
}

function setEndDate({ startDate, endDate: endDateRaw, startTime, endTime }) {
  if (!startDate || !startTime) return {}

  // const startDateAsDate = new Date(startDate)
  // const startDateAsDatePlus1 = new Date(startDate)
  // startDateAsDatePlus1.setDate(startDateAsDatePlus1.getDate() + 1)
  // const startDatePlus1 = startDateAsDatePlus1.toISOString().split("T")[0]
  let { string: startDatePlus1 } = datePlus1Day(startDate)
  startDatePlus1 = startDatePlus1.split('T')[0]

  let endDate = endDateRaw
  let moreThan24h = false

  if (!endDate) {
    // Define endDate
    if (!endTime) endDate = endDateRaw
    else if (endTime <= startTime) endDate = startDatePlus1
    else if (endTime > startTime) endDate = startDate
  } else if (endDate == startDatePlus1 && endTime > startTime) {
    moreThan24h = true
  } else if (endDate > startDatePlus1) {
    moreThan24h = true
  }

  const today = new Date().toISOString().split('T')[0]
  const isPast = (endDate || startDate) < today

  return { startDatePlus1, endDate, moreThan24h, isPast }
}

function setDateTimes({ startDate, startTime, endDate, endTime }) {
  const startDateTime = startDate && startDate + (startTime ? `T${startTime}` : '')
  const endDateTime = endDate && endDate + (endTime ? `T${endTime}` : '')

  const startDateStr = stripDate(startDateTime)?.slice(0, -3)
  const endDateStr = stripDate(endDateTime)?.slice(0, -3)

  return {
    startDateTime,
    endDateTime,
    startDateStr,
    endDateStr,
  }
}

export function transformSchedule(scheduleRaw) {
  const {
    status,
    description,
    startDate,
    endDate: endDateRaw,
    startTime,
    endTime,
    repeatCount,
    frequency, // yearly, monthly, weekly
    interval,
    byDay,
    bySetPos,
    exceptDate,
    addDate,
    // Are the following useful?
    byMonthDay,
    byMonth, // [int]
    // byMonthWeek,
  } = scheduleRaw

  const { startDatePlus1, endDate, moreThan24h, isPast } = setEndDate({
    startDate,
    endDate: endDateRaw,
    startTime,
    endTime,
  })

  let type = undefined // can be 'unique', 'recurring' or 'invalid'
  let rrule = undefined
  const [Y, M, D] = (startDate || '').split('-')
  const [h, m] = (startTime || '').split(':')

  // Define type
  if (!startDate || !startTime) type = 'invalid'
  // This was wrong because we might define an endDate > startDate if this schedule spans multiple days
  // else if ((repeatCount > 1 || endDate > startDate) && !frequency)
  else if (repeatCount > 1 && !frequency) type = 'invalid'
  else if ((repeatCount > 1 || endDate > startDatePlus1) && !!frequency) type = 'recurring'
  else type = 'unique'

  const { startDateTime, endDateTime, startDateStr, endDateStr } = setDateTimes({
    startDate,
    startTime,
    endDate,
    endTime,
  })

  // const time_start = transformDateTime(startDateTime)
  // const time_end = transformDateTime(endDateTime)

  if (type === 'recurring') {
    rrule = new RRule({
      freq: RRule[frequency.toUpperCase()],
      dtstart: datetime(Y, M, D, h, m),
      // dtstart: new Date(startDate),
      // TODO: what happens if both repeatCount and endDate are set ???
      count: repeatCount,
      ...(endDate && { until: new Date(endDate) }),
      interval,
      bysetpos: bySetPos,
      ...(byDay && {
        byweekday: RRule[byDay.map(day => day.slice(0, 2).toUpperCase())],
      }),
      // Are the following useful?
      bymonthday: byMonthDay,
      bymonth: byMonth,
    })
  }

  return {
    ...scheduleRaw,
    type,
    rrule,
    endDate,
    moreThan24h,
    startDatePlus1,
    isPast,
    startDateTime,
    endDateTime,
    startDateStr,
    endDateStr,
  }
}

export function transformSchedules(schedulePartsRaw, legacySchedule) {
  // let type = undefined
  const purgedScheduleParts = schedulePartsRaw?.filter(
    ({ status, type }) => type !== 'invalid' && (status || 'published') === 'published'
  )
  // if (purgedScheduleParts?.length < 1) type = "invalid"
  // else if (purgedScheduleParts?.length > 1) type = "recurring"
  // else if (purgedScheduleParts[0]?.type === "recurring") type = "recurring"
  // else if (purgedScheduleParts[0]?.type === "unique") type = "unique"
  // else {
  // 	console.error("Unexpected schedule type", purgedScheduleParts);
  // }

  const rRuleSet = new RRuleSet()

  // Populate RuleSet with scheduleParts
  purgedScheduleParts?.forEach(
    ({
      status,
      type,
      rrule,
      // description,
      startDate,
      endDate,
      startTime,
      endTime,
      repeatCount,
      frequency, // yearly, monthly, weekly
      interval,
      byDay,
      bySetPos,
      exceptDate,
      addDate,
      // Are the following useful?
      byMonthDay,
      byMonth, // [int]
      // byMonthWeek,
    }) => {
      const [Y, M, D] = (startDate || '').split('-')
      const [h, m] = (startTime || '').split(':')

      // console.log({ startDate, startTime, exceptDate, byMonth })

      // Recurring events
      if (type === 'recurring') {
        // Main recurrance definition
        rRuleSet.rrule(rrule)

        // Exceptions: Exclude dates
        for (const { date } of exceptDate || []) {
          const [eY, eM, eD] = date.split('-')
          rRuleSet.exdate(datetime(eY, eM, eD, h, m))
        }
        // Exceptions: Add dates manualy
        for (const { date } of addDate || []) {
          const [aY, aM, aD] = date.split('-')
          rRuleSet.rdate(datetime(aY, aM, aD, h, m))
        }
        // Event spanning multiple days has no frequency but multiple schedules with unique dates+times
      } else if (type === 'unique') {
        rRuleSet.rdate(datetime(Y, M, D, h, m))
      }
    }
  )

  // TODO:
  // - Add legacy schedule if date is in the future
  if (legacySchedule?.length) {
    for (const { time_start, time_end, isSameDay } of legacySchedule) {
      const startDateTime = time_start.dateTimeRaw
      const endDateTime = time_end?.dateTimeRaw
      // const nowDateTime = new Date().toISOString().split(".").shift()
      const nowDateTime = stripDate(new Date())

      // Compare time_end with now to skip old events
      if (nowDateTime > (endDateTime || startDateTime)) {
        continue
      }

      const [sY, sM, sD, sh, sm] = startDateTime
        .split('T')
        ?.map(dateOrTime => dateOrTime.split(/[:-]/))
        .flat(Infinity)

      // console.log(nowDateTime, startDateTime, endDateTime, [sY, sM, sD, sh, sm])

      rRuleSet.rdate(datetime(sY, sM, sD, sh, sm))
    }
  }
  // TODO:
  // - prepare useful properties (list them here next)
  // const instances = rRuleSet.all()

  return {
    rRuleSet,
    schedule: purgedScheduleParts,
  }
}

export function transformEvent(eventRaw, languages) {
  if (eventRaw?.status !== 'published') return undefined

  // const parent =
  // 	eventRaw?.parent_event && transformEvent(eventRaw?.parent_event)
  const organizers =
    eventRaw?.organizers?.[0]?.organizations_id &&
    eventRaw?.organizers?.map(({ organizations_id: o }) => transformOrganization(o))
  // 	||
  // (parent?.organizers?.[0] &&
  // 	parent?.organizers?.map(({ organizations_id: o }) =>
  // 		transformOrganization(o),
  // 	))

  const mainOrganizer = organizers?.[0]
  // Inject booleans
  // TODO: old implementation, will be removed
  // const isRecurring =
  // 	eventRaw.recurring ||
  // 	eventRaw.schedule?.length + eventRaw.event_instances?.length > 1

  // TODO: old implementation, will be removed
  // const parentIsRecurring = parent?.recurring || parent?.schedule?.length > 0
  // const hasParent = !!parent

  // Fallback values from parent_event or first Organizer
  const e = languages
    ? fallbackOnParentsOfEvent({
        eventRaw,
        // parent,
        organizers,
        mainOrganizer,
        languages,
        // hasParent,
      })
    : eventRaw

  // TODO: old implementation, will be removed
  const hasNoSchedule = !eventRaw?.schedule?.[0]?.time_start

  // TODO: old implementation, will be removed
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

  const scheduleParts = e?.eventSchedule?.map(transformSchedule)
  const { schedule: eventSchedule, rRuleSet: scheduleRuleSet } = transformSchedules(
    scheduleParts,
    scheduleFormatted
  )

  for (const schedulePart of scheduleParts || []) {
    if (schedulePart?.type === 'invalid') {
      console.error(`ERROR: schedule is invalid in event "${e.name}"`)
      console.error(schedulePart)
      return null
    }
  }

  const { startDatePlus1, endDate, moreThan24h, isPast } = setEndDate({
    startDate: e.startDate,
    endDate: e.endDate,
    startTime: e.startTime,
    endTime: e.endTime,
  })
  const { startDateTime, endDateTime, startDateStr, endDateStr } = setDateTimes({
    startDate: e.startDate,
    startTime: e.startTime,
    endDate,
    endTime: e.endTime,
  })

  // Event can be "unique", "recurring" or "multidays" (or "unplanned")
  let recurrenceInferredFromData = undefined
  // here eventSchedule has already been purged of invalid parts
  if ((!!e?.startDate && eventSchedule?.length > 0) || moreThan24h)
    recurrenceInferredFromData = 'multidays'
  else if (!!e?.startDate) recurrenceInferredFromData = 'unique'
  else if (eventSchedule?.length > 0) recurrenceInferredFromData = 'recurring'
  // TODO: Remove this check when schedule is fully replaced by eventSchedule
  else if (e?.schedule?.length > 1) recurrenceInferredFromData = 'recurring'
  else if (!e?.schedule?.[0]?.time_start) recurrenceInferredFromData = 'unplanned'
  else if (e?.schedule?.length === 1) recurrenceInferredFromData = 'unique'
  else recurrenceInferredFromData = undefined

  const recurrence = e?.recurrence ?? recurrenceInferredFromData
  const isRecurring = recurrence === 'recurring'

  if (typeof recurrence === 'undefined' || recurrence !== recurrenceInferredFromData) {
    console.warn(`Recurrence might be wrong for event '${e.name}'`)
    console.warn({
      recurrence,
      'event.recurrence': e.recurrence,
      recurrenceInferredFromData,
      scheduleParts,
      eventSchedule,
    })
  }

  // Create Slug
  const nameSlug = slugify(e.name)
  // const dateSlug = scheduleFormatted?.[0].time_start.dateTimeRaw.substring(
  // 	0,
  // 	10,
  // )
  // const slug = `${nameSlug}-${dateSlug}`

  const shortId = e?.id?.substring(24) // only keep the last 12 characters
  const slugCanonical = `${nameSlug}-${shortId}`

  let time_start = transformDateTime(startDateTime)
  let time_end = transformDateTime(endDateTime)

  if (!time_start && recurrence === 'unique' && scheduleFormatted?.[0]) {
    time_start = scheduleFormatted[0].time_start
    time_end = scheduleFormatted[0].time_end
  }

  const unique = /unique|multidays/.test(recurrence)
    ? {
        slug: slugCanonical,
        path: createPath({ type: 'event', slug: slugCanonical }),
      }
    : null

  const canonical =
    recurrence === 'recurring'
      ? {
          slug: slugCanonical,
          path: createPath({ type: 'event', slug: slugCanonical }),
        }
      : null

  const allSchedulesArray = [...(scheduleFormatted || []), ...(eventSchedule || [])]
  allSchedulesArray.reverse()

  const occurrences =
    recurrence === 'recurring'
      ? scheduleRuleSet.all().map(date => {
          const dateStr = stripDate(date).slice(0, -3)
          const dateSlug = dateStr.replace(':', 'h').toLowerCase()
          const slug = `${nameSlug}-${dateSlug}`
          const path = createPath({ type: 'event', slug })

          // Map an occurance to its corresponding eventSchedule.
          // eventSchedule of type unique take precedence in this case because we might want to overwrite an occurance to add more data
          let matchingSchedule = allSchedulesArray.find(schedule => {
            // First run looks for more precise eventSchedulePart
            if (schedule.type === 'recurring') return false

            let currentDateStr =
              schedule?.startDateStr || // in case of eventSchedule
              schedule?.time_start?.dateStr // in case of formattedSchedule

            return currentDateStr === dateStr
          })

          if (!matchingSchedule) {
            // Second run looks for a match in recurring eventSchedulePart
            matchingSchedule = allSchedulesArray.find(schedule => {
              // First run looks for more precise eventSchedulePart
              if (schedule.type !== 'recurring') return false

              return schedule.rrule.all().some(d => d.getTime() === date.getTime())
            })
          }

          const time_start = transformDateTime(date)
          let time_end = undefined
          if (matchingSchedule?.time_end) {
            time_end = matchingSchedule.time_end
          } else if (matchingSchedule?.type === 'recurring') {
            const occEndTime = matchingSchedule.endTime
            let occEndDate = undefined
            if (matchingSchedule.endTime < matchingSchedule.startTime) {
              const { string } = datePlus1Day(date)
              occEndDate = string.split('T')[0]
            } else {
              occEndDate = dateStr.split('T')[0]
            }

            const occEndDateTime = occEndDate + (occEndTime ? `T${occEndTime}` : '')
            time_end = transformDateTime(occEndDateTime)
          } else if (matchingSchedule?.type === 'unique') {
            time_end = transformDateTime(matchingSchedule.endDateStr)
          }

          return {
            date,
            dateStr,
            dateSlug,
            slug,
            path,
            time_start,
            time_end,
            isPast: matchingSchedule?.isPast,
          }
        })
      : null

  // Transform images
  const cover_image = transformImage(e?.cover_image)
  // Transform Location
  const location = transformAddress(e.location)
  // Transform types
  const typesTranslated = e.event_types?.map(t => t.type)
  // Transform links
  const links = e.links?.map(link => transformLink(link, e.name))

  // date_updated can be undefined if never had modifications
  const date_updated = e.date_updated ?? e.date_created

  return {
    ...e,
    recurrence,
    isRecurring,
    startDateTime,
    endDateTime,
    time_start,
    time_end,
    // parentIsRecurring,
    hasNoSchedule,
    // hasParent,
    // parent_event: parent,
    scheduleFormatted,
    eventSchedule,
    scheduleRuleSet,
    // slug,
    // path,
    typesTranslated,
    cover_image,
    location,
    links,
    date_updated,
    // Dates computed fields
    startDatePlus1,
    endDate,
    moreThan24h,
    isPast,
    startDateTime,
    endDateTime,
    startDateStr,
    endDateStr,
    // occurrences for flattening
    ...unique,
    canonical,
    occurrences,
  }
}

const flattenEvents = (eventsUnflat = []) => {
  let eventsFlatten = []

  eventsUnflat.forEach(event => {
    if (event.recurrence === 'unplanned') {
      return null
    } else if (event.recurrence === 'unique') {
      eventsFlatten.push(event)
    } else if (event.recurrence === 'multidays') {
      eventsFlatten.push(event)
    } else if (event.recurrence === 'recurring') {
      const occurrencesExpanded = event.occurrences?.map(occ => ({
        ...event,
        ...occ,
      }))
      const canonicalExpanded = {
        ...event,
        ...event.canonical,
        isCanonical: true,
      }
      eventsFlatten.push(canonicalExpanded, ...occurrencesExpanded)
    } else {
      console.error(`Unexpected recurrence type: ${event.recurrence} for event: ${event.name}`)
    }

    // TODO: old implemetation to remove
    // if (event?.hasNoSchedule) {
    // 	// skip event entirely because it will be used by children if it is a recurring one
    // 	return null
    // } else {
    // 	const instancesFromSchedule = event.scheduleFormatted?.map((sched) => ({
    // 		...event,
    // 		...sched,
    // 	}))
    // 	eventsFlatten.push(...instancesFromSchedule)
    // }
  })

  return eventsFlatten
}

export async function fetchEvents() {
  // await client.refresh()

  const languages = await fetchLanguages()

  const eventsRaw = await client.request(
    readItems('events', {
      limit: -1,
      filter: {
        _and: [
          { status: { _eq: 'published' } },
          // { date_updated: { _gte: '$NOW(-6 months)' } }, // TODO: change this when we can check the last event time in schedule
        ],
      },
      fields: [
        // "*",
        'id',
        'status',
        'date_updated',
        'name',
        'event_types.type.code_name',
        'event_types.type.colorPalette',
        'event_types.type.translations.language_code',
        'event_types.type.translations.default_label',
        {
          location: [
            // "*",
            'name',
            'streetAddress',
            'streetNumber',
            'postalCode',
            'addressLocality',
            'addressRegion',
            'geo',
          ],
        },
        ...imageFields('cover_image.'),
        'recurrence',
        'startDate',
        'endDate',
        'startTime',
        'endTime',
        {
          eventSchedule: [
            // "*",
            'status',
            'description',
            'startDate',
            'endDate',
            'startTime',
            'endTime',
            'repeatCount',
            'frequency',
            'interval',
            'byDay',
            'byMonth',
            'byMonthWeek',
            'byMonthDay',
            'bySetPos',
            'exceptDate',
            'addDate',
          ],
        },
        'schedule',
        'links',
        'organizers.organizations_id.status',
        'organizers.organizations_id.name',
        'organizers.organizations_id.boardgame_related',
        'organizers.organizations_id.links',
        'organizers.organizations_id.slug',
        'organizers.organizations_id.location.*',
        ...imageFields('organizers.organizations_id.logo.'),
        ...imageFields('organizers.organizations_id.cover_image.'),
        'organizers.organizations_id.games_related_services.service.code_name',
        'organizers.organizations_id.games_related_services.service.colorPalette',
        'organizers.organizations_id.games_related_services.service.translations.language_code',
        'organizers.organizations_id.games_related_services.service.translations.default_label',
        'organizers.organizations_id.amenities',
        // ...imageFields("organizers.organizations_id.gallery.*."),
        'organizers.organizations_id.translations.languages_code',
        'organizers.organizations_id.translations.description',
        'translations.languages_code',
        'translations.highlighted_details',
        'translations.description',
        // "parent_event",
        // "parent_event.status",
        // "parent_event.name",
        // "parent_event.recurring",
        // "parent_event.schedule",
        // "parent_event.links",
        // ...imageFields("parent_event.cover_image."),
        // "parent_event.translations.languages_code",
        // "parent_event.translations.highlighted_details",
        // "parent_event.translations.description",
        // "parent_event.organizers.organizations_id.status",
        // "parent_event.organizers.organizations_id.name",
        // "parent_event.organizers.organizations_id.slug",
        // ...imageFields("parent_event.organizers.organizations_id.logo."),
        // ...imageFields("parent_event.organizers.organizations_id.cover_image."),
        // "parent_event.organizers.organizations_id.games_services",
        // "parent_event.organizers.organizations_id.amenities",
        // // ...imageFields("parent_event.organizers.organizations_id.gallery.*."),
        // "parent_event.organizers.organizations_id.translations.languages_code",
        // "parent_event.organizers.organizations_id.translations.description",
        // "event_instances",
      ],
    })
  )

  const eventsUnflat = eventsRaw?.map(e => transformEvent(e, languages)).filter(z => z)

  const eventsUnfiltered = flattenEvents(eventsUnflat)

  const d = new Date()
  const today = d.toISOString().substring(0, 10)
  const inSixMonths = new Date(d.setMonth(d.getMonth() + 6)).toISOString().substring(0, 10)

  // We split events and canonical events in 2 separate arrays because we cannot sort if time_start is undefined
  const canonicalEvents = eventsUnfiltered.filter(event => event.isCanonical)
  let events = eventsUnfiltered.filter(event => {
    if (event.isCanonical) return false

    if (!event.time_start) {
      if (!event.isCanonical) {
        console.error(`Event instance of "${event.name}" has no Start Date`)
      }
      return false
    }

    if (!event?.time_end) {
      return (
        event?.time_start?.dateStr > today
        // && event?.time_start?.dateStr < inSixMonths
      )
    }
    return (
      event?.time_end?.dateStr > today
      // && event?.time_end?.dateStr < inSixMonths
    )
  })

  events.sort((prev, next) => {
    const a = prev?.time_start?.dateStr
    const b = next?.time_start?.dateStr
    if (a > b) return 1
    if (a < b) return -1
    return 0
  })

  return { events, canonicalEvents }
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
