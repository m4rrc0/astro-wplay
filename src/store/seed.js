import { getEvents, getOrganizations } from './dataService'

export async function seedData() {
  // Run async fetching in parallel
  await Promise.all([getEvents(), getOrganizations()])
}
