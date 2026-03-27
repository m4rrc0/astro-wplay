import { getImage } from 'astro:assets'

async function getOptimizedImages(dataArray, globImages, organizations, width = 300) {
  const result = await Promise.all(
    dataArray.map(async partner => {
      const pathImage = Object.keys(globImages).find(path => path.includes(partner.fileName))
      const module = pathImage ? await globImages[pathImage]() : null
      const originalImage = module?.default ?? null

      let optimizedImage = null
      if (originalImage) {
        optimizedImage = await getImage({
          src: originalImage,
          width,
        })
      }

      const slug = partner.fileName.replace(/^logo-/, '')
      const org = organizations.find(o => o.slug === slug)

      let finalLink = null
      if (org) {
        finalLink = `/fr/o/${org.slug}/`
      } else if (partner.link) {
        finalLink = partner.link
      }

      return {
        img: originalImage,
        optimizedMeta: optimizedImage,
        alt: partner.alt || partner.name,
        displayName: partner.name || partner.alt,
        role: partner.role || '',
        fileName: partner.fileName,
        finalLink,
      }
    })
  )
  return result.filter(p => p && p.img)
}

export default getOptimizedImages
