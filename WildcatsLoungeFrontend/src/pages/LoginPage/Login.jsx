import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './Login.css'
import logo from '../../assets/logo/logo.jpg'
import { useAuth } from '../../context/useAuth'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validateForm = () => {
    const newErrors = {}

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Email should be valid'
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (!isPasswordValid(password)) {
      newErrors.password = 'Password does not meet requirements'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const isPasswordValid = (pwd) => {
    return (
      pwd.length >= 8 &&
      /[A-Z]/.test(pwd) &&
      /[0-9]/.test(pwd) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        login(data.user, {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        })
        navigate('/menu')
      } else {
        setErrors({ submit: data.message || 'Invalid email or password' })
      }
    } catch (error) {
      setErrors({ submit: 'An error occurred. Please try again.' })
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-brand">
          <img src={logo} alt="Wildcats Lounge Logo" className="login-logo" />
          <h1>Wildcats Lounge</h1>
          <p>CIT-U's premier campus cafe<br />Order your favorites online</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <h2>Welcome Back</h2>
          <p className="login-subtitle">Sign in to your Wildcats Lounge Account</p>

          {errors.submit && <div className="login-error">{errors.submit}</div>}

          <div className="login-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="student@cit.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="login-options">
            <label className="login-checkbox">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="login-forgot">
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <p className="login-switch">
            Don't have an account?{' '}
            <a href="/signup" className="login-switch-link">
              Sign up
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Login
