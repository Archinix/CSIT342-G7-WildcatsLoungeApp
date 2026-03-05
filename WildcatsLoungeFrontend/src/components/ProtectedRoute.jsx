import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth()

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  return children
}
