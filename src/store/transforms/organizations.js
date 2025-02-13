import { createPath } from '@utils'
import {
  transformAddress,
  transformImage,
  transformLink,
  translateFromCodeName,
  transformRichText,
} from './utils'

/**
 * Transform a raw organization from Directus into our normalized format
 * @param {Object} orgRaw Raw organization data from Directus
 * @returns {Object} Transformed organization data
 */
export function transformOrganization(orgRaw) {
  if (!orgRaw) return null

  const {
    id,
    status,
    name,
    slug,
    organization_types,
    games_related_services,
    location,
    logo,
    cover_image,
    opening_hours,
    amenities,
    links,
    events,
  } = orgRaw

  const translations = orgRaw?.translations?.map(t => ({
    ...t,
    rich_text_content: transformRichText(t?.rich_text_content),
  }))

  // Transform location
  const locationTransformed = transformAddress(location)

  // Transform types
  const typesTranslated = organization_types?.map(t => t.type)

  // Transform services
  const servicesTranslated = games_related_services?.map(s => s.service)

  // Transform opening hours
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
  const logoTransformed = transformImage(logo)
  const cover_image_transformed = transformImage(cover_image)

  // Transform links
  const linksTransformed = links?.map(link => transformLink(link, name))

  // Create path
  const path = createPath({ type: 'organization', slug })

  return {
    ...orgRaw,
    path,
    location: locationTransformed,
    typesTranslated,
    servicesTranslated,
    opening_hours_strings,
    amenities_translated,
    logo: logoTransformed,
    cover_image: cover_image_transformed,
    translations,
    links: linksTransformed,
    // Store event IDs for normalization
    eventIds: events?.map(e => e.events_id?.id).filter(Boolean),
  }
}
