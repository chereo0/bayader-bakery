import axios, { AxiosInstance, AxiosError } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export interface OrderItem {
  product: string
  name: string
  price: number
  quantity: number
  image?: string
}

export interface DeliveryAddress {
  line1: string
  line2?: string
  city: string
  postalCode?: string
  country: string
  phone: string
}

export interface DriverOrder {
  _id: string
  orderNumber: string
  user?: {
    _id: string
    name: string
    phone: string
    email: string
  }
  items: OrderItem[]
  totalAmount: number
  status: 'pending' | 'active' | 'shipped' | 'delivered'
  deliveryStatus: 'pending' | 'assigned' | 'in-transit' | 'delivered' | 'failed'
  assignmentStatus?: 'pending' | 'accepted' | 'rejected'
  deliveryAddress?: DeliveryAddress
  estimatedDeliveryDate?: string
  actualDeliveryDate?: string
  createdAt: string
  updatedAt: string
  assignedDriver?: string
  payment?: {
    method: string
    paid: boolean
  }
}

export interface OrderResponse {
  success: boolean
  data: DriverOrder | DriverOrder[] | {
    orders: DriverOrder[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
  message?: string
}

class OrderService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/orders`,
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
   * Get driver's assigned orders
   */
  async getMyOrders(page = 1, limit = 20, deliveryStatus?: string): Promise<DriverOrder[]> {
    try {
      const params: any = { page, limit }
      if (deliveryStatus) {
        params.deliveryStatus = deliveryStatus
      }

      const response = await this.api.get<OrderResponse>('/driver/my-orders', { params })

      if (Array.isArray(response.data.data)) {
        return response.data.data
      }

      if ('orders' in response.data.data) {
        return response.data.data.orders
      }

      return []
    } catch (error) {
      console.error('Failed to fetch my orders:', error)
      throw error
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(id: string): Promise<DriverOrder> {
    try {
      const response = await this.api.get<OrderResponse>(`/${id}`)
      return response.data.data as DriverOrder
    } catch (error) {
      console.error(`Failed to fetch order ${id}:`, error)
      throw error
    }
  }

  /**
   * Update delivery status for an order
   */
  async updateDeliveryStatus(
    orderId: string,
    deliveryStatus: 'in-transit' | 'delivered' | 'failed',
    actualDeliveryDate?: Date
  ): Promise<DriverOrder> {
    try {
      const payload: any = { deliveryStatus }
      if (actualDeliveryDate) {
        payload.actualDeliveryDate = actualDeliveryDate.toISOString()
      }

      const response = await this.api.patch<OrderResponse>(
        `/${orderId}/delivery-status`,
        payload
      )
      return response.data.data as DriverOrder
    } catch (error) {
      console.error(`Failed to update delivery status for order ${orderId}:`, error)
      throw error
    }
  }

  /**
   * Get delivery statistics for driver
   */
  async getDeliveryStats(): Promise<{
    total: number
    pending: number
    assigned: number
    inTransit: number
    delivered: number
    failed: number
  }> {
    try {
      // Fetch all orders and calculate stats
      const orders = await this.getMyOrders(1, 1000)

      const stats = {
        total: orders.length,
        pending: orders.filter(o => o.deliveryStatus === 'pending').length,
        assigned: orders.filter(o => o.deliveryStatus === 'assigned').length,
        inTransit: orders.filter(o => o.deliveryStatus === 'in-transit').length,
        delivered: orders.filter(o => o.deliveryStatus === 'delivered').length,
        failed: orders.filter(o => o.deliveryStatus === 'failed').length,
      }

      return stats
    } catch (error) {
      console.error('Failed to fetch delivery stats:', error)
      throw error
    }
  }

  /**
   * Format delivery address for display
   */
  formatAddress(address?: DeliveryAddress | null): string {
    if (!address) return 'Pickup Order'

    const parts = []
    if (address.line1) parts.push(address.line1)
    if (address.line2) parts.push(address.line2)
    if (address.city) parts.push(address.city)
    if (address.postalCode) parts.push(address.postalCode)
    if (address.country) parts.push(address.country)

    return parts.length > 0 ? parts.join(', ') : 'No address provided'
  }

  /**
   * Get display name for delivery status
   */
  getDeliveryStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'pending': 'Pending Pickup',
      'assigned': 'Assigned',
      'in-transit': 'In Transit',
      'delivered': 'Delivered',
      'failed': 'Failed',
    }
    return labels[status] || status
  }

  /**
   * Get color/badge class for delivery status
   */
  getDeliveryStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'assigned': 'bg-blue-100 text-blue-800',
      'in-transit': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800',
    }
    return classes[status] || 'bg-gray-100 text-gray-800'
  }

  /**
   * Accept order assignment (Phase 1)
   */
  async acceptOrder(orderId: string): Promise<DriverOrder> {
    try {
      const response = await this.api.post<OrderResponse>(`/${orderId}/accept`)
      return response.data.data as DriverOrder
    } catch (error) {
      console.error(`Failed to accept order ${orderId}:`, error)
      throw error
    }
  }

  /**
   * Reject order assignment (Phase 1)
   */
  async rejectOrder(orderId: string, reason: string): Promise<DriverOrder> {
    try {
      if (!reason || reason.trim().length < 5) {
        throw new Error('Rejection reason must be at least 5 characters')
      }

      const response = await this.api.post<OrderResponse>(`/${orderId}/reject`, {
        reason: reason.trim()
      })
      return response.data.data as DriverOrder
    } catch (error) {
      console.error(`Failed to reject order ${orderId}:`, error)
      throw error
    }
  }

  /**
   * Report delivery issue (Phase 1)
   */
  async reportIssue(
    orderId: string,
    issueType: string,
    description: string,
    latitude?: number,
    longitude?: number
  ): Promise<any> {
    try {
      if (!description || description.trim().length < 10) {
        throw new Error('Issue description must be at least 10 characters')
      }

      const payload: any = {
        issueType,
        description: description.trim()
      }

      if (latitude !== undefined && longitude !== undefined) {
        payload.latitude = latitude
        payload.longitude = longitude
      }

      const response = await this.api.post(`/${orderId}/report-issue`, payload)
      return response.data.data
    } catch (error) {
      console.error(`Failed to report issue for order ${orderId}:`, error)
      throw error
    }
  }
}

export default new OrderService()
