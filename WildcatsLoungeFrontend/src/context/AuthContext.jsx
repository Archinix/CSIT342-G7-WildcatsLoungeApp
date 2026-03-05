import { createContext, useState } from 'react'
import { getUser, isAuthenticated, logout as logoutUtil } from '../utils/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const initialUser = isAuthenticated() ? getUser() : null
  const [user, setUser] = useState(initialUser)
  const [isLoggedIn, setIsLoggedIn] = useState(!!initialUser)
  const loading = false

  const login = (userData, tokens) => {
    setUser(userData)
    setIsLoggedIn(true)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('accessToken', tokens.accessToken)
    localStorage.setItem('refreshToken', tokens.refreshToken)
  }

  const logout = () => {
    setUser(null)
    setIsLoggedIn(false)
    logoutUtil()
  }

  const value = {
    user,
    isLoggedIn,
    loading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
