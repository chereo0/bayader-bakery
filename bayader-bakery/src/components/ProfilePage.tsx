import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Button from './ui/Button'

export default function ProfilePage() {
  const { user, isAuthenticated, updateProfile, logout } = useAuth()
  const navigate = useNavigate()

  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Initialize form with user data
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      })
    }
  }, [user, isAuthenticated, navigate])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const updatedData = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
      }

      await updateProfile(updatedData)
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setIsEditing(false)

      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update profile'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      setLoading(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters' })
      setLoading(false)
      return
    }

    try {
      await updateProfile({
        password: passwordData.newPassword
      })
      
      setMessage({ type: 'success', text: 'Password changed successfully!' })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setIsChangingPassword(false)

      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to change password'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
      navigate('/')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-bakery-700 mb-4">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8] py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display text-bakery-900 mb-2">My Profile</h1>
          <p className="text-bakery-700">Manage your account information and preferences</p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`rounded-lg p-4 mb-6 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <p className="font-medium">{message.text}</p>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          {/* Profile Header */}
          <div className="bg-bakery-900 text-white p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-bakery-700 rounded-full flex items-center justify-center text-2xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-bakery-100">{user.email}</p>
                <p className="text-xs text-bakery-200 mt-1 capitalize">Role: {user.role}</p>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            {/* View Mode */}
            {!isEditing && !isChangingPassword && (
              <div>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-sm font-semibold text-bakery-600">Full Name</label>
                    <p className="text-bakery-900 mt-1">{user.name}</p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-bakery-600">Email Address</label>
                    <p className="text-bakery-900 mt-1">{user.email}</p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-bakery-600">Phone Number</label>
                    <p className="text-bakery-900 mt-1">{user.phone || 'Not provided'}</p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-bakery-600">Address</label>
                    <p className="text-bakery-900 mt-1">{user.address || 'Not provided'}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 flex-wrap">
                  <Button onClick={() => setIsEditing(true)}>
                    ✏️ Edit Profile
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setIsChangingPassword(true)}
                  >
                    🔐 Change Password
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700"
                  >
                    🚪 Logout
                  </Button>
                </div>
              </div>
            )}

            {/* Edit Mode */}
            {isEditing && (
              <form onSubmit={handleUpdateProfile}>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-bakery-600 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-bakery-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bakery-700"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-bakery-600 mb-2">
                      Email Address (Cannot be changed)
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full px-4 py-2 border border-bakery-200 rounded-lg bg-bakery-50 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-bakery-600 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g., +1 (555) 000-0000"
                      className="w-full px-4 py-2 border border-bakery-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bakery-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-bakery-600 mb-2">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Your delivery address"
                      rows={4}
                      className="w-full px-4 py-2 border border-bakery-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bakery-700"
                    />
                  </div>
                </div>

                {/* Save/Cancel Buttons */}
                <div className="flex gap-3">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : '💾 Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {/* Change Password Mode */}
            {isChangingPassword && (
              <form onSubmit={handleChangePassword}>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-bakery-600 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password (min 6 characters)"
                      className="w-full px-4 py-2 border border-bakery-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bakery-700"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-bakery-600 mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-2 border border-bakery-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bakery-700"
                      required
                    />
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="bg-bakery-50 p-4 rounded-lg mb-6">
                  <p className="text-sm font-semibold text-bakery-600 mb-2">Password Requirements:</p>
                  <ul className="text-sm text-bakery-700 space-y-1">
                    <li>✓ Minimum 6 characters</li>
                    <li>✓ Passwords must match</li>
                  </ul>
                </div>

                {/* Submit/Cancel Buttons */}
                <div className="flex gap-3">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Updating...' : '🔐 Update Password'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsChangingPassword(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-bakery-900 mb-4">Account Information</h3>
          <div className="space-y-3 text-sm text-bakery-700">
            <div className="flex justify-between">
              <span>Account Type:</span>
              <span className="font-medium text-bakery-900 capitalize">{user.role}</span>
            </div>
            <div className="flex justify-between">
              <span>Member Since:</span>
              <span className="font-medium text-bakery-900">
                {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <div className="border-t border-bakery-200 pt-3 mt-3">
              <p className="text-xs text-bakery-600">
                Need help? <a href="/contact" className="text-bakery-900 font-semibold hover:underline">Contact us</a>
              </p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition cursor-pointer"
               onClick={() => navigate('/orders')}>
            <p className="text-3xl mb-2">📦</p>
            <h4 className="font-semibold text-bakery-900 mb-1">My Orders</h4>
            <p className="text-sm text-bakery-600">View and track your orders</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition cursor-pointer"
               onClick={() => navigate('/products')}>
            <p className="text-3xl mb-2">🍰</p>
            <h4 className="font-semibold text-bakery-900 mb-1">Browse Products</h4>
            <p className="text-sm text-bakery-600">Continue shopping</p>
          </div>
        </div>
      </div>
    </div>
  )
}
