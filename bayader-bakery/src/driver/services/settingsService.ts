import axios, { AxiosInstance, AxiosError } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export interface DriverProfile {
  name: string
  email: string
  phone: string
  vehicle?: string
  licenseNumber?: string
  documentVerified?: boolean
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  sms: boolean
  inApp: boolean
  orderUpdates: boolean
  adminAlerts: boolean
}

export interface PreferenceSettings {
  language: 'en' | 'ar'
  theme: 'light' | 'dark'
  timezone: string
  autoOptimizeRoute: boolean
  showTrafficData: boolean
}

export interface UserSettings {
  profile: DriverProfile
  notifications: NotificationSettings
  preferences: PreferenceSettings
}

export interface SettingsResponse {
  success: boolean
  data: UserSettings
  message?: string
}

class SettingsService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/users`,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add auth token to requests
    this.api.interceptors.request.use(
      (config: any) => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error: AxiosError) => Promise.reject(error)
    )
  }

  /**
   * Get current user settings
   */
  async getSettings(): Promise<UserSettings> {
    try {
      const response = await this.api.get<SettingsResponse>('/me/settings')
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      throw error
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profile: DriverProfile): Promise<DriverProfile> {
    try {
      const response = await this.api.patch<any>('/me/profile', profile)
      return response.data.data.profile
    } catch (error) {
      console.error('Failed to update profile:', error)
      throw error
    }
  }

  /**
   * Update notification settings
   */
  async updateNotifications(notifications: NotificationSettings): Promise<NotificationSettings> {
    try {
      const response = await this.api.patch<any>('/me/notifications', { notifications })
      return response.data.data.notifications
    } catch (error) {
      console.error('Failed to update notifications:', error)
      throw error
    }
  }

  /**
   * Update preference settings
   */
  async updatePreferences(preferences: PreferenceSettings): Promise<PreferenceSettings> {
    try {
      const response = await this.api.patch<any>('/me/preferences', { preferences })
      return response.data.data.preferences
    } catch (error) {
      console.error('Failed to update preferences:', error)
      throw error
    }
  }

  /**
   * Update all settings at once
   */
  async updateAllSettings(settings: UserSettings): Promise<UserSettings> {
    try {
      const response = await this.api.patch<SettingsResponse>('/me/settings', settings)
      return response.data.data
    } catch (error) {
      console.error('Failed to update all settings:', error)
      throw error
    }
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<any> {
    try {
      const response = await this.api.post<any>('/me/change-password', {
        currentPassword,
        newPassword,
      })
      return response.data
    } catch (error) {
      console.error('Failed to change password:', error)
      throw error
    }
  }

  /**
   * Get user profile
   */
  async getProfile(): Promise<DriverProfile> {
    try {
      const response = await this.api.get<any>('/me')
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      throw error
    }
  }

  /**
   * Reset settings to default
   */
  async resetSettings(): Promise<UserSettings> {
    try {
      const response = await this.api.post<SettingsResponse>('/me/settings/reset')
      return response.data.data
    } catch (error) {
      console.error('Failed to reset settings:', error)
      throw error
    }
  }

  /**
   * Get available timezones
   */
  getTimezones(): string[] {
    return [
      'UTC+3 (Riyadh, Saudi Arabia)',
      'UTC+2 (Cairo, Egypt)',
      'UTC+1 (Lagos, Nigeria)',
      'UTC+0 (London, UK)',
      'UTC-5 (New York, USA)',
      'UTC-8 (Los Angeles, USA)',
    ]
  }

  /**
   * Get available languages
   */
  getLanguages(): Array<{ code: string; name: string }> {
    return [
      { code: 'en', name: 'English' },
      { code: 'ar', name: 'العربية' },
    ]
  }
}

export default new SettingsService()
