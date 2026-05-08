import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import logo from '../../assets/logo/logo.jpg'
import { API_BASE_URL } from '../../utils/api'
import './ResetPassword.css'
import '../LoginPage/Login.css'

function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  })

  const [passwordErrors, setPasswordErrors] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  })

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setValidating(false)
      setTokenValid(false)
      setMessage('Invalid password reset link')
      setMessageType('error')
      return
    }

    validateToken()
  }, [token])

  const validateToken = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/password/validate-token/${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      setTokenValid(data.valid)

      if (!data.valid) {
        setMessage(data.message || 'Reset link has expired or is invalid')
        setMessageType('error')
      }
    } catch (error) {
      console.error('Error validating token:', error)
      setTokenValid(false)
      setMessage('An error occurred. Please try again.')
      setMessageType('error')
    } finally {
      setValidating(false)
    }
  }

  const validatePassword = (password) => {
    const errors = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*.]/.test(password),
    }
    setPasswordErrors(errors)
    return Object.values(errors).every((v) => v)
  }

  const handlePasswordChange = (e) => {
    const { value } = e.target
    setFormData((prev) => ({
      ...prev,
      newPassword: value,
    }))
    if (value) {
      validatePassword(value)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('Passwords do not match')
      setMessageType('error')
      return
    }

    if (!validatePassword(formData.newPassword)) {
      setMessage('Password does not meet requirements')
      setMessageType('error')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/password/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessageType('success')
        setMessage(data.message)
        setSubmitted(true)
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        setMessageType('error')
        setMessage(data.message || 'Failed to reset password')
      }
    } catch (error) {
      setMessageType('error')
      setMessage('An error occurred. Please try again.')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (validating) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-brand">
            <img src={logo} alt="Wildcats Lounge" className="login-logo" />
            <h1>Wildcats Lounge</h1>
            <p>Validating...</p>
          </div>
          <div className="login-form">
            <h2>Reset Password</h2>
            <p className="login-subtitle">Validating your reset link...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!tokenValid) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-brand">
            <img src={logo} alt="Wildcats Lounge" className="login-logo" />
            <h1>Wildcats Lounge</h1>
            <p>Link Invalid</p>
          </div>
          <div className="login-form">
            <h2>Invalid Reset Link</h2>
            <p className="login-subtitle">This link has expired or is invalid</p>
            
            <div className="forgot-alert forgot-alert-error">
              <p>{message}</p>
            </div>
            
            <Link to="/forgot-password" className="login-btn">
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-brand">
            <img src={logo} alt="Wildcats Lounge" className="login-logo" />
            <h1>Wildcats Lounge</h1>
            <p>Success!</p>
          </div>
          <div className="login-form">
            <h2>Password Updated</h2>
            <p className="login-subtitle">Your password has been reset successfully</p>
            
            <div className="forgot-alert forgot-alert-success">
              <p>{message}</p>
            </div>
            
            <p className="forgot-help-text">Redirecting to login...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-brand">
          <img src={logo} alt="Wildcats Lounge" className="login-logo" />
          <h1>Wildcats Lounge</h1>
          <p>CIT-U's premier campus cafe<br />Order your favorites online</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Create New Password</h2>
          <p className="login-subtitle">Enter a strong password to secure your account</p>
          
          {message && (
            <div className={`forgot-alert forgot-alert-${messageType}`}>
              <p>{message}</p>
            </div>
          )}

          <div className="login-field">
            <label htmlFor="password">New Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter new password"
              value={formData.newPassword}
              onChange={handlePasswordChange}
              required
              disabled={loading}
            />
            <div className="password-requirements">
              <p>Password must include:</p>
              <ul>
                <li className={passwordErrors.length ? 'is-valid' : ''}>
                  At least 8 characters
                </li>
                <li className={passwordErrors.uppercase ? 'is-valid' : ''}>
                  Uppercase letter (A-Z)
                </li>
                <li className={passwordErrors.lowercase ? 'is-valid' : ''}>
                  Lowercase letter (a-z)
                </li>
                <li className={passwordErrors.number ? 'is-valid' : ''}>
                  Number (0-9)
                </li>
                <li className={passwordErrors.special ? 'is-valid' : ''}>
                  Special character (!@#$%^&*.)
                </li>
              </ul>
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="confirm">Confirm Password</label>
            <input
              id="confirm"
              type="password"
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading || !Object.values(passwordErrors).every((v) => v)}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>

          <p className="login-switch">
            Remember your password? <Link to="/login" className="login-switch-link">Back to Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default ResetPasswordPage
