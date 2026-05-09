import { useEffect, useState } from 'react'
import { apiGetCached, apiCall } from '../../utils/api'
import './StaffQueue.css'

export default function StaffQueue() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchQueue = async () => {
    setLoading(true)
    try {
      const data = await apiGetCached('/orders/staff/queue', { forceRefresh: true })
      setOrders(data || [])
    } catch (err) {
      setError(err.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQueue()
  }, [])

  const updateStatus = async (orderId, status) => {
    try {
      await apiCall(`/orders/staff/orders/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      await fetchQueue()
    } catch (err) {
      setError(err.message || 'Failed to update')
    }
  }

  if (loading) return <div>Loading staff queue...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="staff-queue">
      <h2>Order Queue</h2>
      {orders.length === 0 && <p>No pending orders.</p>}
      <ul>
        {orders.map((o) => (
          <li key={o.id} className="order-card">
            <div className="order-header">
              <strong>#{o.orderNumber}</strong>
              <span>{o.customerName} ({o.userEmail})</span>
              <span className="status">{o.status}</span>
            </div>
            <div className="order-items">
              {o.items.map((it) => (
                <div key={it.productId} className="order-item">
                  {it.productName} x{it.quantity} — {it.unitPrice}
                </div>
              ))}
            </div>
            <div className="order-actions">
              {o.status === 'PENDING' && (
                <>
                  <button onClick={() => updateStatus(o.id, 'IN_PROGRESS')}>Accept</button>
                  <button onClick={() => updateStatus(o.id, 'CANCELLED')}>Cancel</button>
                </>
              )}
              {o.status === 'IN_PROGRESS' && (
                <>
                  <button onClick={() => updateStatus(o.id, 'READY')}>Mark Ready</button>
                  <button onClick={() => updateStatus(o.id, 'CANCELLED')}>Cancel</button>
                </>
              )}
              {o.status === 'READY' && (
                <>
                  <button onClick={() => updateStatus(o.id, 'COMPLETED')}>Complete</button>
                  <button onClick={() => updateStatus(o.id, 'IN_PROGRESS')}>Reopen</button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
