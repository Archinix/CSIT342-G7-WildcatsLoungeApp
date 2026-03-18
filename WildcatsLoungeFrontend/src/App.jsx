import { Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Login from './pages/LoginPage/Login'
import Signup from './pages/RegistrationPage/Signup'
import Dashboard from './pages/DashboardPage/Dashboard'
import Menu from './pages/MenuPage/Menu'
import Cart from './pages/CartPage/Cart'
import Orders from './pages/OrdersPage/Orders'
import Loyalty from './pages/LoyaltyPage/Loyalty'
import CreateAdminAccount from './pages/AdminPage/CreateAdminAccount'
import MenuManagement from './pages/AdminPage/MenuManagement'
import Profile from './pages/ProfilePage/Profile'
import ChangePassword from './pages/ProfilePage/ChangePassword'

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/menu" element={<ProtectedRoute><Menu /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/loyalty" element={<ProtectedRoute><Loyalty /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
          <Route
            path="/admin/create-account"
            element={
              <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                <CreateAdminAccount />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/menu-management"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN']}>
                <MenuManagement />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/menu" replace />} />
          <Route path="*" element={<Navigate to="/menu" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
