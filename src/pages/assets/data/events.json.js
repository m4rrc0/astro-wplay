import { areas as areasData } from '../../../store/transforms/utils.js'
import { fetchLanguages, start as startDirectus } from '../../../services/directus.js'
import { getEvents } from '../../../store/dataService.js'
import { seedData } from '../../../store/seed.js'

export async function GET({ params, request }) {
  await startDirectus()
  await seedData()

  const today = new Date()
  const events = await getEvents({
    flatten: true,
    after: today,
  })

  const geojson = {
    type: 'FeatureCollection',
    features: events
      .filter(event => event.location?.geo?.coordinates)
      .map(event => {
        const typeArr = event.typesTranslated || event.event_types || []
        const colorPaletteToken = typeArr?.[0]?.colorPalette || typeArr?.[0]?.code_name || 'default'

        const area = event.location?.area?.code_name || null

        // Formatter les types pour la popup (code + label)
        const types =
          typeArr?.map(t => ({
            code: t.code_name,
            color: t.colorPalette || t.code_name,
            // on prend le label français par défaut pour le JSON
            label:
              t.translations?.find(tr => tr.language_code === 'fr-FR' || tr.language_code === 'fr')
                ?.default_label || t.code_name,
          })) || []

        return {
          type: 'Feature',
          properties: {
            id: event.id,
            name: event.name,
            slug: event.slug || event.id, // Utilisé pour l'URL
            path: event.path, // Le vrai chemin pré-calculé
            logo: event.cover_image?.id || null, // ID de l'image Directus pour la popup
            color: colorPaletteToken,
            area,
            types,
          },
          geometry: {
            type: 'Point',
            coordinates: event.location.geo.coordinates,
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
