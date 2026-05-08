import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useOrderNotifications } from '../context/OrderNotificationsContext'

const STATUS_LABELS = {
  PENDING: 'Order received',
  IN_PROGRESS: 'Order in progress',
  READY: 'Ready for pickup',
  COMPLETED: 'Order completed',
  CANCELLED: 'Order cancelled',
  UPDATED: 'Order updated',
}

function OrderNotificationCenter() {
  const {
    notifications,
    latestNotification,
    unreadCount,
    connectionStatus,
    markAsRead,
    markAllAsRead,
    dismissNotification,
  } = useOrderNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const [toastItems, setToastItems] = useState([])

  useEffect(() => {
    if (!latestNotification) {
      return undefined
    }

    window.dispatchEvent(new CustomEvent('wl-orders-refresh', {
      detail: {
        orderId: latestNotification.orderId,
        status: latestNotification.status,
      },
    }))

    setToastItems((current) => [latestNotification, ...current.filter((item) => item.id !== latestNotification.id)].slice(0, 3))

    const timeoutId = window.setTimeout(() => {
      setToastItems((current) => current.filter((item) => item.id !== latestNotification.id))
    }, 5000)

    return () => window.clearTimeout(timeoutId)
  }, [latestNotification?.id])

  return (
    <div className="wl-notification-center">
      <button
        type="button"
        className="wl-icon-btn wl-notification-btn"
        onClick={() => setIsOpen((current) => !current)}
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 17H9" />
          <path d="M10.5 17a1.5 1.5 0 0 0 3 0" />
          <path d="M6.5 17h11l-1.2-1.8a3.2 3.2 0 0 1-.5-1.7V10a4 4 0 1 0-8 0v3.5a3.2 3.2 0 0 1-.5 1.7L6.5 17Z" />
        </svg>
        {unreadCount > 0 && <span className="wl-notification-dot">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="wl-notification-panel">
          <div className="wl-notification-panel-head">
            <div>
              <h3>Notifications</h3>
              <p>{connectionStatus === 'connected' ? 'Live updates enabled' : 'Connecting to order updates'}</p>
            </div>
            <button type="button" className="wl-notification-link" onClick={markAllAsRead} disabled={notifications.length === 0}>
              Mark all read
            </button>
          </div>

          <div className="wl-notification-list">
            {notifications.length === 0 ? (
              <p className="wl-notification-empty">No order updates yet.</p>
            ) : (
              notifications.map((notification) => (
                <article
                  key={notification.id}
                  className={`wl-notification-item ${notification.read ? '' : 'is-unread'}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => markAsRead(notification.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      markAsRead(notification.id)
                    }
                  }}
                >
                  <div className="wl-notification-item-main">
                    <strong>{notification.orderNumber}</strong>
                    <p>{notification.message}</p>
                  </div>
                  <div className="wl-notification-item-meta">
                    <span>{STATUS_LABELS[notification.status] || notification.status}</span>
                    <small>{new Date(notification.receivedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</small>
                  </div>
                  <div className="wl-notification-item-actions">
                    <Link to={`/orders${notification.orderId ? `?focus=${encodeURIComponent(notification.orderId)}` : ''}`} onClick={() => markAsRead(notification.id)}>View orders</Link>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        dismissNotification(notification.id)
                      }}
                    >
                      Dismiss
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      )}

      <div className="wl-notification-toast-stack" aria-live="polite" aria-atomic="true">
        {toastItems.map((notification) => (
          <div key={notification.id} className="wl-notification-toast">
            <div className="wl-notification-toast-body">
              <span className="wl-notification-toast-kicker">{STATUS_LABELS[notification.status] || 'Order update'}</span>
              <strong>{notification.orderNumber}</strong>
              <p>{notification.message}</p>
            </div>
            <button
              type="button"
              className="wl-notification-toast-close"
              onClick={() => setToastItems((current) => current.filter((item) => item.id !== notification.id))}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OrderNotificationCenter