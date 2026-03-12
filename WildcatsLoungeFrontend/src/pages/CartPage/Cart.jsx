import { useEffect, useState } from 'react'
import { apiCall } from '../../utils/api'
import AppShell from '../../components/AppShell'

function Cart() {
  const [cart, setCart] = useState(null)
  const [error, setError] = useState('')

  const loadCart = async () => {
    try {
      const data = await apiCall('/cart')
      setCart(data)
      setError('')
    } catch (err) {
      setError(err.message || 'Failed to load cart')
    }
  }

  useEffect(() => {
    let active = true

    const initializeCart = async () => {
      try {
        const data = await apiCall('/cart')
        if (active) {
          setCart(data)
          setError('')
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Failed to load cart')
        }
      }
    }

    void initializeCart()

    return () => {
      active = false
    }
  }, [])

  const removeItem = async (id) => {
    try {
      await apiCall(`/cart/items/${id}`, { method: 'DELETE' })
      await loadCart()
    } catch (err) {
      setError(err.message || 'Failed to remove item')
    }
  }

  const checkout = async () => {
    try {
      await apiCall('/orders', { method: 'POST' })
      alert('Order placed successfully')
      await loadCart()
    } catch (err) {
      setError(err.message || 'Checkout failed')
    }
  }

  return (
    <AppShell title="Order Summary" subtitle="Review your cart before checkout">
      {error && <p className="wl-error-text">{error}</p>}

      {!cart || cart.items.length === 0 ? (
        <p className="wl-muted">Your cart is empty.</p>
      ) : (
        <section className="wl-checkout-layout">
          <div className="wl-cart-list">
            {cart.items.map((item) => (
              <article key={item.cartItemId} className="wl-cart-item">
                <div className="wl-cart-item-thumb" />
                <div>
                  <h3>{item.productName}</h3>
                  <p className="wl-muted">Qty: {item.quantity}</p>
                </div>
                <strong>Php {item.lineTotal}</strong>
                <button className="wl-danger-link" onClick={() => removeItem(item.cartItemId)}>Remove</button>
              </article>
            ))}
          </div>

          <aside className="wl-summary-card">
            <h3>Order Summary</h3>
            <div className="wl-summary-row"><span>Subtotal</span><span>Php {cart.total}</span></div>
            <div className="wl-summary-row"><span>Discount</span><span>- Php 0</span></div>
            <div className="wl-summary-row total"><span>Total</span><span>Php {cart.total}</span></div>
            <button onClick={checkout}>Checkout</button>
          </aside>
        </section>
      )}
    </AppShell>
  )
}

export default Cart
