import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/useAuth'
import { useNavigate } from 'react-router-dom'
import './ProfileDropdown.css'

const photoUrlCache = new Map()

function ProfileDropdown() {
  const { logout, user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [photoUrl, setPhotoUrl] = useState(null)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const fetchPhoto = async () => {
      if (!user?.id) {
        setPhotoUrl(null)
        return
      }

      const cachedPhotoUrl = photoUrlCache.get(user.id)
      if (cachedPhotoUrl) {
        setPhotoUrl(cachedPhotoUrl)
        return
      }

      try {
        const token = localStorage.getItem('accessToken')
        const response = await fetch(`http://localhost:8080/auth/users/${user.id}/photo`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const blob = await response.blob()
          const url = URL.createObjectURL(blob)
          photoUrlCache.set(user.id, url)
          setPhotoUrl(url)
        }
      } catch (error) {
        console.log('No photo found or error fetching photo')
      }
    }

    fetchPhoto()
  }, [user?.id])

  const handleProfileClick = () => {
    navigate('/profile')
    setIsOpen(false)
  }

  const handleChangePasswordClick = () => {
    navigate('/change-password')
    setIsOpen(false)
  }

  const handleLogout = () => {
    setIsOpen(false)
    logout()
  }

  return (
    <div className="profile-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className="wl-icon-btn profile-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Profile menu"
      >
        {photoUrl ? (
          <img src={photoUrl} alt="Profile" className="profile-avatar" />
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5 20c1.6-3.4 4-5 7-5s5.4 1.6 7 5" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="profile-dropdown-menu">
          <div className="profile-dropdown-header">
            <p className="profile-user-name">{user?.fullName || user?.email}</p>
            <p className="profile-user-email">{user?.email}</p>
          </div>
          <hr />
          <button
            className="profile-dropdown-item"
            onClick={handleProfileClick}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            My Profile
          </button>
          <button
            className="profile-dropdown-item"
            onClick={handleChangePasswordClick}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Change Password
          </button>
          <hr />
          <button
            className="profile-dropdown-item logout"
            onClick={handleLogout}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

export default ProfileDropdown
