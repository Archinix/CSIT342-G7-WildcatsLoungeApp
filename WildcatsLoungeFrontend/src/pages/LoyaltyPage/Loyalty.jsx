import { useEffect, useState } from 'react'
import { apiGetCached } from '../../utils/api'
import AppShell from '../../components/AppShell'

function Loyalty() {
  const [status, setStatus] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const initializeStatus = async () => {
      try {
        const data = await apiGetCached('/loyalty/status', { ttlMs: 20000 })
        if (active) {
          setStatus(data && typeof data === 'object' ? data : null)
          setError('')
        }
      } catch (err) {
        if (active) {
          setStatus(null)
          setError(err.message || 'Failed to load loyalty status')
        }
      }
    }

    void initializeStatus()

    return () => {
      active = false
    }
  }, [])

  const points = Number(status?.points || 0)
  const targetPoints = Number(status?.targetPoints || 1500)
  const progressPercent = Math.max(0, Math.min(100, (points / targetPoints) * 100))
  const pointsRemaining = Math.max(0, targetPoints - points)
  const totalOrders = Number(status?.totalOrders || 0)
  const multiplier = Number(status?.multiplier || 1)

  const coupons = Array.isArray(status?.coupons) && status.coupons.length > 0
    ? status.coupons.slice(0, 3).map((coupon, index) => ({
      id: coupon.id || `coupon-${index}`,
      title: coupon.title || '20% OFF',
      minPoints: Number(coupon.minPoints || 200),
      expiresOn: coupon.expiresOn || 'Dec 31, 2024',
    }))
    : []

  return (
    <AppShell title="Loyalty & Rewards" subtitle={null}>
      {error && <p className="wl-error-text">{error}</p>}

      {!status ? (
        <p className="wl-muted">No rewards data yet.</p>
      ) : (
        <>
          <section className="wl-rewards-hero">
            <div className="wl-rewards-hero-main">
              <h3>Silver Member</h3>
              <p>You&apos;re {pointsRemaining} points away from Gold tier!</p>
              <span className="wl-rewards-tier-pill">Silver</span>

              <div className="wl-rewards-progress-wrap">
                <div className="wl-rewards-progress-track">
                  <span style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="wl-rewards-progress-labels">
                  <small>{points} points</small>
                  <small>Next tier: {targetPoints} points</small>
                </div>
              </div>
            </div>

            <div className="wl-rewards-star" aria-hidden="true">
              ☆
            </div>
          </section>

          <section className="wl-rewards-stats">
            <article className="wl-rewards-stat-card is-points">
              <strong>{points.toLocaleString()}</strong>
              <span>Total Points</span>
            </article>
            <article className="wl-rewards-stat-card is-coupons">
              <strong>{coupons.length}</strong>
              <span>Available Coupons</span>
            </article>
            <article className="wl-rewards-stat-card is-orders">
              <strong>{totalOrders}</strong>
              <span>Total Orders</span>
            </article>
            <article className="wl-rewards-stat-card is-multiplier">
              <strong>{multiplier}x</strong>
              <span>Point Multiplier</span>
            </article>
          </section>

          <section>
            <h2 className="wl-rewards-section-title">Available Coupons</h2>
            {coupons.length === 0 ? (
              <p className="wl-muted">No available coupons yet.</p>
            ) : (
              <div className="wl-rewards-coupon-grid">
                {coupons.map((coupon) => (
                  <article key={coupon.id} className="wl-rewards-coupon-card">
                    <div className="wl-rewards-coupon-head">
                      <h4>{coupon.title}</h4>
                      <span aria-hidden="true">🎁</span>
                    </div>
                    <p>Min. P{coupon.minPoints}</p>
                    <p>Valid until {coupon.expiresOn}</p>
                    <button type="button">Use Coupon</button>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </AppShell>
  )
}

export default Loyalty
