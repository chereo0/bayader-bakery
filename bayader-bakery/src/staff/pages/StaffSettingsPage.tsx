import React, { useState, useEffect } from 'react'
import axios from 'axios'

interface UserProfile {
  _id: string
  name: string
  email: string
  phone?: string
  department?: string
  settings?: {
    notifications?: {
      email?: boolean
      push?: boolean
      sms?: boolean
    }
    preferences?: {
      language?: string
      theme?: string
      timezone?: string
    }
  }
}

interface Toast {
  id: string
  message: string
  type: 'success' | 'error'
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const getToken = () => localStorage.getItem('token')

const StaffSettingsPage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'preferences'>('profile')

  // Profile form
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    department: ''
  })
  const [profileUpdating, setProfileUpdating] = useState(false)

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordUpdating, setPasswordUpdating] = useState(false)

  // Preferences form
  const [preferencesForm, setPreferencesForm] = useState({
    language: 'en',
    theme: 'light',
    timezone: 'UTC+3',
    emailNotifications: true,
    pushNotifications: true
  })
  const [preferencesUpdating, setPreferencesUpdating] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const addToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const token = getToken()
      if (!token) {
        setError('Not authenticated')
        return
      }

      const response = await axios.get(`${API_BASE_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.data.success) {
        const userData = response.data.data
        setProfile(userData)

        // Populate form fields
        setProfileForm({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          department: userData.department || ''
        })

        setPreferencesForm({
          language: userData.settings?.preferences?.language || 'en',
          theme: userData.settings?.preferences?.theme || 'light',
          timezone: userData.settings?.preferences?.timezone || 'UTC+3',
          emailNotifications: userData.settings?.notifications?.email !== false,
          pushNotifications: userData.settings?.notifications?.push !== false
        })

        setError(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile')
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setProfileUpdating(true)
      const token = getToken()

      const response = await axios.patch(
        `${API_BASE_URL}/users/me`,
        {
          name: profileForm.name,
          phone: profileForm.phone
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.success) {
        setProfile(response.data.data)
        addToast('Profile updated successfully', 'success')
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update profile'
      addToast(errorMessage, 'error')
      console.error('Error updating profile:', err)
    } finally {
      setProfileUpdating(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast('Passwords do not match', 'error')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      addToast('Password must be at least 6 characters', 'error')
      return
    }

    try {
      setPasswordUpdating(true)
      const token = getToken()

      const response = await axios.post(
        `${API_BASE_URL}/users/change-password`,
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.success) {
        addToast('Password changed successfully', 'success')
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to change password'
      addToast(errorMessage, 'error')
      console.error('Error changing password:', err)
    } finally {
      setPasswordUpdating(false)
    }
  }

  const handleUpdatePreferences = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setPreferencesUpdating(true)
      const token = getToken()

      const response = await axios.patch(
        `${API_BASE_URL}/users/me`,
        {
          settings: {
            notifications: {
              email: preferencesForm.emailNotifications,
              push: preferencesForm.pushNotifications
            },
            preferences: {
              language: preferencesForm.language,
              theme: preferencesForm.theme,
              timezone: preferencesForm.timezone
            }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.success) {
        setProfile(response.data.data)
        addToast('Preferences updated successfully', 'success')
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update preferences'
      addToast(errorMessage, 'error')
      console.error('Error updating preferences:', err)
    } finally {
      setPreferencesUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#c79a63]"></div>
        <p className="text-gray-600 mt-4">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#5E372E]">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account and preferences</p>
        </div>
      </div>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-white font-medium transition-all ${
              toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {profile && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <nav className="flex flex-col">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-6 py-4 text-left font-medium transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-[#c79a63] text-white border-l-4 border-[#5E372E]'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  👤 Profile
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`px-6 py-4 text-left font-medium transition-colors border-t ${
                    activeTab === 'password'
                      ? 'bg-[#c79a63] text-white border-l-4 border-[#5E372E]'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  🔐 Password
                </button>
                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`px-6 py-4 text-left font-medium transition-colors border-t ${
                    activeTab === 'preferences'
                      ? 'bg-[#c79a63] text-white border-l-4 border-[#5E372E]'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  ⚙️ Preferences
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[#5E372E] mb-4">Profile Information</h2>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c79a63] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={profileForm.email}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c79a63] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Department
                        </label>
                        <input
                          type="text"
                          value={profileForm.department}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Department is assigned by admin</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={profileUpdating}
                        className="px-6 py-2 bg-[#c79a63] text-white rounded-lg hover:bg-[#b8885a] disabled:opacity-50 font-medium transition-colors"
                      >
                        {profileUpdating ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[#5E372E] mb-4">Change Password</h2>
                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c79a63] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c79a63] focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c79a63] focus:border-transparent"
                      />
                    </div>
                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={passwordUpdating}
                        className="px-6 py-2 bg-[#c79a63] text-white rounded-lg hover:bg-[#b8885a] disabled:opacity-50 font-medium transition-colors"
                      >
                        {passwordUpdating ? 'Updating...' : 'Change Password'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[#5E372E] mb-4">Preferences</h2>
                  <form onSubmit={handleUpdatePreferences} className="space-y-6">
                    {/* Regional Settings */}
                    <div className="pb-6 border-b border-gray-200">
                      <h3 className="font-medium text-gray-900 mb-4">Regional Settings</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Language
                          </label>
                          <select
                            value={preferencesForm.language}
                            onChange={e => setPreferencesForm({ ...preferencesForm, language: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c79a63] focus:border-transparent"
                          >
                            <option value="en">English</option>
                            <option value="ar">العربية (Arabic)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Theme
                          </label>
                          <select
                            value={preferencesForm.theme}
                            onChange={e => setPreferencesForm({ ...preferencesForm, theme: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c79a63] focus:border-transparent"
                          >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Timezone
                          </label>
                          <select
                            value={preferencesForm.timezone}
                            onChange={e => setPreferencesForm({ ...preferencesForm, timezone: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c79a63] focus:border-transparent"
                          >
                            <option value="UTC+3">UTC+3 (Arabia)</option>
                            <option value="UTC+2">UTC+2</option>
                            <option value="UTC+1">UTC+1</option>
                            <option value="UTC">UTC</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Notification Settings */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4">Notifications</h3>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferencesForm.emailNotifications}
                            onChange={e => setPreferencesForm({ ...preferencesForm, emailNotifications: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                          <span className="text-gray-700">Email Notifications</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferencesForm.pushNotifications}
                            onChange={e => setPreferencesForm({ ...preferencesForm, pushNotifications: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                          <span className="text-gray-700">Push Notifications</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-200">
                      <button
                        type="submit"
                        disabled={preferencesUpdating}
                        className="px-6 py-2 bg-[#c79a63] text-white rounded-lg hover:bg-[#b8885a] disabled:opacity-50 font-medium transition-colors"
                      >
                        {preferencesUpdating ? 'Saving...' : 'Save Preferences'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default StaffSettingsPage
