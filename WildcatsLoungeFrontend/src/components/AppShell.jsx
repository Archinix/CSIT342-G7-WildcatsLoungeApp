import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import logo from '../assets/logo/logo.jpg'
import ProfileDropdown from './ProfileDropdown'

function AppShell({ title, subtitle, children, rightContent }) {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const isSuperAdmin = user?.role === 'SUPERADMIN'
  const canManageMenu = isAdmin || isSuperAdmin

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
          {!isAdmin && <NavLink to="/menu">Menu</NavLink>}
          {!isAdmin && <NavLink to="/orders">Orders</NavLink>}
          {!isAdmin && <NavLink to="/loyalty">Rewards</NavLink>}
          {!isAdmin && <NavLink to="/dashboard">About</NavLink>}
          {canManageMenu && <NavLink to="/admin/menu-management">Menu Management</NavLink>}
          {isSuperAdmin && (
            <NavLink to="/admin/create-account">Admin Accounts</NavLink>
          )}
        </nav>
        <div className="wl-topbar-right">
          <Link to="/cart" className="wl-icon-btn wl-notification-btn" aria-label="Notifications">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 17H9" />
              <path d="M10.5 17a1.5 1.5 0 0 0 3 0" />
              <path d="M6.5 17h11l-1.2-1.8a3.2 3.2 0 0 1-.5-1.7V10a4 4 0 1 0-8 0v3.5a3.2 3.2 0 0 1-.5 1.7L6.5 17Z" />
            </svg>
            <span className="wl-notification-dot">2</span>
          </Link>
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
