import axios, { AxiosInstance, AxiosError } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export interface Message {
  _id: string
  from: {
    _id: string
    name: string
    email: string
    role: string
  }
  subject: string
  body: string
  read: boolean
  type: 'system' | 'admin' | 'customer'
  createdAt: string
  updatedAt: string
  recipientId?: string
  senderId?: string
}

export interface MessageResponse {
  success: boolean
  data: Message | Message[]
  message?: string
}

class MessageService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/messages`,
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
   * Get all messages for the current user
   */
  async getMessages(archived = false, page = 1, limit = 20): Promise<Message[]> {
    try {
      // Use conversations endpoint so archived filter is respected (sender OR receiver)
      const response = await this.api.get<MessageResponse>('/conversations/all', {
        params: { archived: archived.toString(), page, limit },
      })

      if (Array.isArray(response.data.data)) {
        return response.data.data
      }

      return []
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      throw error
    }
  }

  /**
   * Get unread messages count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await this.api.get<any>('/unread/count')
      return response.data.data?.count || 0
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
      return 0
    }
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string): Promise<Message> {
    try {
      const response = await this.api.patch<MessageResponse>(`/${messageId}/read`)
      return response.data.data as Message
    } catch (error) {
      console.error(`Failed to mark message ${messageId} as read:`, error)
      throw error
    }
  }

  /**
   * Mark all messages as read
   */
  async markAllAsRead(): Promise<any> {
    try {
      const response = await this.api.patch<any>('/read-all')
      return response.data
    } catch (error) {
      console.error('Failed to mark all messages as read:', error)
      throw error
    }
  }

  /**
   * Send a new message
   */
  async sendMessage(recipientId: string, subject: string, body: string): Promise<Message> {
    try {
      // Backend expects { to, subject, message, type }
      const response = await this.api.post<MessageResponse>('/', {
        to: recipientId,
        subject,
        message: body,
        type: 'driver'
      })
      return response.data.data as Message
    } catch (error) {
      console.error('Failed to send message:', error)
      throw error
    }
  }

  /**
   * Delete a message (archives it)
   */
  async deleteMessage(messageId: string): Promise<any> {
    try {
      const response = await this.api.delete(`/${messageId}`)
      return response.data
    } catch (error) {
      console.error(`Failed to delete message ${messageId}:`, error)
      throw error
    }
  }

  /**
   * Archive a message
   */
  async archiveMessage(messageId: string): Promise<any> {
    try {
      const response = await this.api.delete(`/${messageId}`)
      return response.data
    } catch (error) {
      console.error(`Failed to archive message ${messageId}:`, error)
      throw error
    }
  }

  /**
   * Unarchive a message
   */
  async unarchiveMessage(messageId: string): Promise<any> {
    try {
      const response = await this.api.patch(`/${messageId}/unarchive`)
      return response.data
    } catch (error) {
      console.error(`Failed to unarchive message ${messageId}:`, error)
      throw error
    }
  }

  /**
   * Get message by ID
   */
  async getMessageById(messageId: string): Promise<Message> {
    try {
      const response = await this.api.get<MessageResponse>(`/${messageId}`)
      return response.data.data as Message
    } catch (error) {
      console.error(`Failed to fetch message ${messageId}:`, error)
      throw error
    }
  }

  /**
   * Format message timestamp
   */
  formatTime(timestamp: string): string {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }
}

export default new MessageService()
