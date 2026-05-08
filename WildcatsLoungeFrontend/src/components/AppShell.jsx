import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import logo from '../assets/logo/logo.jpg'
import ProfileDropdown from './ProfileDropdown'
import OrderNotificationCenter from './OrderNotificationCenter'

function AppShell({ title, subtitle, children, rightContent }) {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const isSuperAdmin = user?.role === 'SUPERADMIN'
  const canManageMenu = isAdmin || isSuperAdmin
  const isCustomer = !canManageMenu

  return (
    <div className="wl-app-shell">
      <header className="wl-topbar">
        <div className="wl-topbar-left">
          <Link to="/menu" className="wl-brand">
            <img src={logo} alt="Wildcats Lounge" className="wl-brand-badge" />
            <span>Wildcats Lounge</span>
          </Link>
        </div>
        <nav className="wl-nav">
          {isCustomer && <NavLink to="/menu">Menu</NavLink>}
          {isCustomer && <NavLink to="/orders">Orders</NavLink>}
          {isCustomer && <NavLink to="/loyalty">Rewards</NavLink>}
          {isCustomer && <NavLink to="/about">About</NavLink>}
          {canManageMenu && <NavLink to="/admin/menu-management">Menu Management</NavLink>}
          {isSuperAdmin && (
            <NavLink to="/admin/create-account">Admin Accounts</NavLink>
          )}
        </nav>
        <div className="wl-topbar-right">
          <OrderNotificationCenter />
          <ProfileDropdown />
        </div>
      </header>

      <main className="wl-main">
        <section className="wl-page-head">
          <div>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {rightContent}
        </section>
        {children}
      </main>
    </div>
  )
}

export default AppShell
