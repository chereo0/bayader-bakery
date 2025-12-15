import React, { useState, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'

interface DriverSettings {
  profile: {
    name: string
    phone: string
    vehicle: string
  }
  notifications: {
    orderUpdates: boolean
    deliveryAlerts: boolean
    push: boolean
  }
  preferences: {
    theme: 'light' | 'dark'
  }
}

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<DriverSettings>({
    profile: {
      name: 'Ahmed Al-Rashid',
      phone: '+966501234567',
      vehicle: 'Toyota Hiace - White'
    },
    notifications: {
      orderUpdates: true,
      deliveryAlerts: true,
      push: true
    },
    preferences: {
      theme: localStorage.getItem('theme') as 'light' | 'dark' || 'light'
    }
  })

  // Apply theme changes to DOM and save to localStorage
  useEffect(() => {
    const htmlElement = document.documentElement
    if (settings.preferences.theme === 'dark') {
      htmlElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      htmlElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
    // Dispatch custom event to notify other components of theme change
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: settings.preferences.theme } }))
  }, [settings.preferences.theme])

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }))
    setSuccess(false)
  }

  const handleSaveSettings = () => {
    try {
      setSuccess(false)
      setError(null)
      // Simulate save
      setSuccess(true)
      toast.success('Settings saved successfully!')
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError('Failed to save settings')
      toast.error('Failed to save settings')
      console.error('Error:', err)
    }
  }

  return (
    <div className="bg-[#fffaf4] dark:bg-gray-900 rounded-lg shadow-sm p-6 max-w-2xl">
      <h2 className="text-2xl font-semibold text-[#5E372E] dark:text-[#d4a574] mb-6">Driver Settings</h2>

      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-200 px-4 py-3 rounded">
          Settings saved successfully!
        </div>
      )}

      <div className="space-y-6">
        {/* Profile Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-[#5E372E] dark:text-[#d4a574] mb-4">Profile</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
              <input
                type="text"
                value={settings.profile.name}
                onChange={e => updateSetting('profile', 'name', e.target.value)}
                title="Full name"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#5E372E] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
              <input
                type="tel"
                value={settings.profile.phone}
                onChange={e => updateSetting('profile', 'phone', e.target.value)}
                title="Phone number"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#5E372E] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vehicle</label>
              <input
                type="text"
                value={settings.profile.vehicle}
                onChange={e => updateSetting('profile', 'vehicle', e.target.value)}
                placeholder="e.g., Toyota Hiace - White"
                title="Vehicle information"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#5E372E] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-[#5E372E] dark:text-[#d4a574] mb-4">Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Order Updates</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Get notified about new orders</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.orderUpdates}
                  onChange={e => updateSetting('notifications', 'orderUpdates', e.target.checked)}
                  className="sr-only peer"
                  aria-label="Toggle order updates notifications"
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5E372E] dark:peer-checked:bg-[#d4a574]"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Delivery Alerts</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Alerts for delivery instructions</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.deliveryAlerts}
                  onChange={e => updateSetting('notifications', 'deliveryAlerts', e.target.checked)}
                  className="sr-only peer"
                  aria-label="Toggle delivery alerts notifications"
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5E372E] dark:peer-checked:bg-[#d4a574]"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Push Notifications</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Mobile push notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.push}
                  onChange={e => updateSetting('notifications', 'push', e.target.checked)}
                  className="sr-only peer"
                  aria-label="Toggle push notifications"
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5E372E] dark:peer-checked:bg-[#d4a574]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-[#5E372E] dark:text-[#d4a574] mb-4">Preferences</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme</label>
            <select
              value={settings.preferences.theme}
              onChange={e => updateSetting('preferences', 'theme', e.target.value as 'light' | 'dark')}
              title="Select theme"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#5E372E] focus:border-transparent"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleSaveSettings}
            className="px-6 py-2 bg-[#5E372E] dark:bg-[#a0794a] text-white rounded-lg hover:bg-[#6b453f] dark:hover:bg-[#8f6a3b] transition-colors font-medium"
          >
            Save Settings
          </button>
        </div>
      </div>

      {/* Toast Notifications */}
      <Toaster position="top-right" />
    </div>
  )
}

export default SettingsPage

