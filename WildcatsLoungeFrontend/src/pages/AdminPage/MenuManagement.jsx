import { useEffect, useState } from 'react'
import AppShell from '../../components/AppShell'
import { apiCall, apiGetCached } from '../../utils/api'

function MenuManagement() {
  const [form, setForm] = useState({
    name: '',
    category: 'Coffee',
    description: '',
    price: '',
    available: true,
    imageUrl: '',
  })
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadProducts = async () => {
    setLoadingProducts(true)
    try {
      const data = await apiGetCached('/products', { ttlMs: 60000 })
      setProducts(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Failed to load products')
      setProducts([])
    } finally {
      setLoadingProducts(false)
    }
  }

  useEffect(() => {
    void loadProducts()
  }, [])

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageChange = (event) => {
    const [file] = event.target.files || []
    if (!file) {
      updateField('imageUrl', '')
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file.')
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      updateField('imageUrl', typeof reader.result === 'string' ? reader.result : '')
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    const parsedPrice = Number(form.price)
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setError('Price must be greater than 0.')
      return
    }

    try {
      setSubmitting(true)
      await apiCall('/admin/products', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name.trim(),
          category: form.category.trim(),
          description: form.description.trim(),
          price: parsedPrice,
          available: form.available,
          imageUrl: form.imageUrl || null,
        }),
      })

      setSuccess('Menu item created successfully.')
      setForm({
        name: '',
        category: 'Coffee',
        description: '',
        price: '',
        available: true,
        imageUrl: '',
      })
      await loadProducts()
    } catch (err) {
      setError(err.message || 'Unable to create menu item.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppShell
      title="Menu Management"
      subtitle="Create menu items (Admin and Superadmin only)"
      rightContent={null}
    >
      <section className="wl-admin-create-panel">
        <h3>Create Menu Item</h3>
        <p className="wl-muted">Only ADMIN and SUPERADMIN roles can create menu entries.</p>

        <form className="wl-admin-create-form" onSubmit={handleSubmit}>
          <input
            className="wl-input"
            type="text"
            placeholder="Product name"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            required
          />
          <select
            className="wl-select"
            value={form.category}
            onChange={(e) => updateField('category', e.target.value)}
          >
            <option value="Coffee">Coffee</option>
            <option value="Pastry">Pastry</option>
            <option value="Tea">Tea</option>
            <option value="Snack">Snack</option>
          </select>
          <input
            className="wl-input"
            type="number"
            min="1"
            step="0.01"
            placeholder="Price"
            value={form.price}
            onChange={(e) => updateField('price', e.target.value)}
            required
          />
          <label className="wl-admin-toggle">
            <input
              type="checkbox"
              checked={form.available}
              onChange={(e) => updateField('available', e.target.checked)}
            />
            Available
          </label>
          <textarea
            className="wl-input wl-admin-menu-description"
            placeholder="Description"
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            required
          />
          <label className="wl-admin-file-input">
            Upload image
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Menu Item'}
          </button>
        </form>

        {form.imageUrl && (
          <div className="wl-admin-image-preview-wrap">
            <img src={form.imageUrl} alt="Preview" className="wl-admin-image-preview" />
          </div>
        )}

        {error && <p className="wl-error-text">{error}</p>}
        {success && <p className="wl-admin-create-success">{success}</p>}
      </section>

      <section className="wl-admin-menu-list">
        <h3>Current Menu Items</h3>
        {loadingProducts ? (
          <p className="wl-muted">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="wl-muted">No menu items yet.</p>
        ) : (
          <div className="wl-admin-menu-grid">
            {products.map((product) => (
              <article key={product.id} className="wl-admin-menu-card">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="wl-admin-menu-card-image" />
                ) : (
                  <div className="wl-admin-menu-card-image wl-admin-menu-card-image-placeholder" />
                )}
                <h4>{product.name}</h4>
                <p className="wl-muted">{product.description}</p>
                <div className="wl-admin-menu-meta">
                  <span>{product.category}</span>
                  <strong>P{product.price}</strong>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  )
}

export default MenuManagement
