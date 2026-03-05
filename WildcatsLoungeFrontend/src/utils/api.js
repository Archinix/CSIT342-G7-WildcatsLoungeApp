// API utility with JWT token handling
const API_BASE_URL = 'http://localhost:8080'

export const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken')
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export const apiCall = async (endpoint, options = {}) => {
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
      throw new Error(data.message || 'API request failed')
    }

    return data
  } catch (error) {
    console.error('API call error:', error)
    throw error
  }
}

export const logout = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  window.location.href = '/login'
}

export const getUser = () => {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

export const isAuthenticated = () => {
  return !!localStorage.getItem('accessToken')
}
