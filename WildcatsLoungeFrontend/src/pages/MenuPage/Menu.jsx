import { useEffect, useState } from 'react'
import { apiCall } from '../../utils/api'
import AppShell from '../../components/AppShell'

const ADD_ON_OPTIONS = [
  { id: 'extra-shot', label: 'Extra Shot', price: 30 },
  { id: 'oat-milk', label: 'Oat Milk', price: 25 },
  { id: 'whipped-cream', label: 'Whipped Cream', price: 15 },
]

function Menu() {
  const [products, setProducts] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedAddOns, setSelectedAddOns] = useState([])

  const loadProducts = async () => {
    setLoading(true)
    setError('')

    try {
      const data = await apiCall('/products')
      setProducts(Array.isArray(data) ? data : [])
    } catch (err) {
      setProducts([])
      setError(err.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadProducts()
  }, [])

  const addToCart = async (productId, qty = 1) => {
    try {
      await apiCall('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity: qty }),
      })
      alert('Added to cart')
    } catch (err) {
      alert(err.message || 'Unable to add to cart')
    }
  }

  const openProductDetails = (product) => {
    setSelectedProduct(product)
    setQuantity(1)
    setSelectedAddOns([])
  }

  const closeProductDetails = () => {
    setSelectedProduct(null)
  }

  const toggleAddOn = (id) => {
    setSelectedAddOns((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const selectedAddOnTotal = selectedAddOns.reduce((sum, addOnId) => {
    const addOn = ADD_ON_OPTIONS.find((item) => item.id === addOnId)
    return sum + (addOn ? addOn.price : 0)
  }, 0)

  const selectedBasePrice = selectedProduct ? Number(selectedProduct.price) : 0
  const selectedTotal = (selectedBasePrice + selectedAddOnTotal) * quantity

  return (
    <AppShell
      title="Menu"
      subtitle="Fresh brews and pastries from Wildcats Lounge"
      rightContent={null}
    >
      <section className="wl-promo-bar" aria-label="promotion">
        <span className="wl-promo-icon">☕</span>
        <span>Special: Buy 2 Get 1 Free!</span>
      </section>

      <section className="wl-toolbar">
        <input className="wl-input" type="text" placeholder="Search menu..." />
        <select className="wl-select" defaultValue="all">
          <option value="all">All categories</option>
          <option value="coffee">Coffee</option>
          <option value="pastry">Pastry</option>
        </select>
      </section>

      {loading && <p className="wl-muted">Loading products...</p>}
      {error && <p className="wl-error-text">{error}</p>}

      {!loading && products.length === 0 && !error && (
        <p className="wl-muted">No products available yet. Menu items are managed in the admin panel.</p>
      )}

      <section className="wl-product-grid">
        {products.map((product) => (
          <article
            key={product.id}
            className="wl-product-card wl-clickable-card"
            onClick={() => openProductDetails(product)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                openProductDetails(product)
              }
            }}
          >
            <div
              className="wl-product-thumb"
              style={product.imageUrl ? { backgroundImage: `url(${product.imageUrl})` } : undefined}
            />
            <h3>{product.name}</h3>
            <p className="wl-muted">{product.description}</p>
            <div className="wl-product-meta">
              <span>{product.category}</span>
              <strong>Php {product.price}</strong>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                addToCart(product.id)
              }}
              disabled={!product.available}
            >
              {product.available ? 'Add' : 'Unavailable'}
            </button>
          </article>
        ))}
      </section>

      {selectedProduct && (
        <div className="wl-modal-overlay" onClick={closeProductDetails}>
          <div className="wl-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="wl-modal-head">
              <strong>Product Details</strong>
              <button className="wl-modal-close" onClick={closeProductDetails}>x</button>
            </div>

            <div className="wl-modal-body">
              <div className="wl-modal-media">
                <div
                  className="wl-modal-image"
                  style={selectedProduct.imageUrl ? { backgroundImage: `url(${selectedProduct.imageUrl})` } : undefined}
                />
                <div className="wl-modal-thumbs">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </div>

              <div className="wl-modal-content">
                <h2>{selectedProduct.name}</h2>
                <div className="wl-modal-price-row">
                  <strong>Php {selectedProduct.price}</strong>
                  <span className="wl-muted">★ 4.8 (120)</span>
                </div>
                <p className="wl-muted">{selectedProduct.description}</p>

                <h4>Add-ons</h4>
                <div className="wl-addon-list">
                  {ADD_ON_OPTIONS.map((addOn) => (
                    <label key={addOn.id} className="wl-addon-item">
                      <input
                        type="checkbox"
                        checked={selectedAddOns.includes(addOn.id)}
                        onChange={() => toggleAddOn(addOn.id)}
                      />
                      <span>{addOn.label}</span>
                      <span>P{addOn.price}</span>
                    </label>
                  ))}
                </div>

                <div className="wl-modal-actions">
                  <div className="wl-qty-control">
                    <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</button>
                    <span>{quantity}</span>
                    <button onClick={() => setQuantity((q) => q + 1)}>+</button>
                  </div>
                  <button onClick={() => addToCart(selectedProduct.id, quantity)}>
                    Add to Cart - P{selectedTotal}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}

export default Menu
