import { atom, onMount } from 'nanostores'
import { createRouter as cr, redirectPage } from '@nanostores/router'

export const createRouter = cr
// Create router with search params
export const router = createRouter({
  organizations: '/fr/o/', // Our base route
})

const defaultState = {
  areas: [],
  types: [],
  services: [],
}

// Extract initial state from URL search params
export function getInitialState() {
  const { search } = router.get() || {}
  return {
    ...defaultState,
    ...((search?.areas?.length ?? 0) > 0 ? { areas: decodeArray(search?.areas) } : {}),
    ...((search?.types?.length ?? 0) > 0 ? { types: decodeArray(search?.types) } : {}),
    ...((search?.services?.length ?? 0) > 0 ? { services: decodeArray(search?.services) } : {}),
  }
}

// Create the store for reactive state
export const organizationsFiltersStore = atom(defaultState)

onMount(organizationsFiltersStore, () => {
  // Initialize store with URL params
  const timer = setTimeout(() => {
    organizationsFiltersStore.set(getInitialState())
  }, 0)

  return () => clearTimeout(timer)
})

// Initialize and sync router with store
if (typeof window !== 'undefined') {
  // Keep router in sync with store
  organizationsFiltersStore.listen(state => {
    redirectPage(
      router,
      'organizations',
      {},
      {
        ...((state.areas?.length ?? 0) > 0 ? { areas: encodeArray(state.areas) } : {}),
        ...((state.types?.length ?? 0) > 0 ? { types: encodeArray(state.types) } : {}),
        ...((state.services?.length ?? 0) > 0 ? { services: encodeArray(state.services) } : {}),
      }
    )
  })
}

function encodeArray(array) {
  return (array?.length ?? 0) > 0 ? array.join(',') : ''
}

function decodeArray(str) {
  return str.split(',').filter(Boolean)
}

// Helper actions to update state
export function updateFilter(key, value) {
  organizationsFiltersStore.set({
    ...organizationsFiltersStore.get(),
    [key]: value || '',
  })
}

// Action to reset all filters
export function resetFilters() {
  organizationsFiltersStore.set(defaultState)
}
