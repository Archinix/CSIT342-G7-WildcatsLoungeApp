import { useEffect, useState } from 'react'
import { apiGetCached, apiCall } from '../../utils/api'
import { useOrderNotifications } from '../../context/OrderNotificationsContext'
import AppShell from '../../components/AppShell'
import './StaffQueue.css'

export default function StaffQueue() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { notifications } = useOrderNotifications()

  const fetchQueue = async (isBackground = false, forceRefresh = false) => {
    if (!isBackground) setLoading(true)
    if (!isBackground) setError(null)
    try {
      const data = await apiGetCached('/orders/staff/queue', { forceRefresh })
      setOrders(data || [])
    } catch (err) {
      if (!isBackground) setError(err.message || 'Failed to load queue')
      console.error('Queue fetch error:', err)
    } finally {
      if (!isBackground) setLoading(false)
    }
  }

  // Initial load - use cache
  useEffect(() => {
    fetchQueue()
  }, [])

  // Refresh when new order notification arrives - force refresh
  useEffect(() => {
    if (notifications && notifications.length > 0) {
      fetchQueue(true, true)
    }
  }, [notifications])

  const updateStatus = async (orderId, newStatus) => {
    if (!orderId) {
      setError('Invalid order ID')
      return
    }
    try {
      console.log(`Updating order ${orderId} to status ${newStatus}`)
      const response = await apiCall(`/orders/staff/orders/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      })
      console.log('Status update response:', response)
      // Force refresh immediately to reflect status change
      await fetchQueue(false, true)
    } catch (err) {
      console.error('Update error details:', err)
      setError(err.message || `Failed to update to ${newStatus}`)
    }
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Unknown'
    const ms = Date.now() - parseInt(timestamp)
    const mins = Math.floor(ms / 60000)
    return mins > 0 ? `${mins}m ago` : 'Just now'
  }

  const pendingOrders = orders.filter((o) => o.status === 'PENDING')
  const preparingOrders = orders.filter((o) => o.status === 'IN_PROGRESS')
  const readyOrders = orders.filter((o) => o.status === 'READY')

  if (loading) return <AppShell title="Order Queue" subtitle="Staff Dashboard"><div className="loading">Loading...</div></AppShell>

  return (
    <AppShell title="Order Queue" subtitle="Staff Dashboard">
      {error && <div className="error-banner">{error}</div>}
      <div className="queue-summary">
        <div className="summary-card pending">
          <div className="count">{pendingOrders.length}</div>
          <div className="label">Pending</div>
        </div>
        <div className="summary-card preparing">
          <div className="count">{preparingOrders.length}</div>
          <div className="label">Preparing</div>
        </div>
        <div className="summary-card ready">
          <div className="count">{readyOrders.length}</div>
          <div className="label">Ready</div>
        </div>
      </div>

      <div className="queue-columns">
        <div className="column pending-col">
          <h3>Pending</h3>
          {pendingOrders.length === 0 ? (
            <p className="empty">No pending orders</p>
          ) : (
            pendingOrders.map((o) => (
              <div key={o.orderId} className="order-card">
                <div className="order-num">#{o.orderNumber}</div>
                <div className="items-list">
                  {o.items?.map((it) => (
                    <div key={it.productId} className="item">
                      {it.productName} x{it.quantity}
                    </div>
                  ))}
                </div>
                <div className="order-meta">
                  <span className="time">⏱ {formatTime(o.createdAt)}</span>
                </div>
                <button className="action-btn start" onClick={() => updateStatus(o.orderId, 'IN_PROGRESS')}>
                  Prepare Order
                </button>
              </div>
            ))
          )}
        </div>

        <div className="column preparing-col">
          <h3>Preparing</h3>
          {preparingOrders.length === 0 ? (
            <p className="empty">No orders preparing</p>
          ) : (
            preparingOrders.map((o) => (
              <div key={o.orderId} className="order-card">
                <div className="order-num">#{o.orderNumber}</div>
                <div className="items-list">
                  {o.items?.map((it) => (
                    <div key={it.productId} className="item">
                      {it.productName} x{it.quantity}
                    </div>
                  ))}
                </div>
                <div className="order-meta">
                  <span className="time">⏱ {formatTime(o.createdAt)}</span>
                </div>
                <button className="action-btn ready" onClick={() => updateStatus(o.orderId, 'READY')}>
                  Mark Ready
                </button>
              </div>
            ))
          )}
        </div>

        <div className="column ready-col">
          <h3>Ready</h3>
          {readyOrders.length === 0 ? (
            <p className="empty">No orders ready</p>
          ) : (
            readyOrders.map((o) => (
              <div key={o.orderId} className="order-card">
                <div className="order-num">#{o.orderNumber}</div>
                <div className="items-list">
                  {o.items?.map((it) => (
                    <div key={it.productId} className="item">
                      {it.productName} x{it.quantity}
                    </div>
                  ))}
                </div>
                <div className="order-meta">
                  <span className="time">⏱ {formatTime(o.createdAt)}</span>
                </div>
                <button className="action-btn complete" onClick={() => updateStatus(o.orderId, 'COMPLETED')}>
                  Complete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  )
}
