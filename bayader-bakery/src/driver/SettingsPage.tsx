import React, { useState } from 'react'

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
    language: 'en' | 'ar'
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
      language: 'en',
      theme: 'light'
    }
  })

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
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError('Failed to save settings')
      console.error('Error:', err)
    }
  }

  return (
    <div className="bg-[#fffaf4] rounded-lg shadow-sm p-6 max-w-2xl">
      <h2 className="text-2xl font-semibold text-[#5E372E] mb-6">Driver Settings</h2>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
          Settings saved successfully!
        </div>
      )}

      <div className="space-y-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-[#5E372E] mb-4">Profile</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#6b4f45] mb-1">Full Name</label>
              <input
                type="text"
                value={settings.profile.name}
                onChange={e => updateSetting('profile', 'name', e.target.value)}
                className="w-full border border-[#f3e7d9] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5E372E]"
                aria-label="Full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6b4f45] mb-1">Phone</label>
              <input
                type="tel"
                value={settings.profile.phone}
                onChange={e => updateSetting('profile', 'phone', e.target.value)}
                className="w-full border border-[#f3e7d9] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5E372E]"
                aria-label="Phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6b4f45] mb-1">Vehicle</label>
              <input
                type="text"
                value={settings.profile.vehicle}
                onChange={e => updateSetting('profile', 'vehicle', e.target.value)}
                placeholder="e.g., Toyota Hiace - White"
                className="w-full border border-[#f3e7d9] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5E372E]"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-[#5E372E] mb-4">Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#6b4f45]">Order Updates</p>
                <p className="text-xs text-[#8b6f63]">Get notified about new orders</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.orderUpdates}
                  onChange={e => updateSetting('notifications', 'orderUpdates', e.target.checked)}
                  className="sr-only peer"
                  aria-label="Toggle order updates notifications"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5E372E]"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#6b4f45]">Delivery Alerts</p>
                <p className="text-xs text-[#8b6f63]">Alerts for delivery instructions</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.deliveryAlerts}
                  onChange={e => updateSetting('notifications', 'deliveryAlerts', e.target.checked)}
                  className="sr-only peer"
                  aria-label="Toggle delivery alerts notifications"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5E372E]"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#6b4f45]">Push Notifications</p>
                <p className="text-xs text-[#8b6f63]">Mobile push notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications.push}
                  onChange={e => updateSetting('notifications', 'push', e.target.checked)}
                  className="sr-only peer"
                  aria-label="Toggle push notifications"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5E372E]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-[#5E372E] mb-4">Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#6b4f45] mb-1">Language</label>
              <select
                value={settings.preferences.language}
                onChange={e => updateSetting('preferences', 'language', e.target.value as 'en' | 'ar')}
                className="w-full border border-[#f3e7d9] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5E372E]"
                aria-label="Select language preference"
              >
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6b4f45] mb-1">Theme</label>
              <select
                value={settings.preferences.theme}
                onChange={e => updateSetting('preferences', 'theme', e.target.value as 'light' | 'dark')}
                className="w-full border border-[#f3e7d9] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5E372E]"
                aria-label="Select theme preference"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleSaveSettings}
            className="px-6 py-2 bg-[#5E372E] text-white rounded-md hover:bg-[#6b453f] transition-colors font-medium"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage

