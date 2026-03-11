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

        const area = org.location?.area?.code_name || null

        // Formatter les types pour la popup (code + label)
        const types =
          org.typesTranslated?.map(t => ({
            code: t.code_name,
            color: t.colorPalette || t.code_name,
            // on prend le label français par défaut pour le JSON
            label:
              t.translations?.find(tr => tr.language_code === 'fr-FR')?.default_label ||
              t.code_name,
          })) || []

        const services = org.servicesTranslated?.map(s => s.code_name) || []

        return {
          type: 'Feature',
          properties: {
            id: org.id,
            name: org.name,
            slug: org.slug || org.id, // Utilisé pour l'URL
            path: org.path, // Le vrai chemin pré-calculé
            logo: org.logo?.id || org.cover_image?.id || null, // ID de l'image Directus pour la popup
            color: colorPaletteToken,
            area,
            types,
            services,
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
