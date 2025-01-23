import EleventyFetch from '@11ty/eleventy-fetch'
import { eleventyFetchOptions } from './env'

async function fetch(url, options = {}) {
  const { method = 'GET', headers = {}, body, credentials = 'include', ...otherOptions } = options

  // Convert body to string if it's an object
  const stringifiedBody = typeof body === 'object' ? JSON.stringify(body) : body

  try {
    const response = await EleventyFetch(url, {
      ...eleventyFetchOptions,
      ...otherOptions,
      fetchOptions: {
        method,
        headers,
        body: stringifiedBody,
        credentials,
        ...otherOptions,
      },
    })

    // Parse response based on content type
    let data
    const contentType = headers?.['content-type'] || 'application/json'
    if (contentType.includes('application/json')) {
      data = JSON.parse(response.toString())
    } else {
      data = response.toString()
    }

    return {
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => data,
      text: async () => response.toString(),
      headers: new Headers(headers),
    }
  } catch (error) {
    // If it's an HTTP error from eleventy-fetch
    if (error.response) {
      const { status, statusText } = error.response
      return {
        ok: false,
        status,
        statusText,
        json: async () => ({ error: statusText }),
        text: async () => statusText,
        headers: new Headers(headers),
      }
    }

    // For other errors
    return {
      ok: false,
      status: 500,
      statusText: error.message || 'Internal Error',
      json: async () => ({ error: error.message || 'Internal Error' }),
      text: async () => error.message || 'Internal Error',
      headers: new Headers(headers),
    }
  }
}

export default fetch
