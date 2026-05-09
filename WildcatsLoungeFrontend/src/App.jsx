import { Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { OrderNotificationsProvider } from './context/OrderNotificationsContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Login from './pages/LoginPage/Login'
import Signup from './pages/RegistrationPage/Signup'
import ForgotPasswordPage from './pages/ForgotPasswordPage/ForgotPassword'
import ResetPasswordPage from './pages/ResetPasswordPage/ResetPassword'
import Dashboard from './pages/DashboardPage/Dashboard'
import Menu from './pages/MenuPage/Menu'
import Cart from './pages/CartPage/Cart'
import Orders from './pages/OrdersPage/Orders'
import Loyalty from './pages/LoyaltyPage/Loyalty'
import About from './pages/AboutPage/About'
import CreateAdminAccount from './pages/AdminPage/CreateAdminAccount'
import MenuManagement from './pages/AdminPage/MenuManagement'
import StaffQueue from './pages/StaffPage/StaffQueue'
import Profile from './pages/ProfilePage/Profile'
import ChangePassword from './pages/ProfilePage/ChangePassword'

function App() {
  return (
    <AuthProvider>
      <OrderNotificationsProvider>
        <div className="app">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
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
            <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
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
            <Route
              path="/staff/queue"
              element={
                <ProtectedRoute allowedRoles={["STAFF", "ADMIN", "SUPERADMIN"]}>
                  <StaffQueue />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/menu" replace />} />
            <Route path="*" element={<Navigate to="/menu" replace />} />
          </Routes>
        </div>
      </OrderNotificationsProvider>
    </AuthProvider>
  )
}

export default App
