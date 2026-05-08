import { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../../assets/logo/logo.jpg'
import { API_BASE_URL } from '../../utils/api'
import './ForgotPassword.css'
import '../LoginPage/Login.css'

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(`${API_BASE_URL}/auth/password/forgot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessageType('success')
        setMessage(data.message)
        setSubmitted(true)
      } else {
        setMessageType('error')
        setMessage(data.message || 'Failed to send reset email')
      }
    } catch (error) {
      setMessageType('error')
      setMessage('An error occurred. Please try again.')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-brand">
            <img src={logo} alt="Wildcats Lounge" className="login-logo" />
            <h1>Wildcats Lounge</h1>
            <p>Check your email</p>
          </div>
          <div className="login-form">
            <h2>Email Sent</h2>
            <p className="login-subtitle">Password reset link has been sent</p>
            
            <div className="forgot-alert forgot-alert-success">
              <p>{message}</p>
            </div>
            
            <p className="forgot-help-text">
              If you don't see the email in your inbox, check your spam folder.
            </p>
            
            <Link to="/login" className="login-btn">
              Back to Login
            </Link>
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
          <h2>Reset Password</h2>
          <p className="login-subtitle">Enter your email to receive a reset link</p>
          
          {message && (
            <div className={`forgot-alert forgot-alert-${messageType}`}>
              <p>{message}</p>
            </div>
          )}

          <div className="login-field">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="student@cit.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>

          <p className="login-switch">
            Remember your password? <Link to="/login" className="login-switch-link">Back to Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
