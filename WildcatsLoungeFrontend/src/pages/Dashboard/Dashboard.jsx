import './Dashboard.css'
import { useAuth } from '../../context/useAuth'

function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="dashboard-container">
      <nav className="dashboard-navbar">
        <div className="navbar-brand">
          <h2>Wildcats Lounge</h2>
        </div>
        <div className="navbar-menu">
          <span className="user-info">Welcome, {user?.firstName || user?.email}!</span>
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <h1>Dashboard</h1>
        <p>Welcome to Wildcats Lounge!</p>
        
        <div className="dashboard-sections">
          <div className="section">
            <h3>Browse Menu</h3>
            <p>Coming soon...</p>
          </div>
          <div className="section">
            <h3>Your Orders</h3>
            <p>Coming soon...</p>
          </div>
          <div className="section">
            <h3>Loyalty Points</h3>
            <p>Coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
