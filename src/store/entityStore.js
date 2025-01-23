/**
 * Simple entity store for managing normalized data
 */

// Store structure holding our normalized entities
const store = {
  events: new Map(),
  organizations: new Map(),
}

/**
 * Get an entity by type and id
 * @param {string} type - Entity type ('events' or 'organizations')
 * @param {string} id - Entity ID
 * @returns {Object|undefined} The entity or undefined if not found
 */
export function getEntity(type, id) {
  return store[type]?.get(id)
}

/**
 * Store an entity
 * @param {string} type - Entity type ('events' or 'organizations')
 * @param {string} id - Entity ID
 * @param {Object} entity - The entity to store
 */
export function setEntity(type, id, entity) {
  if (!store[type]) {
    store[type] = new Map()
  }
  store[type].set(id, entity)
}

/**
 * Get all entities of a specific type
 * @param {string} type - Entity type ('events' or 'organizations')
 * @returns {Object[]} Array of entities
 */
export function getAllEntities(type) {
  return Array.from(store[type]?.values() || [])
}

/**
 * Clear all entities of a specific type
 * @param {string} type - Entity type ('events' or 'organizations')
 */
export function clearEntities(type) {
  if (store[type]) {
    store[type].clear()
  }
}

/**
 * Clear the entire store
 */
export function clearStore() {
  Object.keys(store).forEach(type => {
    store[type].clear()
  })
}
