import { useState, useEffect } from 'react'
import { useAuth } from '../../context/useAuth'
import AppShell from '../../components/AppShell'
import { apiCall, apiGetBlobUrlCached, invalidateApiCache } from '../../utils/api'
import './Profile.css'

function Profile() {
  const { user, isLoading, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [photoPreview, setPhotoPreview] = useState(null)
  const [photoUrl, setPhotoUrl] = useState(null)
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

  useEffect(() => {
    let active = true

    const loadPhoto = async () => {
      if (!user?.id) {
        if (active) {
          setPhotoUrl(null)
        }
        return
      }

      try {
        const url = await apiGetBlobUrlCached(`/auth/users/${user.id}/photo`, { ttlMs: 120000 })
        if (active) {
          setPhotoUrl(url)
        }
      } catch {
        if (active) {
          setPhotoUrl(null)
        }
      }
    }

    void loadPhoto()

    return () => {
      active = false
    }
  }, [user?.id])

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
      const updatedProfile = await apiCall(`/auth/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName
        })
      })

      if (updatedProfile && typeof updatedProfile === 'object') {
        updateUser({
          firstName: updatedProfile.firstName,
          lastName: updatedProfile.lastName,
          fullName: `${updatedProfile.firstName || ''} ${updatedProfile.lastName || ''}`.trim(),
        })
      }

      invalidateApiCache(`/auth/users/${user.id}`)

      // Upload photo if selected
      if (selectedFile) {
        const formDataPhoto = new FormData()
        formDataPhoto.append('file', selectedFile)

        await apiCall(`/auth/users/${user.id}/upload-photo`, {
          method: 'POST',
          body: formDataPhoto
        })

        invalidateApiCache(`/auth/users/${user.id}/photo`)
        const refreshedPhoto = await apiGetBlobUrlCached(`/auth/users/${user.id}/photo`, {
          ttlMs: 120000,
          forceRefresh: true,
        })
        setPhotoUrl(refreshedPhoto)
      }

      setMessage('Profile updated successfully!')
      setIsEditing(false)
      setSelectedFile(null)
      setPhotoPreview(null)
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
                      src={photoPreview || photoUrl || 'https://via.placeholder.com/120?text=User'}
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
                      src={photoPreview || photoUrl || 'https://via.placeholder.com/120?text=User'}
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
