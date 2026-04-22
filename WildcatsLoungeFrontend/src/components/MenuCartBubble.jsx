import { useEffect, useMemo, useState } from 'react'
import { apiCall } from '../utils/api'

const CHECKOUT_STEPS = [
  { id: 'cart', label: 'Cart' },
  { id: 'details', label: 'Details' },
  { id: 'payment', label: 'Payment' },
]

const formatPrice = (value) => {
  const amount = Number(value || 0)
  return new Intl.NumberFormat('en-PH', { maximumFractionDigits: 0 }).format(amount)
}

function MenuCartBubble({ cart, onRefreshCart }) {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState('cart')
  const [orderType, setOrderType] = useState('dine-in')
  const [customerName, setCustomerName] = useState('')
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [promoCode, setPromoCode] = useState('')

  useEffect(() => {
    const savedName = localStorage.getItem('checkoutCustomerName')
    if (savedName) {
      setCustomerName(savedName)
    }
  }, [])

  const items = Array.isArray(cart?.items) ? cart.items : []
  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantity ?? 1), 0),
    [items],
  )
  const total = Number(cart?.total ?? 0)

  useEffect(() => {
    if (items.length === 0) {
      setIsOpen(false)
      setStep('cart')
    }
  }, [items.length])

  useEffect(() => {
    if (!isOpen) {
      setStep('cart')
    }
  }, [isOpen])

  const removeItem = async (id) => {
    try {
      await apiCall(`/cart/items/${id}`, { method: 'DELETE' })
      await onRefreshCart?.()
    } catch (error) {
      console.error('Failed to remove cart item:', error)
    }
  }

  const updateQuantity = async (item, delta) => {
    const currentQty = Number(item.quantity ?? 1)
    const nextQty = currentQty + delta

    try {
      if (delta > 0) {
        await apiCall('/cart/items', {
          method: 'POST',
          body: JSON.stringify({ productId: item.productId, quantity: 1 }),
        })
        await onRefreshCart?.()
        return
      }

      if (nextQty <= 0) {
        await removeItem(item.cartItemId)
        return
      }

      // Backend supports add/remove only, so rebuild this item with the new quantity.
      await apiCall(`/cart/items/${item.cartItemId}`, { method: 'DELETE' })
      await apiCall('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ productId: item.productId, quantity: nextQty }),
      })
      await onRefreshCart?.()
    } catch (error) {
      console.error('Failed to update cart quantity:', error)
    }
  }

  const openStep = (nextStep) => {
    setStep(nextStep)
    setIsOpen(true)
  }

  if (items.length === 0) {
    return null
  }

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          className="wl-cart-bubble-launcher"
          onClick={() => setIsOpen(true)}
          aria-label={`Open cart with ${itemCount} item${itemCount === 1 ? '' : 's'}`}
        >
          <span className="wl-cart-bubble-launcher-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 6h15l-1.5 8.5a2 2 0 0 1-2 1.6H9a2 2 0 0 1-2-1.6L5 3H2" />
              <circle cx="10" cy="20" r="1.5" />
              <circle cx="18" cy="20" r="1.5" />
            </svg>
          </span>
          <span className="wl-cart-bubble-launcher-label">Cart</span>
          <span className="wl-cart-bubble-launcher-count">{itemCount}</span>
        </button>
      )}

      {isOpen && (
        <div className="wl-cart-bubble-backdrop" onClick={() => setIsOpen(false)}>
          <section
            className="wl-cart-bubble-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Cart checkout bubble"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="wl-cart-bubble-head">
              <div>
                <p className="wl-cart-bubble-kicker">Checkout</p>
                <h2>Shopping Cart</h2>
              </div>
              <button type="button" className="wl-modal-close" onClick={() => setIsOpen(false)} aria-label="Close cart bubble">
                ×
              </button>
            </header>

            <nav className="wl-cart-bubble-stepper" aria-label="Checkout steps">
              {CHECKOUT_STEPS.map((item, index) => {
                const isActive = item.id === step
                const isCompleted = CHECKOUT_STEPS.findIndex((entry) => entry.id === step) > index

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`wl-cart-bubble-step ${isActive ? 'is-active' : ''} ${isCompleted ? 'is-complete' : ''}`}
                    onClick={() => openStep(item.id)}
                  >
                    <span>{index + 1}</span>
                    <strong>{item.label}</strong>
                  </button>
                )
              })}
            </nav>

            <div className="wl-cart-bubble-body">
              {step === 'cart' && (
                <section className="wl-cart-bubble-grid">
                  <div className="wl-cart-bubble-list">
                    <div className="wl-cart-bubble-section-head">
                      <h3>Shopping Cart</h3>
                      <span>{itemCount} item{itemCount === 1 ? '' : 's'}</span>
                    </div>

                    <div className="wl-cart-bubble-items">
                      {items.map((item) => (
                        <article key={item.cartItemId} className="wl-cart-bubble-item">
                          <div className="wl-cart-item-thumb wl-cart-bubble-thumb" />

                          <div className="wl-cart-bubble-item-content">
                            <div className="wl-cart-bubble-item-head">
                              <div>
                                <h4>{item.productName}</h4>
                                <p className="wl-cart-bubble-item-size">Medium</p>
                                <p className="wl-cart-bubble-item-addons">Extra Shot, Oat Milk</p>
                              </div>
                              <strong>₱{formatPrice(item.lineTotal)}</strong>
                            </div>

                            <div className="wl-cart-bubble-item-actions">
                              <div className="wl-bubble-qty-control" aria-label="Change quantity">
                                <button type="button" onClick={() => updateQuantity(item, -1)} aria-label="Decrease quantity">−</button>
                                <span>{item.quantity}</span>
                                <button type="button" onClick={() => updateQuantity(item, 1)} aria-label="Increase quantity">+</button>
                              </div>

                              <button type="button" className="wl-danger-link wl-cart-bubble-remove" onClick={() => removeItem(item.cartItemId)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                  <path d="M3 6h18" />
                                  <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
                                  <path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" />
                                  <path d="M10 11v6" />
                                  <path d="M14 11v6" />
                                </svg>
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>

                  <aside className="wl-summary-card wl-cart-bubble-summary">
                    <h3>Order Summary</h3>
                    <div className="wl-summary-row"><span>Subtotal</span><span>Php {formatPrice(total)}</span></div>
                    <div className="wl-summary-row"><span>Tax</span><span>Php 20</span></div>
                    <div className="wl-summary-row"><span>Discount</span><span>- Php 0</span></div>
                    <div className="wl-summary-row total"><span>Total</span><span>Php {formatPrice(total)}</span></div>

                    <div className="wl-cart-bubble-actions">
                      <button type="button" onClick={() => openStep('details')}>Checkout</button>
                      <button type="button" className="wl-secondary-button" onClick={() => setIsOpen(false)}>
                        Continue Shopping
                      </button>
                    </div>
                  </aside>
                </section>
              )}

              {step === 'details' && (
                <section className="wl-cart-bubble-grid">
                  <div className="wl-cart-bubble-details">
                    <div className="wl-cart-bubble-section-head">
                      <h3>Order Type</h3>
                      <span>Choose how you want to receive it</span>
                    </div>

                    <div className="wl-order-type-grid">
                      <button
                        type="button"
                        className={`wl-order-type-card ${orderType === 'dine-in' ? 'is-active' : ''}`}
                        onClick={() => setOrderType('dine-in')}
                      >
                        <span className="wl-order-type-dot" aria-hidden="true" />
                        <div>
                          <strong>Dine In</strong>
                          <p className="wl-muted">Eat at the lounge</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        className={`wl-order-type-card ${orderType === 'pickup' ? 'is-active' : ''}`}
                        onClick={() => setOrderType('pickup')}
                      >
                        <span className="wl-order-type-dot" aria-hidden="true" />
                        <div>
                          <strong>Pickup</strong>
                          <p className="wl-muted">Take away order</p>
                        </div>
                      </button>
                    </div>

                    <label className="wl-field-group">
                      <span>Customer Name (for cup label and call-out)</span>
                      <input
                        className="wl-input"
                        type="text"
                        value={customerName}
                        onChange={(event) => {
                          const nextName = event.target.value
                          setCustomerName(nextName)
                          localStorage.setItem('checkoutCustomerName', nextName)
                        }}
                        placeholder="Enter customer name"
                      />
                    </label>

                    <label className="wl-field-group">
                      <span>Special Instructions</span>
                      <textarea
                        className="wl-textarea"
                        rows={6}
                        value={specialInstructions}
                        onChange={(event) => setSpecialInstructions(event.target.value)}
                        placeholder="Any special requests?"
                      />
                    </label>

                    <div className="wl-promo-panel">
                      <strong>Apply Promo Code</strong>
                      <div className="wl-promo-row">
                        <input
                          className="wl-input"
                          type="text"
                          value={promoCode}
                          onChange={(event) => setPromoCode(event.target.value)}
                          placeholder="Enter code"
                        />
                        <button type="button" onClick={() => {}}>
                          Apply
                        </button>
                      </div>
                    </div>

                    <div className="wl-cart-bubble-actions">
                      <button type="button" className="wl-secondary-button" onClick={() => setStep('cart')}>
                        Back
                      </button>
                      <button type="button" onClick={() => setStep('payment')}>
                        Continue to Payment
                      </button>
                    </div>
                  </div>

                  <aside className="wl-summary-card wl-cart-bubble-summary">
                    <h3>Order Summary</h3>
                    <div className="wl-summary-row"><span>Subtotal</span><span>Php {formatPrice(total)}</span></div>
                    <div className="wl-summary-row"><span>Tax</span><span>Php 20</span></div>
                    <div className="wl-summary-row"><span>Discount</span><span>- Php 0</span></div>
                    <div className="wl-summary-row total"><span>Total</span><span>Php {formatPrice(total)}</span></div>

                    <div className="wl-cart-bubble-mini-note">
                      <p className="wl-muted">Order type: {orderType === 'dine-in' ? 'Dine In' : 'Pickup'}</p>
                      <p className="wl-muted">Call-out name: {customerName || 'N/A'}</p>
                    </div>
                  </aside>
                </section>
              )}

              {step === 'payment' && <section className="wl-payment-empty" aria-label="Payment screen" />}
            </div>
          </section>
        </div>
      )}
    </>
  )
}

export default MenuCartBubble