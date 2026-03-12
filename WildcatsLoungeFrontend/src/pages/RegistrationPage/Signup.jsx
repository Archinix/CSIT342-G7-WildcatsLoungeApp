import { useState } from 'react'
import './Signup.css'
import logo from '../../assets/logo/logo.jpg'

function Signup() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  })

  const validatePasswordRequirements = (pwd) => {
    setPasswordRequirements({
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    })
  }

  const strengthScore = Object.values(passwordRequirements).filter(Boolean).length

  const getStrengthLabel = () => {
    if (!password) return 'Too weak'
    if (strengthScore <= 1) return 'Weak'
    if (strengthScore <= 3) return 'Medium'
    return 'Strong'
  }

  const isPasswordValid = (pwd) => {
    return (
      pwd.length >= 8 &&
      /[A-Z]/.test(pwd) &&
      /[0-9]/.test(pwd) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    )
  }

  const validateForm = () => {
    const newErrors = {}

    // First name validation
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required'
    } else if (firstName.trim().length < 2) {
      newErrors.firstName = 'First name should be at least 2 characters'
    }

    // Last name validation
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    } else if (lastName.trim().length < 2) {
      newErrors.lastName = 'Last name should be at least 2 characters'
    }

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

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('http://localhost:8080/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, email, password }),
      })

      const data = await response.json()

      if (response.status === 201 && data.success) {
        // Store JWT tokens and user info
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        console.log('Registration successful:', data.user)
        
        // Redirect to menu
        setTimeout(() => {
          window.location.href = '/menu'
        }, 500)
      } else if (response.status === 409) {
        setErrors({ submit: data.message || 'Email already registered. Please use a different email.' })
      } else {
        setErrors({ submit: data.message || 'Registration failed. Please try again.' })
      }
    } catch (error) {
      setErrors({ submit: 'An error occurred. Please try again.' })
      console.error('Registration error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-brand">
          <img src={logo} alt="Wildcats Lounge Logo" className="signup-logo" />
          <h1>Join Wildcats Lounge</h1>
          <p>Start earning rewards today!</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          <h2>Create Account</h2>
          <p className="signup-subtitle">Join Wildcats Lounge Today</p>

          {errors.submit && <div className="signup-error">{errors.submit}</div>}

          <div className="signup-row">
            <div className="signup-field">
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                type="text"
                placeholder="Juan"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={errors.firstName ? 'input-error' : ''}
              />
              {errors.firstName && <span className="error-message">{errors.firstName}</span>}
            </div>
            <div className="signup-field">
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                type="text"
                placeholder="Dela Cruz"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={errors.lastName ? 'input-error' : ''}
              />
              {errors.lastName && <span className="error-message">{errors.lastName}</span>}
            </div>
          </div>

          <div className="signup-field">
            <label htmlFor="email">Email Address</label>
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

          <div className="signup-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                validatePasswordRequirements(e.target.value)
              }}
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
            
            {password && (
              <div className="password-hint-panel">
                <div className="password-meter-header">
                  <div className="password-meter-track">
                    <span
                      className={`password-meter-fill strength-${getStrengthLabel().toLowerCase()}`}
                      style={{ width: `${(strengthScore / 4) * 100}%` }}
                    />
                  </div>
                  <span className={`strength-label strength-${getStrengthLabel().toLowerCase()}`}>
                    {getStrengthLabel()}
                  </span>
                </div>
                <div className="requirement-inline-grid">
                  <div className="requirement-inline-item">
                    <span className={passwordRequirements.length ? 'requirement-dot met' : 'requirement-dot'}>
                      {passwordRequirements.length ? '✓' : '○'}
                    </span>
                    <span>At least 8 characters</span>
                  </div>
                  <div className="requirement-inline-item">
                    <span className={passwordRequirements.uppercase ? 'requirement-dot met' : 'requirement-dot'}>
                      {passwordRequirements.uppercase ? '✓' : '○'}
                    </span>
                    <span>One uppercase letter</span>
                  </div>
                  <div className="requirement-inline-item">
                    <span className={passwordRequirements.number ? 'requirement-dot met' : 'requirement-dot'}>
                      {passwordRequirements.number ? '✓' : '○'}
                    </span>
                    <span>One number</span>
                  </div>
                  <div className="requirement-inline-item">
                    <span className={passwordRequirements.special ? 'requirement-dot met' : 'requirement-dot'}>
                      {passwordRequirements.special ? '✓' : '○'}
                    </span>
                    <span>One special character</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="signup-field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={errors.confirmPassword ? 'input-error' : ''}
            />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="signup-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <p className="signup-switch">
            Already have an Account?{' '}
            <a href="/login" className="signup-switch-link">
              Sign in
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Signup
