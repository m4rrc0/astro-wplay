import { slugify, createPath } from '@utils'
import { transformAddress, translateFromCodeName, transformImage, transformLink } from './utils'
import { transformSchedulePart, transformSchedules } from './schedule'
import { setEndDate, setDateTimes, transformDateTime } from './dates'
import { generateOccurrences } from './flatten'

/**
 * Transform a raw event from Directus into our normalized format
 * @param {Object} eventRaw - Raw event from Directus
 * @param {Object[]} languages - Available languages
 * @returns {Object} Normalized event
 */
export function transformEvent(eventRaw, languages) {
  if (!eventRaw || eventRaw.status !== 'published') return null
  if (!eventRaw?.recurrence) {
    console.warn(`--SELF WARNING-- Event "${eventRaw?.name}" has no reccurrence set.`)
  }

  const mainOrganizer = eventRaw.organizers?.[0]?.organizations_id

  // Get basic event data
  const event = {
    id: eventRaw.id,
    status: eventRaw.status,
    date_updated: eventRaw.date_updated,
    name: eventRaw.name,
    nameSlug: slugify(eventRaw.name),

    // Event types
    typesTranslated: eventRaw.event_types?.map(t => t.type),

    // Event links
    links: eventRaw.links?.map(link => transformLink(link, eventRaw.name)),

    // date_updated can be undefined if never had modifications
    date_updated: eventRaw.date_updated ?? eventRaw.date_created,

    // Dates and times
    startDate: eventRaw.startDate,
    endDate: eventRaw.endDate,
    startTime: eventRaw.startTime,
    endTime: eventRaw.endTime,
    recurrence: eventRaw?.recurrence,
    isRecurring: eventRaw.recurrence === 'recurring',

    // -- Inherit some properties from mainOrganizer
    // Location
    location: transformAddress(eventRaw.location || mainOrganizer?.location),

    // Media
    cover_image: transformImage(eventRaw.cover_image || mainOrganizer?.cover_image),

    games_related_services:
      eventRaw.games_related_services || mainOrganizer?.games_related_services,
    amenities_translated: (mainOrganizer?.amenities || [])?.map(translateFromCodeName),
    // amenities_translated: eventRaw.amenities_translated,
    gallery: eventRaw.gallery || mainOrganizer?.gallery,
    // TODO: fetch languages and pass it to this function
    translations: ['fr'].map(code => {
      const eventTr = eventRaw.translations?.find(t => t.languages_code === code)
      const orgTr = mainOrganizer?.translations?.find(t => t.languages_code === code)
      return {
        languages_code: code,
        highlighted_details: eventTr?.highlighted_details || orgTr?.highlighted_details || '',
        description: eventTr?.description || orgTr?.description || '',
      }
    }),

    // Store only IDs for relationships and minimal organizer data
    organizerIds: (eventRaw.organizers || []).map(org => org.organizations_id?.id).filter(Boolean),
    organizers: (eventRaw.organizers || [])
      .map(org => {
        const { id, name, status } = org.organizations_id || {}
        return id ? { id, name, status } : null
      })
      .filter(Boolean),
  }

  const scheduleParts = eventRaw?.eventSchedule?.map(transformSchedulePart)
  const { schedule: eventSchedule, rRuleSet: scheduleRuleSet } = transformSchedules(scheduleParts)

  // Check for invalid schedule parts
  for (const schedulePart of scheduleParts || []) {
    if (schedulePart?.type === 'invalid') {
      console.error(`ERROR: schedule is invalid in event "${event.name}"`)
      console.error(schedulePart)
      return null
    }
  }

  // Process dates
  const { startDatePlus1, endDate, moreThan24h, isPast } = setEndDate({
    startDate: event.startDate,
    endDate: event.endDate,
    startTime: event.startTime,
    endTime: event.endTime,
  })

  const { startDateTime, endDateTime, startDateStr, endDateStr } = setDateTimes({
    startDate: event.startDate,
    startTime: event.startTime,
    endDate,
    endTime: event.endTime,
  })

  event.startDatePlus1 = startDatePlus1
  event.endDate = endDate
  event.moreThan24h = moreThan24h
  event.isPast = isPast
  event.startDateTime = startDateTime
  event.endDateTime = endDateTime
  event.startDateStr = startDateStr
  event.endDateStr = endDateStr

  event.time_start = transformDateTime(startDateTime)
  event.time_end = transformDateTime(endDateTime)

  // Skip events without time_start AND without eventScheduleParts
  if (!event.time_start && !eventSchedule?.length) {
    console.warn(
      `--SELF WARNING-- Event '${event.name}' has no time_start and no eventScheduleParts`
    )
    return null
  }

  // TODO: can we remove this safely?
  // Determine recurrence type
  // let recurrenceInferredFromData
  // if ((!!event?.startDate && eventSchedule?.length > 0) || moreThan24h) {
  //   recurrenceInferredFromData = 'multidays'
  // } else if (!!event?.startDate) {
  //   recurrenceInferredFromData = 'unique'
  // } else if (eventSchedule?.length > 0) {
  //   recurrenceInferredFromData = 'recurring'
  // } else if (eventRaw?.schedule?.length > 1) {
  //   recurrenceInferredFromData = 'recurring'
  // } else if (!eventRaw?.schedule?.[0]?.time_start) {
  //   recurrenceInferredFromData = 'unplanned'
  // } else if (eventRaw?.schedule?.length === 1) {
  //   recurrenceInferredFromData = 'unique'
  // }

  // Add computed properties
  const nameSlug = slugify(event.name)
  const shortId = event.id?.substring(24)
  const slugCanonical = `${nameSlug}-${shortId}`

  const unique = /unique|multidays/.test(event.recurrence)
    ? {
        slug: slugCanonical,
        path: createPath({ type: 'event', slug: slugCanonical }),
      }
    : null

  const canonical = event.isRecurring
    ? {
        slug: slugCanonical,
        path: createPath({ type: 'event', slug: slugCanonical }),
      }
    : null

  // compute event occurrences
  if (event.isRecurring) {
    event.occurrences = generateOccurrences(event, eventSchedule, scheduleRuleSet)
  }

  // Add all computed properties to event
  return {
    ...event,
    schedule: eventSchedule,
    scheduleRuleSet,
    hasSchedule: !!eventSchedule?.length,
    scheduleTypes: eventSchedule ? [...new Set(eventSchedule.map(s => s.type))] : [],

    ...unique,
    canonical,
  }
}
