import axios, { AxiosInstance, AxiosError } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export interface OrderItem {
  product: string
  name: string
  price: number
  quantity: number
  image?: string
}

export interface Order {
  _id: string
  user: {
    _id: string
    name: string
    email: string
    phone?: string
  }
  items: OrderItem[]
  totalAmount: number
  status: 'pending' | 'active' | 'shipped' | 'delivered'
  deliveryAddress: {
    street?: string
    city: string
    phone: string
  }
  payment: {
    method: string
    paid: boolean
    transactionId?: string
  }
  createdAt: string
  updatedAt: string
}

export interface OrderResponse {
  success: boolean
  data: Order | Order[] | any
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface OrderStats {
  pending: number
  active: number
  shipped: number
  delivered: number
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
   * Get all orders with optional status filter and pagination
   */
  async getOrders(status?: string, page = 1, limit = 20): Promise<{ orders: Order[]; pagination: any }> {
    try {
      const params: any = { page, limit }
      if (status && status !== 'all') {
        params.status = status
      }

      const response = await this.api.get<OrderResponse>('/', { params })

      if (response.data.success && response.data.data.orders) {
        return {
          orders: response.data.data.orders,
          pagination: response.data.pagination,
        }
      }

      return { orders: [], pagination: {} }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      throw error
    }
  }

  /**
   * Get orders for staff dashboard with default filters
   */
  async getStaffOrders(status?: string, page = 1, limit = 20): Promise<{ orders: Order[]; pagination: any }> {
    try {
      const params: any = { page, limit }
      if (status && status !== 'all') {
        params.status = status
      }

      const response = await this.api.get<OrderResponse>('/staff/dashboard', { params })

      if (response.data.success) {
        return {
          orders: response.data.data,
          pagination: response.data.pagination,
        }
      }

      return { orders: [], pagination: {} }
    } catch (error) {
      console.error('Failed to fetch staff orders:', error)
      throw error
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string): Promise<Order> {
    try {
      const response = await this.api.get<OrderResponse>(`/${orderId}`)
      return response.data.data as Order
    } catch (error) {
      console.error(`Failed to fetch order ${orderId}:`, error)
      throw error
    }
  }

  /**
   * Update order status
   * Valid transitions:
   * - pending → active
   * - active → shipped
   * - shipped → delivered
   */
  async updateOrderStatus(orderId: string, newStatus: string): Promise<Order> {
    try {
      const response = await this.api.patch<OrderResponse>(`/${orderId}/status`, {
        status: newStatus,
      })

      if (response.data.success) {
        return response.data.data as Order
      }

      throw new Error(response.data.message || 'Failed to update order status')
    } catch (error: any) {
      console.error(`Failed to update order ${orderId} status:`, error)
      throw error
    }
  }

  /**
   * Get order statistics for staff dashboard
   */
  async getOrderStats(): Promise<OrderStats> {
    try {
      const response = await this.api.get<any>('/staff/stats')

      if (response.data.success && response.data.data) {
        return response.data.data as OrderStats
      }

      return { pending: 0, active: 0, shipped: 0, delivered: 0 }
    } catch (error) {
      console.error('Failed to fetch order statistics:', error)
      throw error
    }
  }

  /**
   * Format order date
   */
  formatDate(timestamp: string): string {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  /**
   * Format order date and time
   */
  formatDateTime(timestamp: string): string {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  /**
   * Get status badge color (for UI)
   */
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-blue-100 text-blue-800',
      shipped: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  /**
   * Get status label (for UI)
   */
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pending',
      active: 'Active (Preparing)',
      shipped: 'Shipped',
      delivered: 'Delivered',
    }
    return labels[status] || status
  }
}

export default new OrderService()
