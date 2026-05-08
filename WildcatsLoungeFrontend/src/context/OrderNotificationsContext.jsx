import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useAuth } from './useAuth'
import { API_BASE_URL } from '../utils/api'

const OrderNotificationsContext = createContext(null)
const MAX_NOTIFICATIONS = 20

const normalizeNotification = (rawMessage) => {
  if (!rawMessage) {
    return null
  }

  if (typeof rawMessage === 'string') {
    try {
      return JSON.parse(rawMessage)
    } catch {
      return {
        message: rawMessage,
      }
    }
  }

  return rawMessage
}

const buildNotification = (payload) => {
  const orderId = payload?.orderId != null ? String(payload.orderId) : undefined
  const status = (payload?.status || 'UPDATED').toUpperCase()
  const receivedAt = payload?.timestamp || new Date().toISOString()

  return {
    id: `${orderId || 'order'}-${status}-${receivedAt}`,
    orderId,
    orderNumber: payload?.orderNumber || orderId || 'Order',
    status,
    message: payload?.message || 'Your order has been updated.',
    receivedAt,
    read: false,
  }
}

export const OrderNotificationsProvider = ({ children }) => {
  const { user, isLoggedIn } = useAuth()
  const location = useLocation()
  const isAdminRole = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN'
  const shouldConnect = location.pathname.startsWith('/orders')
  const [notifications, setNotifications] = useState([])
  const [latestNotification, setLatestNotification] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const clientRef = useRef(null)
  const reconnectTimerRef = useRef(null)

  const stopClient = async () => {
    if (reconnectTimerRef.current) {
      window.clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }

    if (clientRef.current) {
      const client = clientRef.current
      clientRef.current = null
      try {
        await client.deactivate()
      } catch {
        // Ignore shutdown errors during logout or route changes.
      }
    }
  }

  useEffect(() => {
    let active = true

    const connect = async () => {
      await stopClient()

      if (!isLoggedIn || !user?.id || isAdminRole || !shouldConnect) {
        if (active) {
          setNotifications([])
          setLatestNotification(null)
          setConnectionStatus('disconnected')
        }
        return
      }

      const token = localStorage.getItem('accessToken')
      const stompClient = new Client({
        webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws/orders`),
        reconnectDelay: 5000,
        heartbeatIncoming: 0,
        heartbeatOutgoing: 20000,
        connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
        debug: () => {},
        onConnect: () => {
          if (!active) {
            return
          }

          setConnectionStatus('connected')
          stompClient.subscribe(`/topic/orders/${user.id}`, (frame) => {
            const payload = normalizeNotification(frame.body)
            const notification = buildNotification(payload)

            setNotifications((current) => [notification, ...current].slice(0, MAX_NOTIFICATIONS))
            setLatestNotification(notification)
          })
        },
        onDisconnect: () => {
          if (active) {
            setConnectionStatus('disconnected')
          }
        },
        onWebSocketClose: () => {
          if (active) {
            setConnectionStatus('disconnected')
          }
        },
        onStompError: () => {
          if (active) {
            setConnectionStatus('error')
          }
        },
        onWebSocketError: () => {
          if (active) {
            setConnectionStatus('error')
          }
        },
      })

      clientRef.current = stompClient
      setConnectionStatus('connecting')
      stompClient.activate()
    }

    void connect()

    return () => {
      active = false
      void stopClient()
    }
  }, [isLoggedIn, user?.id, isAdminRole, shouldConnect])

  const markAsRead = (notificationId) => {
    setNotifications((current) => current.map((notification) => (
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    )))
  }

  const markAllAsRead = () => {
    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })))
  }

  const dismissNotification = (notificationId) => {
    setNotifications((current) => current.filter((notification) => notification.id !== notificationId))
  }

  const clearNotifications = () => {
    setNotifications([])
    setLatestNotification(null)
  }

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  )

  const value = {
    notifications,
    latestNotification,
    unreadCount,
    connectionStatus,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearNotifications,
  }

  return (
    <OrderNotificationsContext.Provider value={value}>
      {children}
    </OrderNotificationsContext.Provider>
  )
}

export const useOrderNotifications = () => {
  const context = useContext(OrderNotificationsContext)
  if (!context) {
    throw new Error('useOrderNotifications must be used within OrderNotificationsProvider')
  }
  return context
}

export default OrderNotificationsContext