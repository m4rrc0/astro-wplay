/**
 * Normalizers for converting raw data into normalized form
 */

import { transformEvent as transformEventRaw } from '../transforms/events'
import { transformOrganization as transformOrganizationRaw } from '../transforms/organizations'
import { flattenEvents, extractCanonicalEvents } from '../transforms/flatten'

/**
 * Normalize a raw event into store format
 * @param {Object} rawEvent - Raw event data from Directus
 * @param {Object[]} languages - Available languages
 * @returns {Object} Normalized event with references
 */
export function normalizeEvent(rawEvent, languages) {
  return transformEventRaw(rawEvent, languages)
}

/**
 * Normalize a raw organization into store format
 * @param {Object} rawOrg - Raw organization data from Directus
 * @returns {Object} Normalized organization with references
 */
export function normalizeOrganization(rawOrg) {
  return transformOrganizationRaw(rawOrg)
}

/**
 * Denormalize an event by resolving its relationships
 * @param {Object} event - Normalized event
 * @param {Function} getEntity - Function to retrieve entities from store
 * @returns {Object} Denormalized event with resolved relationships
 */
export function denormalizeEvent(event, getEntity, options = {}) {
  const { depth = 1 } = options

  if (!event) return null

  if (depth === 0) return event

  const normalizedOrgs = event.organizerIds
    ?.map(id => getEntity('organizations', id))
    .filter(Boolean)
  const organizers = normalizedOrgs.map(org =>
    denormalizeOrganization(org, getEntity, { depth: depth - 1 })
  )

  const mainOrganizer = organizers?.[0]

  return {
    ...event,
    organizers,
    mainOrganizer,
  }
}

/**
 * Denormalize an organization by resolving its relationships
 * @param {Object} org - Normalized organization
 * @param {Function} getEntity - Function to retrieve entities from store
 * @returns {Object} Denormalized organization with resolved relationships
 */
export function denormalizeOrganization(org, getEntity, options = {}) {
  const { depth = 1 } = options

  if (!org) return null

  if (depth === 0) return org

  const normalizedEvents = org.eventIds?.map(id => getEntity('events', id)).filter(Boolean)
  const denormalizedEvents = normalizedEvents.map(event =>
    denormalizeEvent(event, getEntity, { depth: depth - 1 })
  )
  const events = flattenEvents(denormalizedEvents, { after: new Date() })
  const canonicalEvents = extractCanonicalEvents(events)

  return {
    ...org,
    events,
    canonicalEvents,
  }
}
