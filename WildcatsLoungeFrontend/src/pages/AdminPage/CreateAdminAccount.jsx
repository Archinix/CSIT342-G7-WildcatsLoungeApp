import { useState } from 'react'
import AppShell from '../../components/AppShell'
import { apiCall } from '../../utils/api'

function CreateAdminAccount() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      }

      await apiCall('/admin/superadmin/accounts/admins', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      setSuccess('Admin account created successfully.')
      setForm({ firstName: '', lastName: '', email: '', password: '' })
    } catch (err) {
      setError(err.message || 'Unable to create admin account.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppShell
      title="Admin Account Management"
      subtitle="Create administrator accounts (Superadmin access only)"
      rightContent={null}
    >
      <section className="wl-admin-create-panel">
        <h3>Create Admin Account</h3>
        <p className="wl-muted">Only users logged in as superadmin can access this page.</p>

        <form className="wl-admin-create-form" onSubmit={handleSubmit}>
          <input
            className="wl-input"
            type="text"
            placeholder="First name"
            value={form.firstName}
            onChange={(e) => updateField('firstName', e.target.value)}
            required
          />
          <input
            className="wl-input"
            type="text"
            placeholder="Last name"
            value={form.lastName}
            onChange={(e) => updateField('lastName', e.target.value)}
            required
          />
          <input
            className="wl-input"
            type="email"
            placeholder="admin@example.com"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            required
          />
          <input
            className="wl-input"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => updateField('password', e.target.value)}
            required
          />
          <button type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Admin'}
          </button>
        </form>

        {error && <p className="wl-error-text">{error}</p>}
        {success && <p className="wl-admin-create-success">{success}</p>}
      </section>
    </AppShell>
  )
}

export default CreateAdminAccount
