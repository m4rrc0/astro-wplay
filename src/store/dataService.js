import { client } from '../services/directus'
import { getEntity, setEntity, getAllEntities } from './entityStore'
import {
  normalizeEvent,
  denormalizeEvent,
  normalizeOrganization,
  denormalizeOrganization,
} from './normalizers'
import { flattenEvents } from './transforms/flatten'
import { readItems } from '@directus/sdk'

/**
 * Data Service - Facade for data operations
 * Handles caching, normalization, and data fetching
 */

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

const dicoFields = preString => [
  preString + 'code_name',
  preString + 'colorPalette',
  preString + 'translations.language_code',
  preString + 'translations.default_label',
]

const locationFields = [
  'name',
  'streetAddress',
  'streetNumber',
  'postalCode',
  'addressLocality',
  'addressRegion',
  'geo',
]

const eventFields = [
  'id',
  'status',
  'date_updated',
  'name',
  ...dicoFields('event_types.type.'),
  { location: locationFields },
  ...imageFields('cover_image.'),
  'recurrence',
  'startDate',
  'endDate',
  'startTime',
  'endTime',
  // Schedule fields
  {
    eventSchedule: [
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
  // 'schedule', // TODO: Remove when we checked everything has been migrated to eventSchedule
  'links',
  'translations.*',
  // Only fetch minimal organization data - full data will be fetched by getOrganization
  'organizers.organizations_id.id',
  'organizers.organizations_id.status',
  'organizers.organizations_id.name',
  // Also fetch organization information that has to be merged
  'organizers.organizations_id.location.*',
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
]

const organizationFields = [
  'id',
  'status',
  'date_updated',
  'name',
  'slug',
  ...dicoFields('organization_types.type.'),
  'boardgame_related',
  ...imageFields('logo.'),
  ...imageFields('cover_image.'),
  'opening_hours',
  ...dicoFields('games_related_services.service.'),
  { location: locationFields },
  'amenities',
  'links',
  'translations.*',

  // Only fetch minimal event data - full data will be fetched by getEvents
  'events.events_id.id',
  'events.events_id.status',
  'events.events_id.name',
  'events.events_id.startDate',
  'events.events_id.endDate',
  'events.events_id.startTime',
  'events.events_id.endTime',
]

/**
 * Get a single event by ID
 * @param {string} id - Event ID
 * @param {Object} options - Options for fetching
 * @param {boolean} options.force - Force fetch from API even if in store
 * @returns {Promise<Object>} The event with resolved relationships
 */
export async function getEvent(id, { force = false } = {}) {
  // Try to get from store first
  if (!force) {
    const storedEvent = getEntity('events', id)
    if (storedEvent) {
      return denormalizeEvent(storedEvent, getEntity)
    }
  }

  try {
    // Fetch from API if not in store or force refresh
    const rawEvent = await client.request(
      readItems('events', {
        filter: { id: { _eq: id } },
        limit: 1,
        fields: eventFields,
      })
    )

    if (!rawEvent?.[0]) {
      return null
    }

    // Normalize and store the event
    const normalizedEvent = normalizeEvent(rawEvent[0])
    setEntity('events', id, normalizedEvent)

    // Return denormalized event
    return denormalizeEvent(normalizedEvent, getEntity)
  } catch (error) {
    console.error('Error fetching event:', error)
    throw error
  }
}

/**
 * Get multiple events with filtering and pagination
 * @param {{
 *   filter?: Object,
 *   limit?: number,
 *   page?: number,
 *   force?: boolean,
 *   languages?: Object[],
 *   after?: Date,
 *   before?: Date,
 *   flatten?: boolean
 * }} [options] - Query options
 * @returns {Promise<Object[]>} Array of events with resolved relationships
 */
export async function getEvents(options = {}) {
  const {
    filter = { status: { _eq: 'published' } },
    limit = -1,
    page = 1,
    force = false,
    languages: initialLanguages = null,
    after = null,
    before = null,
    flatten = true,
  } = options

  if (!force) {
    // Get from store if not forcing refresh
    const storedEvents = getAllEntities('events')
    if (storedEvents.length > 0) {
      const denormalizedEvents = storedEvents.map(event => denormalizeEvent(event, getEntity))
      return flatten ? flattenEvents(denormalizedEvents, { after, before }) : denormalizedEvents
    }
  }

  try {
    // First fetch languages if not provided
    let languages = initialLanguages
    if (!languages) {
      const langResponse = await client.request(
        readItems('languages', {
          limit: -1,
        })
      )
      languages = langResponse
      // languages = await fetchLanguages()
    }

    const rawEvents = await client.request(
      readItems('events', {
        filter,
        limit,
        page,
        fields: eventFields,
      })
    )

    if (!rawEvents?.length) {
      return []
    }

    // Normalize and store each event
    const normalized = rawEvents
      .map(eventRaw => {
        const normalizedEvent = normalizeEvent(eventRaw, languages)
        if (normalizedEvent) {
          setEntity('events', normalizedEvent.id, normalizedEvent)
        }
        return normalizedEvent
      })
      .filter(Boolean)

    // Return denormalized events
    const denormalizedEvents = normalized.map(event => denormalizeEvent(event, getEntity))
    return flatten ? flattenEvents(denormalizedEvents, { after, before }) : denormalizedEvents
  } catch (error) {
    console.error('Error fetching events:', error)
    throw error
  }
}

/**
 * Get multiple organizations with filtering and pagination
 * @param {{
 *   filter?: Object,
 *   limit?: number,
 *   sort?: string,
 *   page?: number,
 *   force?: boolean,
 * }} [options] - Query options
 * @returns {Promise<Object[]>} Array of organizations with resolved relationships
 */
export async function getOrganizations(options = {}) {
  const {
    filter = { status: { _in: ['published', 'to_check'] } },
    limit = -1,
    sort = '-date_updated',
    page = 1,
    force = false,
  } = options

  if (!force) {
    // Get from store if not forcing refresh
    const storedOrgs = getAllEntities('organizations')
    if (storedOrgs.length > 0) {
      return storedOrgs.map(org => denormalizeOrganization(org, getEntity))
    }
  }

  try {
    const rawOrgs = await client.request(
      readItems('organizations', {
        filter,
        limit,
        sort,
        page,
        fields: organizationFields,
      })
    )

    if (!rawOrgs?.length) {
      return []
    }

    // Store all organizations and their relationships
    const normalizedOrgs = rawOrgs
      .map(org => {
        const normalizedOrg = normalizeOrganization(org)
        if (normalizedOrg) {
          setEntity('organizations', org.id, normalizedOrg)
        }
        return normalizedOrg
      })
      .filter(Boolean)

    // Return denormalized organizations
    return normalizedOrgs.map(org => denormalizeOrganization(org, getEntity))
  } catch (error) {
    console.error('Error fetching organizations:', error)
    throw error
  }
}

/**
 * Get a single organization by ID
 * @param {string} id - Organization ID
 * @param {{ force?: boolean }} [options] - Query options
 * @returns {Promise<Object>} Organization data
 */
export async function getOrganization(id, { force = false } = {}) {
  // Try to get from store first
  if (!force) {
    const cached = getEntity('organizations', id)
    if (cached) {
      return denormalizeOrganization(cached, getEntity)
    }
  }

  // Fetch from API
  const [organizationRaw] = await client.request(
    readItems('organizations', {
      filter: { id: { _eq: id } },
      limit: 1,
      fields: organizationFields,
    })
  )

  if (!organizationRaw) {
    console.warn(`No organization found with id ${id}`)
    return null
  }

  // Normalize and store
  const normalized = normalizeOrganization(organizationRaw)
  setEntity('organizations', normalized)

  // Return denormalized
  return denormalizeOrganization(normalized, getEntity)
}
