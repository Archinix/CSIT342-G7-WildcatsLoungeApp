import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { apiGetCached } from '../../utils/api'
import AppShell from '../../components/AppShell'

const STATUS_OPTIONS = ['All Status', 'Pending', 'Preparing', 'Ready for Pickup', 'Completed']
const RANGE_OPTIONS = ['Last 30 Days', 'Today', 'Last 7 Days', 'Last 90 Days']
const TRACK_STEPS = [
  { key: 'PENDING', label: 'Placed' },
  { key: 'IN_PROGRESS', label: 'Preparing' },
  { key: 'READY', label: 'Ready' },
  { key: 'COMPLETED', label: 'Completed' },
]

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
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [modalMode, setModalMode] = useState('details')
  const location = useLocation()
  const focusedOrderId = useMemo(() => new URLSearchParams(location.search).get('focus'), [location.search])

  const loadOrders = async ({ forceRefresh = false } = {}) => {
    try {
      const data = await apiGetCached('/orders', { ttlMs: 20000, forceRefresh })
      setOrders(Array.isArray(data) ? data : [])
      setError('')
    } catch (err) {
      setOrders([])
      setError(err.message || 'Failed to load orders')
    }
  }

  useEffect(() => {
    void loadOrders()
  }, [])

  useEffect(() => {
    const handleOrdersRefresh = () => {
      void loadOrders({ forceRefresh: true })
    }

    window.addEventListener('wl-orders-refresh', handleOrdersRefresh)
    return () => window.removeEventListener('wl-orders-refresh', handleOrdersRefresh)
  }, [])

  useEffect(() => {
    if (!focusedOrderId || orders.length === 0) {
      return
    }

    const matchedOrder = orders.find((order, index) => String(order.orderId || index) === String(focusedOrderId))
    if (matchedOrder) {
      setSelectedOrder(matchedOrder)
      setModalMode('tracking')
    }

    const focusedElement = document.querySelector(`[data-order-id="${CSS.escape(focusedOrderId)}"]`)
    if (focusedElement) {
      focusedElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [focusedOrderId, orders])

  useEffect(() => {
    if (selectedOrder || !focusedOrderId || orders.length === 0) {
      return
    }

    const matchedOrder = orders.find((order, index) => String(order.orderId || index) === String(focusedOrderId))
    if (matchedOrder) {
      setSelectedOrder(matchedOrder)
      setModalMode('tracking')
    }
  }, [focusedOrderId, orders, selectedOrder])

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
            const customerLabel = order.customerName || order.tableLabel || 'Customer'
            const elapsedText = formatElapsed(order)
            const itemSummary = toItemSummary(order.items)
            const orderKey = String(order.orderId || index)
            const isFocused = focusedOrderId && String(focusedOrderId) === orderKey

            return (
              <article key={order.orderId || index} data-order-id={orderKey} className={`wl-order-card ${index === 0 ? 'is-active' : ''} ${isFocused ? 'is-focused' : ''}`}>
                <div className="wl-order-head-row">
                  <div>
                    <h3>#{order.orderId || 1234}</h3>
                    <p className="wl-muted">{elapsedText}</p>
                  </div>
                  <span className={`wl-status wl-order-status ${toStatusClass(statusText)}`}>{statusText}</span>
                </div>

                <div className="wl-order-meta-row">
                  <p><span aria-hidden="true">◻</span>{itemSummary}</p>
                  <p><span aria-hidden="true">◉</span>{customerLabel}</p>
                  <p><span aria-hidden="true">◷</span>{elapsedText}</p>
                </div>

                <div className="wl-order-foot-row">
                  <strong>P{order.total || 0}</strong>
                  <div className="wl-order-actions">
                    <button type="button" className="wl-link-btn" onClick={() => { setSelectedOrder(order); setModalMode('details') }}>View Details</button>
                    <button type="button" className="wl-track-btn" onClick={() => { setSelectedOrder(order); setModalMode('tracking') }}>Track Order</button>
                  </div>
                </div>
              </article>
            )
          })}
        </section>
      )}

      {selectedOrder && (
        <div className="wl-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="wl-modal-card wl-order-modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="wl-modal-head">
              <strong>{modalMode === 'tracking' ? 'Track Order' : 'Order Details'}</strong>
              <button type="button" className="wl-modal-close" onClick={() => setSelectedOrder(null)} aria-label="Close order details">x</button>
            </div>

            <div className="wl-modal-body wl-order-modal-body">
              <div className="wl-order-modal-summary">
                <div>
                  <h2>#{selectedOrder.orderId || '—'}</h2>
                  <p className="wl-muted">{selectedOrder.status || 'Pending'}</p>
                </div>
                <span className={`wl-status wl-order-status ${toStatusClass(selectedOrder.status || 'Pending')}`}>
                  {selectedOrder.status || 'Pending'}
                </span>
              </div>

              <section className="wl-order-tracker-panel">
                <div className="wl-order-tracker-head">
                  <div>
                    <h4>Live Progress</h4>
                    <p>{modalMode === 'tracking' ? 'This view follows the live status changes for the order.' : 'Open Track Order to see the live progress timeline.'}</p>
                  </div>
                  <span className="wl-order-tracker-pill">{selectedOrder.status || 'Pending'}</span>
                </div>

                <div className="wl-order-tracker-steps" aria-label="order progress">
                  {TRACK_STEPS.map((step, index) => {
                    const currentIndex = TRACK_STEPS.findIndex((candidate) => candidate.key === String(selectedOrder.status || 'PENDING').toUpperCase())
                    const stepState = currentIndex > index ? 'is-complete' : currentIndex === index ? 'is-active' : 'is-upcoming'

                    return (
                      <div key={step.key} className={`wl-order-tracker-step ${stepState}`}>
                        <span>{index + 1}</span>
                        <strong>{step.label}</strong>
                      </div>
                    )
                  })}
                </div>
              </section>

              <div className="wl-order-modal-grid">
                <section className="wl-order-modal-panel">
                  <h4>Order Summary</h4>
                  <p><strong>Customer:</strong> {selectedOrder.customerName || selectedOrder.tableLabel || 'Customer'}</p>
                  <p><strong>Placed:</strong> {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'Recently'}</p>
                  <p><strong>Total:</strong> P{selectedOrder.total || 0}</p>
                  <p><strong>Items:</strong> {toItemSummary(selectedOrder.items)}</p>
                </section>

                <section className="wl-order-modal-panel">
                  <h4>Current Status</h4>
                  <p>{selectedOrder.status === 'READY' ? 'Ready for pickup' : selectedOrder.status === 'IN_PROGRESS' ? 'Kitchen is preparing this order' : 'Order is being tracked live.'}</p>
                  <p className="wl-muted">Use the Orders page or the live notification feed to follow changes.</p>
                </section>
              </div>

              <div className="wl-order-modal-actions">
                <button type="button" className="wl-secondary-button" onClick={() => setSelectedOrder(null)}>Close</button>
                <button type="button" className="wl-track-btn" onClick={() => setModalMode('tracking')}>Track Order</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}

export default Orders
