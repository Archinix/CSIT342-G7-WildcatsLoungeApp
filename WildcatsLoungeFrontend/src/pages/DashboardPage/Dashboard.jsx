import { useAuth } from '../../context/useAuth'
import { Link } from 'react-router-dom'
import AppShell from '../../components/AppShell'

function Dashboard() {
  const { user } = useAuth()

  return (
    <AppShell
      title={`Welcome back, ${user?.firstName || 'Wildcat'}`}
      subtitle="Your cafe dashboard for menu, checkout, and rewards"
    >
      <section className="wl-feature-grid">
        <Link to="/menu" className="wl-feature-card">
          <h3>Menu</h3>
          <p>Browse drinks and pastries.</p>
        </Link>
        <Link to="/cart" className="wl-feature-card">
          <h3>Checkout</h3>
          <p>Review cart and place your order.</p>
        </Link>
        <Link to="/orders" className="wl-feature-card">
          <h3>Order History</h3>
          <p>Track active and previous orders.</p>
        </Link>
        <Link to="/loyalty" className="wl-feature-card">
          <h3>Loyalty and Rewards</h3>
          <p>Use points and claim vouchers.</p>
        </Link>
      </section>
    </AppShell>
  )
}

export default Dashboard
