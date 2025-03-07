import { DomParser } from '@thednp/domparser';
import { DIRECTUS_URL } from '@utils/env'
import { slugify, createPath, areasBe, toTzDate, stripDate, datePlus1Day } from '@utils'

const cmsBaseUrl = DIRECTUS_URL
const cmsAssetsUrl = `${cmsBaseUrl}/assets`

/**
 * Transform an address object
 * @param {Object} location - Location object from Directus
 * @returns {Object} Transformed address
 */
export function transformAddress(location) {
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
  { code_name: 'website', fr: 'Site web', iconName: 'ph:link' },
  { code_name: 'web_page', fr: 'Page web', iconName: 'ph:link' },
  {
    code_name: 'facebook_page',
    fr: 'Page Facebook',
    iconName: 'ph:facebook-logo',
  },
  {
    code_name: 'facebook_event',
    fr: 'Événement Facebook',
    iconName: 'ph:facebook-logo',
  },
  { code_name: 'twitter', fr: 'Twitter', iconName: 'ph:twitter-logo' },
  { code_name: 'instagram', fr: 'Instagram', iconName: 'ph:instagram-logo' },
  { code_name: 'youtube_channel', fr: 'Youtube', iconName: 'ph:youtube-logo' },

  { code_name: 'spotify', fr: 'Spotify', iconName: 'ph:spotify-logo' },
  { code_name: 'shop', fr: 'Boutique', iconName: 'ph:shopping-cart-simple' },
  { code_name: 'tripadvisor', fr: 'Tripadvisor', iconName: 'cib:tripadvisor' },
  {
    code_name: 'facebook_group',
    fr: 'Groupe Facebook',
    iconName: 'ph:facebook-logo',
  },
  { code_name: 'forum', fr: 'Forum', iconName: 'ph:chats' },
  { code_name: 'talk', fr: 'Le Talk', iconName: 'ri:kakao-talk-line' },
  // Areas
  ...areas,
  // Days of week
  { code_name: 'monday', fr: 'Lundi' },
  { code_name: 'tuesday', fr: 'Mardi' },
  { code_name: 'wednesday', fr: 'Mercredi' },
  { code_name: 'thursday', fr: 'Jeudi' },
  { code_name: 'friday', fr: 'Vendredi' },
  { code_name: 'saturday', fr: 'Samedi' },
  { code_name: 'sunday', fr: 'Dimanche' },
  // Amenities
  { code_name: 'snacks', fr: 'Snacks' },
  { code_name: 'drinks', fr: 'Boissons' },
  { code_name: 'food', fr: 'Nourriture' },
  { code_name: 'vegetarian', fr: 'Végétarien' },
  { code_name: 'vegan', fr: 'Végan' },
  { code_name: 'handicapped', fr: 'Accessible' },
  { code_name: 'children', fr: 'Enfants bienvenus' },

  // More generic matches last just to be sure to match the rest first
  {
    code_name: 'facebook',
    fr: 'Page Facebook',
    iconName: 'ph:facebook-logo',
  },
  { code_name: 'youtube', fr: 'Youtube', iconName: 'ph:youtube-logo' },
  {
    code_name: 'linkedin',
    fr: 'LinkedIn',
    iconName: 'ph:linkedin-logo',
  },
  {
    code_name: 'linktr.ee|linktree',
    fr: 'Linktree',
    iconName: 'ph:linktree-logo',
  },
  {
    code_name: 'pinterest',
    fr: 'Pinterest',
    iconName: 'ph:pinterest-logo',
  },
  {
    code_name: 'discord',
    fr: 'Discord',
    iconName: 'ph:discord-logo',
  },
  {
    code_name: 'tiktok',
    fr: 'TikTok',
    iconName: 'ph:tiktok-logo',
  },
  {
    code_name: 'twitch',
    fr: 'Twitch',
    iconName: 'ph:twitch-logo',
  },
  {
    code_name: 'ticket|tickets|inscription|réservation|billets|billet|billeterie',
    // fr: "LinkedIn",
    iconName: 'ph:ticket-light',
  },
  {
    code_name: 'date|dates|agenda|calendrier|calendrier|agenda|planning|plannings|event',
    iconName: 'ph:calendar-dots-light',
  },
  {
    code_name: 'my ludo|myludo|Board game geek|boardgamegeek|jeux',
    fr: 'My Ludo',
    iconName: 'ph:checkerboard-thin',
  },
  {
    code_name: 'catalogue',
    iconName: 'ph:book-open-text-thin',
  },
  { code_name: 'web', fr: 'Web', iconName: 'ph:link' },
  {
    code_name: 'Meetup|meetup',
    fr: 'Meetup',
    iconName: 'ph:cheers-light',
  },
  {
    code_name: 'Collection|collection|Liste|liste',
    fr: 'Collection',
    iconName: 'ph:list-bullets-light',
  },
]

/**
 * Translate a code name to its display value
 * @param {string} code_name Code name to translate
 * @param {string} [warningCue] Optional context for warning messages
 * @returns {Object} Translated object with code_name and fr properties
 */
export function translateFromCodeName(code_name, warningCue) {
  if (!code_name) {
    console.log('--SELF WARNING-- No code_name provided', warningCue)
    return { code_name, fr: code_name }
  }

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

/**
 * Transform an image object
 * @param {Object} i - Image object from Directus
 * @returns {Object} Transformed image
 */
export function transformImage(i) {
  return i?.id
    ? {
      ...i,
      src: `${cmsAssetsUrl}/${i?.id}`,
    }
    : i
}

/**
 * Transform a link object
 * @param {Object} i - Link object from Directus
 * @returns {Object} Transformed link
 */
export function transformLink({ name, url }, warningCue) {
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

export function transformRichText(html) {
  if (!html) return html

  // Remove potentially dangerous elements and attributes
  const dangerousElements = ['script', 'iframe', 'object', 'embed', 'form']
  const dangerousAttributes = ['onerror', 'onload', 'onmouseover', 'onclick', 'onmouseout', 'onkeydown', 'onkeyup']

  let sanitizedHtml = html

  // Remove dangerous elements
  dangerousElements.forEach(element => {
    const regex = new RegExp(`<${element}[^>]*>.*?<\/${element}>`, 'gis')
    sanitizedHtml = sanitizedHtml.replace(regex, '')
  })

  // Remove dangerous attributes
  dangerousAttributes.forEach(attr => {
    const regex = new RegExp(`\\s${attr}=["'][^"']*["']`, 'gi')
    sanitizedHtml = sanitizedHtml.replace(regex, '')
  })

  // Remove javascript: and data: URLs
  sanitizedHtml = sanitizedHtml.replace(/(?:\bon[a-z]+\s*=|href\s*=\s*["'](?:javascript:|data:))[^"']*/gi, '')

  // NOTE: Old implementation
  // Add security attributes to all links
  // sanitizedHtml = sanitizedHtml.replaceAll('<a href', '<a target="_blank" rel="noopener noreferrer nofollow" href')

  // initialize DOM Parsing
  const doc = DomParser().parseFromString(sanitizedHtml).root;

  const links = doc.getElementsByTagName("a");
  links.forEach(link => {
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer nofollow");
  })

  return doc?.children?.map(c => c.outerHTML).join('') || sanitizedHtml
}
