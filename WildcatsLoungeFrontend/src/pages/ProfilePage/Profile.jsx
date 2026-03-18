import { useState, useEffect } from 'react'
import { useAuth } from '../../context/useAuth'
import AppShell from '../../components/AppShell'
import './Profile.css'

function Profile() {
  const { user, isLoading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [photoPreview, setPhotoPreview] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  })

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      })
    }
  }, [user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    setMessage('')

    try {
      // Update profile information
      const response = await fetch(`http://localhost:8080/auth/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      // Upload photo if selected
      if (selectedFile) {
        const formDataPhoto = new FormData()
        formDataPhoto.append('file', selectedFile)

        const photoResponse = await fetch(`http://localhost:8080/auth/users/${user.id}/upload-photo`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: formDataPhoto
        })

        if (!photoResponse.ok) {
          throw new Error('Failed to upload photo')
        }
      }

      setMessage('Profile updated successfully!')
      setIsEditing(false)
      setSelectedFile(null)
      setPhotoPreview(null)

      // Refresh user data
      setTimeout(() => window.location.reload(), 1500)
    } catch (error) {
      setMessage(`Error: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || ''
    })
    setIsEditing(false)
    setSelectedFile(null)
    setPhotoPreview(null)
    setMessage('')
  }

  if (isLoading) {
    return <AppShell title="Loading..." />
  }

  return (
    <AppShell title="My Profile" subtitle="Manage your account details">
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-section">
            <h2>Profile Information</h2>

            {message && (
              <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
                {message}
              </div>
            )}

            {!isEditing ? (
              <div className="profile-view">
                <div className="profile-photo-section">
                  <div className="profile-photo">
                    <img
                      src={photoPreview || `http://localhost:8080/auth/users/${user?.id}/photo`}
                      alt="Profile"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/120?text=User'
                      }}
                    />
                  </div>
                </div>

                <div className="profile-info">
                  <div className="info-item">
                    <label>First Name</label>
                    <p>{user?.firstName}</p>
                  </div>
                  <div className="info-item">
                    <label>Last Name</label>
                    <p>{user?.lastName}</p>
                  </div>
                  <div className="info-item">
                    <label>Email</label>
                    <p>{user?.email}</p>
                  </div>
                  <div className="info-item">
                    <label>Role</label>
                    <p className="role-badge">{user?.role || 'CUSTOMER'}</p>
                  </div>
                  <div className="info-item">
                    <label>Member Since</label>
                    <p>{user?.createdAt ? new Date(parseInt(user.createdAt)).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>

                <div className="profile-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-edit">
                <div className="profile-photo-upload">
                  <div className="photo-preview">
                    <img
                      src={photoPreview || `http://localhost:8080/auth/users/${user?.id}/photo`}
                      alt="Profile Preview"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/120?text=User'
                      }}
                    />
                  </div>
                  <label className="file-input-label">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,.jpg,.jpeg"
                      onChange={handleFileChange}
                    />
                    <span>Change Photo</span>
                  </label>
                  <p className="file-note">JPG or PNG, max 5MB</p>
                </div>

                <form className="profile-form">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled
                    />
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}

export default Profile
