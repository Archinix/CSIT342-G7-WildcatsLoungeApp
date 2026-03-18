import { useEffect, useState } from 'react'
import { apiGetCached } from '../../utils/api'
import AppShell from '../../components/AppShell'

const STATUS_OPTIONS = ['All Status', 'Pending', 'Preparing', 'Ready for Pickup', 'Completed']
const RANGE_OPTIONS = ['Last 30 Days', 'Today', 'Last 7 Days', 'Last 90 Days']

const toStatusClass = (statusText = '') =>
  statusText
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const formatElapsed = (order) => {
  if (typeof order.minutesAgo === 'number') {
    if (order.minutesAgo < 60) return `${order.minutesAgo} mins ago`
    if (order.minutesAgo < 1440) return `${Math.floor(order.minutesAgo / 60)} hr ago`
    return `${Math.floor(order.minutesAgo / 1440)} day ago`
  }

  if (!order.createdAt) return '10 mins ago'

  const elapsedMins = Math.max(1, Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000))
  if (elapsedMins < 60) return `${elapsedMins} mins ago`
  if (elapsedMins < 1440) return `${Math.floor(elapsedMins / 60)} hr ago`
  return `${Math.floor(elapsedMins / 1440)} day ago`
}

const toItemSummary = (items = []) => {
  const normalizedItems = Array.isArray(items) ? items : []
  if (normalizedItems.length === 0) return 'Caramel Latte (2), Muffin (1)'

  return normalizedItems
    .map((item) => {
      const itemName = item.productName || item.name || item.itemName || 'Item'
      const itemQty = Number(item.quantity ?? item.qty ?? 1)
      return `${itemName} (${itemQty})`
    })
    .join(', ')
}

function Orders() {
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [rangeFilter, setRangeFilter] = useState('Last 30 Days')

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await apiGetCached('/orders', { ttlMs: 20000 })
        setOrders(Array.isArray(data) ? data : [])
      } catch (err) {
        setOrders([])
        setError(err.message || 'Failed to load orders')
      }
    }

    loadOrders()
  }, [])

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === 'All Status') return true
    return String(order.status || '').toLowerCase() === statusFilter.toLowerCase()
  })

  const toolbar = (
    <div className="wl-order-toolbar" aria-label="order filters">
      <select
        className="wl-select"
        value={statusFilter}
        onChange={(event) => setStatusFilter(event.target.value)}
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <select
        className="wl-select"
        value={rangeFilter}
        onChange={(event) => setRangeFilter(event.target.value)}
      >
        {RANGE_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )

  return (
    <AppShell title="Order History" subtitle={null} rightContent={toolbar}>
      {error && <p className="wl-error-text">{error}</p>}

      {filteredOrders.length === 0 ? (
        <p className="wl-muted">No orders yet.</p>
      ) : (
        <section className="wl-order-list">
          {filteredOrders.map((order, index) => {
            const statusText = order.status || 'Pending'
            const tableLabel = order.tableLabel || (order.tableNumber ? `Table ${order.tableNumber}` : 'Table 1')
            const elapsedText = formatElapsed(order)
            const itemSummary = toItemSummary(order.items)

            return (
              <article key={order.orderId || index} className={`wl-order-card ${index === 0 ? 'is-active' : ''}`}>
                <div className="wl-order-head-row">
                  <div>
                    <h3>#{order.orderId || 1234}</h3>
                    <p className="wl-muted">{elapsedText}</p>
                  </div>
                  <span className={`wl-status wl-order-status ${toStatusClass(statusText)}`}>{statusText}</span>
                </div>

                <div className="wl-order-meta-row">
                  <p><span aria-hidden="true">◻</span>{itemSummary}</p>
                  <p><span aria-hidden="true">◉</span>{tableLabel}</p>
                  <p><span aria-hidden="true">◷</span>{elapsedText}</p>
                </div>

                <div className="wl-order-foot-row">
                  <strong>P{order.total || 0}</strong>
                  <div className="wl-order-actions">
                    <button type="button" className="wl-link-btn">View Details</button>
                    <button type="button" className="wl-track-btn">Track Order</button>
                  </div>
                </div>
              </article>
            )
          })}
        </section>
      )}
    </AppShell>
  )
}

export default Orders
