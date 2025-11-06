export interface Customer {
  id: number
  name: string
  email: string
  phone?: string
  totalOrders: number
  totalValue: number
  lastOrderDate?: string
  status: 'Active' | 'Inactive' | 'Pending'
}

const users: Customer[] = [
  { id: 1, name: 'Alice Smith', email: 'alice@example.com', phone: '555-1234', totalOrders: 5, totalValue: 125.5, lastOrderDate: '2025-10-20', status: 'Active' },
  { id: 2, name: 'Bob Johnson', email: 'bob@example.com', phone: '555-2345', totalOrders: 2, totalValue: 45.0, lastOrderDate: '2025-10-18', status: 'Inactive' },
  { id: 3, name: 'Catherine Lee', email: 'catherine@example.com', phone: '555-3456', totalOrders: 8, totalValue: 220.75, lastOrderDate: '2025-10-22', status: 'Active' },
  { id: 4, name: 'Daniel Gomez', email: 'daniel@example.com', phone: '555-4567', totalOrders: 1, totalValue: 12.0, lastOrderDate: '2025-09-30', status: 'Pending' }
]

export default users
