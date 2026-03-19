import { useState } from 'react'
import { useAuth } from '../../context/useAuth'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../components/AppShell'
import './ChangePassword.css'

function ChangePassword() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState({})

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters'
    } else if (!/[A-Z]/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain an uppercase letter'
    } else if (!/[a-z]/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain a lowercase letter'
    } else if (!/[0-9]/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain a digit'
    } else if (!/[!@#$%^&*.]/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain a special character (!@#$%^&*.)'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setMessage('')
    setIsSuccess(false)

    try {
      const response = await fetch(`http://localhost:8080/auth/users/${user?.id}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password')
      }

      setMessage('Password changed successfully!')
      setIsSuccess(true)
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })

      // Redirect to profile after 2 seconds
      setTimeout(() => navigate('/profile'), 2000)
    } catch (error) {
      setMessage(error.message)
      setIsSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrength = () => {
    const password = formData.newPassword
    if (!password) return { text: '', color: '', percentage: 0 }

    let strength = 0
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[!@#$%^&*.]/.test(password)) strength++

    const strengthMap = {
      1: { text: 'Weak', color: '#f44336', percentage: 20 },
      2: { text: 'Fair', color: '#ff9800', percentage: 40 },
      3: { text: 'Good', color: '#ffc107', percentage: 60 },
      4: { text: 'Strong', color: '#8bc34a', percentage: 80 },
      5: { text: 'Very Strong', color: '#4caf50', percentage: 100 }
    }

    return strengthMap[strength] || { text: '', color: '', percentage: 0 }
  }

  const strength = getPasswordStrength()

  return (
    <AppShell title="Change Password" subtitle="Update your account password">
      <div className="change-password-container">
        <div className="change-password-card">
          <div className="change-password-section">
            {message && (
              <div className={`alert ${isSuccess ? 'alert-success' : 'alert-error'}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="change-password-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  placeholder="Enter your current password"
                  className={errors.currentPassword ? 'error' : ''}
                />
                {errors.currentPassword && (
                  <p className="error-message">{errors.currentPassword}</p>
                )}
              </div>

              <div className="form-divider"></div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Enter new password"
                  className={errors.newPassword ? 'error' : ''}
                />
                {errors.newPassword && (
                  <p className="error-message">{errors.newPassword}</p>
                )}

                {formData.newPassword && (
                  <div className="strength-indicator">
                    <div className="strength-bar">
                      <div
                        className="strength-fill"
                        style={{
                          width: `${strength.percentage}%`,
                          backgroundColor: strength.color
                        }}
                      ></div>
                    </div>
                    <p className="strength-text" style={{ color: strength.color }}>
                      Strength: {strength.text}
                    </p>
                  </div>
                )}

                <p className="password-requirements">
                  Password must contain:
                  <br />
                  • At least 8 characters
                  <br />
                  • One uppercase letter (A-Z)
                  <br />
                  • One lowercase letter (a-z)
                  <br />
                  • One digit (0-9)
                  <br />
                  • One special character (!@#$%^&*.)
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your new password"
                  className={errors.confirmPassword ? 'error' : ''}
                />
                {errors.confirmPassword && (
                  <p className="error-message">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Changing Password...' : 'Change Password'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/profile')}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </form>

            <div className="security-tips">
              <h3>Security Tips</h3>
              <ul>
                <li>Never share your password with anyone</li>
                <li>Use a unique password not used on other sites</li>
                <li>Change your password periodically for better security</li>
                <li>If you suspect your account is compromised, change it immediately</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

export default ChangePassword
