// API utility with JWT token handling
const API_BASE_URL = 'http://localhost:8080'
const responseCache = new Map()
const blobUrlCache = new Map()
const inFlightJsonRequests = new Map()
const inFlightBlobRequests = new Map()

const getCurrentUserId = () => {
  const userStr = localStorage.getItem('user')
  if (!userStr) {
    return 'anon'
  }

  try {
    const parsed = JSON.parse(userStr)
    return parsed?.id != null ? String(parsed.id) : 'anon'
  } catch {
    return 'anon'
  }
}

const getCacheKey = (endpoint) => `${getCurrentUserId()}:${endpoint}`

const revokeCachedBlobUrl = (cacheKey) => {
  const cached = blobUrlCache.get(cacheKey)
  if (cached?.url) {
    URL.revokeObjectURL(cached.url)
  }
}

const clearResponseCache = () => {
  responseCache.clear()
  inFlightJsonRequests.clear()
}

export const clearApiCache = () => {
  clearResponseCache()
  for (const cacheKey of blobUrlCache.keys()) {
    revokeCachedBlobUrl(cacheKey)
  }
  inFlightBlobRequests.clear()
  blobUrlCache.clear()
}

export const invalidateApiCache = (endpoint) => {
  const cacheKey = getCacheKey(endpoint)
  responseCache.delete(cacheKey)
  inFlightJsonRequests.delete(cacheKey)
  revokeCachedBlobUrl(cacheKey)
  inFlightBlobRequests.delete(cacheKey)
  blobUrlCache.delete(cacheKey)
}

export const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken')
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export const apiCall = async (endpoint, options = {}) => {
  const method = (options.method || 'GET').toUpperCase()
  const hasBody = options.body !== undefined && options.body !== null
  const hasFormDataBody = typeof FormData !== 'undefined' && options.body instanceof FormData

  const headers = {
    ...getAuthHeaders(),
    ...(hasBody && !hasFormDataBody ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers,
  }

  if (method !== 'GET') {
    // Invalidate JSON cache on writes, but preserve photo/blob cache.
    clearResponseCache()
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    const contentType = response.headers.get('content-type') || ''
    const isJson = contentType.includes('application/json')
    const data = isJson ? await response.json() : await response.text()

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
      const message = typeof data === 'string' ? data : data.message
      throw new Error(message || 'API request failed')
    }

    return data
  } catch (error) {
    console.error('API call error:', error)
    throw error
  }
}

export const apiGetCached = async (endpoint, { ttlMs = 30000, forceRefresh = false } = {}) => {
  const cacheKey = getCacheKey(endpoint)
  const cached = responseCache.get(cacheKey)
  const now = Date.now()

  if (!forceRefresh && cached && now - cached.timestamp < ttlMs) {
    return cached.data
  }

  if (!forceRefresh) {
    const inFlight = inFlightJsonRequests.get(cacheKey)
    if (inFlight) {
      return inFlight
    }
  }

  const requestPromise = apiCall(endpoint, { method: 'GET' }).then((data) => {
    responseCache.set(cacheKey, {
      timestamp: Date.now(),
      data,
    })
    return data
  })

  inFlightJsonRequests.set(cacheKey, requestPromise)

  try {
    return await requestPromise
  } finally {
    inFlightJsonRequests.delete(cacheKey)
  }
}

export const apiGetBlobUrlCached = async (endpoint, { ttlMs = 120000, forceRefresh = false } = {}) => {
  const cacheKey = getCacheKey(endpoint)
  const cached = blobUrlCache.get(cacheKey)
  const now = Date.now()

  if (!forceRefresh && cached && now - cached.timestamp < ttlMs) {
    return cached.url
  }

  if (!forceRefresh) {
    const inFlight = inFlightBlobRequests.get(cacheKey)
    if (inFlight) {
      return inFlight
    }
  }

  const requestPromise = fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: {
      ...getAuthHeaders(),
    },
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error('Failed to load image')
    }

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)

    revokeCachedBlobUrl(cacheKey)
    blobUrlCache.set(cacheKey, {
      timestamp: Date.now(),
      url,
    })

    return url
  })

  inFlightBlobRequests.set(cacheKey, requestPromise)

  try {
    return await requestPromise
  } finally {
    inFlightBlobRequests.delete(cacheKey)
  }
}

export const logout = () => {
  clearApiCache()
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  localStorage.removeItem('ticketInfo')
  localStorage.removeItem('isTicketCompleted')
  window.location.href = '/login'
}

export const getUser = () => {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

export const isAuthenticated = () => {
  return !!localStorage.getItem('accessToken')
}
