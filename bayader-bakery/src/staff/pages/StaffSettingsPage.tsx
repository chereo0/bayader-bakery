import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'

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
  const { logout } = useAuth()
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

  // Preferences form - initialize with saved theme from localStorage
  const [preferencesForm, setPreferencesForm] = useState({
    theme: localStorage.getItem('theme') || 'light',
    timezone: 'UTC+3',
    emailNotifications: true,
    pushNotifications: true
  })
  const [preferencesUpdating, setPreferencesUpdating] = useState(false)

  useEffect(() => {
    fetchProfile()
    // Apply theme immediately on mount
    const savedTheme = localStorage.getItem('theme') || 'light'
    const htmlElement = document.documentElement
    if (savedTheme === 'dark') {
      htmlElement.classList.add('dark')
    } else {
      htmlElement.classList.remove('dark')
    }
  }, [])

  // Apply theme changes to DOM and save to localStorage
  useEffect(() => {
    const htmlElement = document.documentElement
    if (preferencesForm.theme === 'dark') {
      htmlElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      htmlElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
    // Dispatch custom event to notify other components of theme change
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: preferencesForm.theme } }))
  }, [preferencesForm.theme])

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

      console.log('🔄 Fetching profile...')

      // Load theme from localStorage first
      const savedTheme = localStorage.getItem('theme') || 'light'
      const htmlElement = document.documentElement
      if (savedTheme === 'dark') {
        htmlElement.classList.add('dark')
      } else {
        htmlElement.classList.remove('dark')
      }

      const response = await axios.get(`${API_BASE_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.data.success) {
        const userData = response.data.data
        console.log('📥 Fetched user data:', userData)
        
        // userData structure: { profile: {...}, notifications: {...}, preferences: {...} }
        const profileData = userData.profile || userData
        
        setProfile({
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          department: profileData.department
        } as any)

        // Populate form fields
        setProfileForm({
          name: profileData.name || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          department: profileData.department || ''
        })

        const theme = userData.preferences?.theme || localStorage.getItem('theme') || 'light'
        setPreferencesForm(prev => ({
          ...prev,
          theme: theme,
          timezone: userData.preferences?.timezone || 'UTC+3',
          emailNotifications: userData.notifications?.email !== false,
          pushNotifications: userData.notifications?.push !== false
        }))

        setError(null)
        console.log('✅ Profile loaded successfully')
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load profile'
      setError(errorMsg)
      console.error('❌ Error fetching profile:', errorMsg, err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('=== PROFILE UPDATE DEBUG ===')
    console.log('📝 Form values:', { name: profileForm.name, phone: profileForm.phone })
    console.log('🔐 Token exists:', !!getToken())
    console.log('🌐 API URL:', API_BASE_URL)

    try {
      setProfileUpdating(true)
      const token = getToken()
      
      if (!token) {
        console.error('❌ No token found!')
        addToast('Not authenticated', 'error')
        setProfileUpdating(false)
        return
      }

      const payload = {
        profile: {
          name: profileForm.name,
          phone: profileForm.phone
        }
      }
      console.log('📦 Request payload:', payload)

      const response = await axios.patch(
        `${API_BASE_URL}/users/me`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      console.log('📥 Full response:', response)
      console.log('📊 Response data:', response.data)

      if (response.data.success) {
        console.log('✅ Success! Updating state...')
        const updatedUser = response.data.data?.profile || response.data.data
        console.log('👤 Updated user info:', updatedUser)
        setProfile({
          ...profile,
          name: updatedUser?.name || profileForm.name,
          phone: updatedUser?.phone || profileForm.phone
        } as any)
        addToast('Profile updated successfully', 'success')
        console.log('🎉 Profile update complete!')
      } else {
        console.warn('⚠️ Success flag is false')
        addToast(response.data.message || 'Failed to update profile', 'error')
      }
    } catch (err: any) {
      console.error('💥 CATCH ERROR:', err)
      console.error('Response:', err.response?.data)
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update profile'
      addToast(errorMessage, 'error')
    } finally {
      setProfileUpdating(false)
      console.log('=== END PROFILE UPDATE ===')
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
        addToast('Password changed successfully! Redirecting to login...', 'success')
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        // Clear auth and redirect to login
        setTimeout(() => {
          logout()
          window.location.href = '/login'
        }, 1500)
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
          notifications: {
            email: preferencesForm.emailNotifications,
            push: preferencesForm.pushNotifications
          },
          preferences: {
            theme: preferencesForm.theme,
            timezone: preferencesForm.timezone
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
        // Update profile with response data
        const responseData = response.data.data
        setProfile({
          ...profile,
          settings: responseData?.settings || {
            notifications: {
              email: preferencesForm.emailNotifications,
              push: preferencesForm.pushNotifications
            },
            preferences: {
              theme: preferencesForm.theme,
              timezone: preferencesForm.timezone
            }
          }
        } as any)
        
        // Immediately apply theme to DOM
        const htmlElement = document.documentElement
        if (preferencesForm.theme === 'dark') {
          htmlElement.classList.add('dark')
          localStorage.setItem('theme', 'dark')
        } else {
          htmlElement.classList.remove('dark')
          localStorage.setItem('theme', 'light')
        }
        
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
    <div className="space-y-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen p-6 rounded-lg">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#5E372E] dark:text-[#d4ac6f]">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your account and preferences</p>
        </div>
      </div>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-white font-medium transition-all ${
              toast.type === 'success' ? 'bg-green-500 dark:bg-green-600' : 'bg-red-500 dark:bg-red-600'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {profile && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <nav className="flex flex-col">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-6 py-4 text-left font-medium transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-[#c79a63] dark:bg-[#a0794a] text-white border-l-4 border-[#5E372E]'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  👤 Profile
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`px-6 py-4 text-left font-medium transition-colors border-t border-gray-200 dark:border-gray-700 ${
                    activeTab === 'password'
                      ? 'bg-[#c79a63] dark:bg-[#a0794a] text-white border-l-4 border-[#5E372E]'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  🔐 Password
                </button>
                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`px-6 py-4 text-left font-medium transition-colors border-t border-gray-200 dark:border-gray-700 ${
                    activeTab === 'preferences'
                      ? 'bg-[#c79a63] dark:bg-[#a0794a] text-white border-l-4 border-[#5E372E]'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
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
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[#5E372E] dark:text-[#d4a574] mb-4">Profile Information</h2>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          title="Full Name"
                          placeholder="Enter your full name"
                          value={profileForm.name}
                          onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#c79a63] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          title="Email (Cannot be changed)"
                          placeholder="Email"
                          value={profileForm.email}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          title="Phone"
                          placeholder="Enter your phone number"
                          value={profileForm.phone}
                          onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#c79a63] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Department
                        </label>
                        <input
                          type="text"
                          title="Department (Assigned by admin)"
                          placeholder="Department"
                          value={profileForm.department}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Department is assigned by admin</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={profileUpdating}
                        onClick={() => console.log('🖱️ Save Changes button clicked')}
                        className="px-6 py-2 bg-[#c79a63] text-white rounded-lg hover:bg-[#b8885a] dark:bg-[#a0794a] dark:hover:bg-[#8f6a3b] disabled:opacity-50 font-medium transition-colors"
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
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[#5E372E] dark:text-[#d4a574] mb-4">Change Password</h2>
                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        placeholder="Enter your current password"
                        title="Current Password"
                        value={passwordForm.currentPassword}
                        onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#c79a63] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        placeholder="Enter your new password (min 6 characters)"
                        title="New Password"
                        value={passwordForm.newPassword}
                        onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#c79a63] focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">At least 6 characters</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        placeholder="Confirm your new password"
                        title="Confirm Password"
                        value={passwordForm.confirmPassword}
                        onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#c79a63] focus:border-transparent"
                      />
                    </div>
                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={passwordUpdating}
                        className="px-6 py-2 bg-[#c79a63] text-white rounded-lg hover:bg-[#b8885a] dark:bg-[#a0794a] dark:hover:bg-[#8f6a3b] disabled:opacity-50 font-medium transition-colors"
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
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[#5E372E] dark:text-[#d4a574] mb-4">Preferences</h2>
                  <form onSubmit={handleUpdatePreferences} className="space-y-6">
                    {/* Regional Settings */}
                    <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Regional Settings</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Theme
                          </label>
                          <select
                            title="Select theme"
                            value={preferencesForm.theme}
                            onChange={e => setPreferencesForm({ ...preferencesForm, theme: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#c79a63] focus:border-transparent"
                          >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Timezone
                          </label>
                        <select
                          title="Select timezone"
                          value={preferencesForm.timezone}
                          onChange={e => setPreferencesForm({ ...preferencesForm, timezone: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#c79a63] focus:border-transparent"
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
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Notifications</h3>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferencesForm.emailNotifications}
                            onChange={e => setPreferencesForm({ ...preferencesForm, emailNotifications: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 dark:accent-[#c79a63]"
                          />
                          <span className="text-gray-700 dark:text-gray-300">Email Notifications</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferencesForm.pushNotifications}
                            onChange={e => setPreferencesForm({ ...preferencesForm, pushNotifications: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 dark:accent-[#c79a63]"
                          />
                          <span className="text-gray-700 dark:text-gray-300">Push Notifications</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        type="submit"
                        disabled={preferencesUpdating}
                        className="px-6 py-2 bg-[#c79a63] text-white rounded-lg hover:bg-[#b8885a] dark:bg-[#a0794a] dark:hover:bg-[#8f6a3b] disabled:opacity-50 font-medium transition-colors"
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
