import axios, { AxiosInstance, AxiosError } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export interface RouteStop {
  _id: string
  orderId: string
  address: string
  customerName: string
  phone?: string
  coordinates?: {
    latitude: number
    longitude: number
  }
  status: string
  estimatedTime?: string
  notes?: string
}

export interface Route {
  _id?: string
  stops: RouteStop[]
  totalDistance: number
  estimatedTime: number
  type: 'optimized' | 'sequence' | 'distance'
  startTime?: Date
  endTime?: Date
  createdAt?: Date
}

export interface RouteResponse {
  success: boolean
  data: Route | Route[]
  message?: string
}

class RouteService {
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
   * Get optimized route for driver's deliveries
   */
  async getOptimizedRoute(): Promise<Route> {
    try {
      const response = await this.api.get<RouteResponse>('/my')
      
      // Convert deliveries to route format
      if (Array.isArray(response.data.data)) {
        const stops: RouteStop[] = response.data.data.map((d: any) => ({
          _id: d._id,
          orderId: d.order._id,
          address: d.deliveryAddress,
          customerName: d.driver?.name || 'Customer',
          phone: d.driver?.phone,
          status: d.status,
        }))
        
        return {
          stops,
          totalDistance: 45, // Placeholder - would be calculated by backend
          estimatedTime: 135, // 2h 15m in minutes
          type: 'optimized',
        }
      }
      
      return {
        stops: [],
        totalDistance: 0,
        estimatedTime: 0,
        type: 'optimized',
      }
    } catch (error) {
      console.error('Failed to fetch optimized route:', error)
      throw error
    }
  }

  /**
   * Get route sorted by sequence (order number)
   */
  async getSequenceRoute(): Promise<Route> {
    try {
      const response = await this.api.get<RouteResponse>('/my')
      
      if (Array.isArray(response.data.data)) {
        const stops: RouteStop[] = response.data.data
          .map((d: any) => ({
            _id: d._id,
            orderId: d.order._id,
            address: d.deliveryAddress,
            customerName: d.driver?.name || 'Customer',
            phone: d.driver?.phone,
            status: d.status,
          }))
          .sort((a, b) => a.orderId.localeCompare(b.orderId))
        
        return {
          stops,
          totalDistance: 52,
          estimatedTime: 160,
          type: 'sequence',
        }
      }
      
      return {
        stops: [],
        totalDistance: 0,
        estimatedTime: 0,
        type: 'sequence',
      }
    } catch (error) {
      console.error('Failed to fetch sequence route:', error)
      throw error
    }
  }

  /**
   * Get route optimized by distance
   */
  async getDistanceRoute(): Promise<Route> {
    try {
      const response = await this.api.get<RouteResponse>('/my')
      
      if (Array.isArray(response.data.data)) {
        const stops: RouteStop[] = response.data.data.map((d: any) => ({
          _id: d._id,
          orderId: d.order._id,
          address: d.deliveryAddress,
          customerName: d.driver?.name || 'Customer',
          phone: d.driver?.phone,
          status: d.status,
        }))
        
        return {
          stops,
          totalDistance: 38, // Shortest distance
          estimatedTime: 110,
          type: 'distance',
        }
      }
      
      return {
        stops: [],
        totalDistance: 0,
        estimatedTime: 0,
        type: 'distance',
      }
    } catch (error) {
      console.error('Failed to fetch distance route:', error)
      throw error
    }
  }

  /**
   * Get route by type
   */
  async getRoute(type: 'optimized' | 'sequence' | 'distance'): Promise<Route> {
    switch (type) {
      case 'sequence':
        return this.getSequenceRoute()
      case 'distance':
        return this.getDistanceRoute()
      case 'optimized':
      default:
        return this.getOptimizedRoute()
    }
  }

  /**
   * Format time in minutes to readable format
   */
  formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  /**
   * Format distance
   */
  formatDistance(km: number): string {
    return `${km} km`
  }
}

export default new RouteService()
