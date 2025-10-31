import React, { useState } from 'react'

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    preferences: {
      language: 'en',
      theme: 'light',
      timezone: 'UTC+3'
    },
    profile: {
      name: 'Ahmed Hassan',
      email: 'ahmed.hassan@bayader.com',
      phone: '+966 50 123 4567',
      vehicle: 'Toyota Camry - ABC-1234'
    }
  })

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }))
  }

  return (
    <div className="bg-[#fffaf4] rounded-lg shadow-sm min-h-[600px] p-6">
      <h2 className="text-2xl font-semibold text-[#5E372E] mb-6">Driver Settings</h2>

      <div className="space-y-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-[#5E372E] mb-4">Profile Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#6b4f45] mb-1">Full Name</label>
              <input
                type="text"
                value={settings.profile.name}
                onChange={e => updateSetting('profile', 'name', e.target.value)}
                className="w-full border border-[#f3e7d9] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5E372E]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6b4f45] mb-1">Email</label>
              <input
                type="email"
                value={settings.profile.email}
                onChange={e => updateSetting('profile', 'email', e.target.value)}
                className="w-full border border-[#f3e7d9] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5E372E]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6b4f45] mb-1">Phone</label>
              <input
                type="tel"
                value={settings.profile.phone}
                onChange={e => updateSetting('profile', 'phone', e.target.value)}
                className="w-full border border-[#f3e7d9] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5E372E]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6b4f45] mb-1">Vehicle</label>
              <input
                type="text"
                value={settings.profile.vehicle}
                onChange={e => updateSetting('profile', 'vehicle', e.target.value)}
                className="w-full border border-[#f3e7d9] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5E372E]"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-[#5E372E] mb-4">Notification Preferences</h3>
          <div className="space-y-4">
            {Object.entries(settings.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-[#6b4f45] capitalize">{key} Notifications</label>
                  <p className="text-xs text-[#6b4f45]">Receive notifications via {key}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={e => updateSetting('notifications', key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5E372E]"></div>
                </label>
              </div>
            ))}
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
                onChange={e => updateSetting('preferences', 'language', e.target.value)}
                className="w-full border border-[#f3e7d9] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5E372E]"
              >
                <option value="en">English</option>
                <option value="ar">Arabic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6b4f45] mb-1">Timezone</label>
              <select
                value={settings.preferences.timezone}
                onChange={e => updateSetting('preferences', 'timezone', e.target.value)}
                className="w-full border border-[#f3e7d9] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5E372E]"
              >
                <option value="UTC+3">UTC+3 (Riyadh)</option>
                <option value="UTC+0">UTC+0 (London)</option>
                <option value="UTC-5">UTC-5 (New York)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="px-6 py-3 bg-[#5E372E] text-white rounded-md hover:bg-[#6b453f] transition-colors font-medium">
            Save All Settings
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage

