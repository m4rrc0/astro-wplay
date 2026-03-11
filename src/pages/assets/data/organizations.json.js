import { areas as areasData } from '../../../store/transforms/utils.js'
import { fetchLanguages, start as startDirectus } from '../../../services/directus.js'
import { getOrganizations } from '../../../store/dataService.js'
import { seedData } from '../../../store/seed.js'

export async function GET({ params, request }) {
  await startDirectus()
  await seedData()

  const organizations = await getOrganizations()
  const boardgameOrgs = organizations?.filter(o => o.boardgame_related) ?? []

  const geojson = {
    type: 'FeatureCollection',
    features: boardgameOrgs
      .filter(org => org.location?.geo?.coordinates)
      .map(org => {
        const colorPaletteToken =
          org.typesTranslated?.[0]?.colorPalette || org.typesTranslated?.[0]?.code_name || 'default'

        return {
          type: 'Feature',
          properties: {
            id: org.id,
            name: org.name,
            color: colorPaletteToken,
          },
          geometry: {
            type: 'Point',
            coordinates: org.location.geo.coordinates,
          },
        }
      }),
  }

  return new Response(JSON.stringify(geojson), {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
