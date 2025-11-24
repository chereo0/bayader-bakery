import axios, { AxiosInstance, AxiosError } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export interface Delivery {
  _id: string
  id?: string
  orderId?: string
  order: {
    _id: string
    totalAmount: number
    status: string
  }
  driver?: {
    _id: string
    name: string
    email: string
    phone: string
  }
  deliveryAddress: string
  status: 'pending' | 'assigned' | 'picked' | 'in-transit' | 'delivered' | 'failed'
  estimatedDeliveryDate: string
  actualDeliveryDate?: string
  latitude?: number
  longitude?: number
  attempts?: number
  failureReason?: string
  createdAt: string
  updatedAt: string
}

export interface DeliveryResponse {
  success: boolean
  data: Delivery | Delivery[] | {
    deliveries: Delivery[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
  message?: string
}

class DeliveryService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/deliveries`,
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
   * Get driver's assigned deliveries
   */
  async getMyDeliveries(page = 1, limit = 20): Promise<Delivery[]> {
    try {
      const response = await this.api.get<DeliveryResponse>('/my', {
        params: { page, limit },
      })
      
      if (Array.isArray(response.data.data)) {
        return response.data.data
      }
      
      if ('deliveries' in response.data.data) {
        return response.data.data.deliveries
      }
      
      return []
    } catch (error) {
      console.error('Failed to fetch my deliveries:', error)
      throw error
    }
  }

  /**
   * Get delivery by ID
   */
  async getDeliveryById(id: string): Promise<Delivery> {
    try {
      const response = await this.api.get<DeliveryResponse>(`/${id}`)
      return response.data.data as Delivery
    } catch (error) {
      console.error(`Failed to fetch delivery ${id}:`, error)
      throw error
    }
  }

  /**
   * Update delivery status
   */
  async updateDeliveryStatus(
    id: string,
    status: Delivery['status'],
    options?: {
      latitude?: number
      longitude?: number
      failureReason?: string
    }
  ): Promise<Delivery> {
    try {
      const response = await this.api.patch<DeliveryResponse>(`/${id}/status`, {
        status,
        ...options,
      })
      return response.data.data as Delivery
    } catch (error) {
      console.error(`Failed to update delivery ${id}:`, error)
      throw error
    }
  }

  /**
   * Get all deliveries (admin only)
   */
  async getAllDeliveries(
    page = 1,
    limit = 20,
    filters?: {
      status?: string
      driverId?: string
    }
  ): Promise<{ deliveries: Delivery[]; pagination: any }> {
    try {
      const response = await this.api.get<DeliveryResponse>('/', {
        params: { page, limit, ...filters },
      })
      
      if ('deliveries' in response.data.data) {
        return response.data.data
      }
      
      return {
        deliveries: Array.isArray(response.data.data) ? response.data.data : [],
        pagination: { page, limit, total: 0, pages: 0 },
      }
    } catch (error) {
      console.error('Failed to fetch deliveries:', error)
      throw error
    }
  }

  /**
   * Assign driver to delivery (admin only)
   */
  async assignDriver(id: string, driverId: string): Promise<Delivery> {
    try {
      const response = await this.api.patch<DeliveryResponse>(`/${id}/assign`, {
        driverId,
      })
      return response.data.data as Delivery
    } catch (error) {
      console.error(`Failed to assign driver:`, error)
      throw error
    }
  }
}

export default new DeliveryService()
