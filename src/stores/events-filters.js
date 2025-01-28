import { atom, onMount } from 'nanostores'
import { createRouter, redirectPage } from '@nanostores/router'

// Create router with search params
export const router = createRouter({
  events: '/fr/e/', // Our base route
})

const defaultStateTypes = []
const defaultStateCity = {
  city: '',
}
const defaultState = {
  types: defaultStateTypes,
  ...defaultStateCity,
  distance: '',
}

// Extract initial state from URL search params
export function getInitialState() {
  const { search } = router.get()
  return {
    ...defaultState,
    ...((search.types?.length ?? 0) > 0 ? { types: decodeTypes(search.types) } : {}),
    ...(search.city ? { city: search.city } : {}),
    ...(search.city && search.distance ? { distance: search.distance } : {}),
  }
}

// Create the store for reactive state
export const eventsFiltersStore = atom(defaultState)

onMount(eventsFiltersStore, () => {
  // Initialize store with URL params
  const timer = setTimeout(() => {
    eventsFiltersStore.set(getInitialState())
  }, 0)

  return () => clearTimeout(timer)
})

// Initialize and sync router with store
if (typeof window !== 'undefined') {
  // Keep router in sync with store
  eventsFiltersStore.listen(state => {
    redirectPage(
      router,
      'events',
      {},
      {
        ...(state.types.length > 0 ? { types: encodeTypes(state.types) } : {}),
        ...(state.city ? { city: state.city } : {}),
        ...(state.city && state.distance ? { distance: state.distance } : {}),
      }
    )
  })
}

function encodeTypes(types) {
  return types.length > 0 ? types.join(',') : defaultStateTypes
}

function decodeTypes(types) {
  return types.split(',').filter(Boolean)
}

// Helper actions to update state
export function updateFilter(key, value) {
  eventsFiltersStore.set({
    ...eventsFiltersStore.get(),
    [key]: value || '',
  })
}

// Action to update types (handles array specially)
export function updateTypes(types) {
  eventsFiltersStore.set({
    ...eventsFiltersStore.get(),
    types,
  })
}

// Action to clear city (also clears distance)
export function clearCity() {
  eventsFiltersStore.set({
    ...eventsFiltersStore.get(),
    ...defaultStateCity,
  })
}

// Action to reset all filters
export function resetFilters() {
  eventsFiltersStore.set(defaultState)
}
