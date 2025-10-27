// Dummy data for Staff Dashboard

export interface Order {
  id: string
  timeDue: string
  customerName: string
  items: string
  status: 'pending' | 'preparing' | 'ready'
}

export interface ProductionItem {
  id: string
  name: string
  stage: string
  status: 'baking' | 'decorating' | 'ready'
  quantity: number
}

export interface Driver {
  id: string
  name: string
  status: 'available' | 'on-route'
  currentOrder?: string
}

export interface Notification {
  id: string
  type: 'alert' | 'info' | 'warning'
  message: string
  timestamp: string
}

export const pendingOrders: Order[] = [
  { id: '#501', timeDue: '14:30', customerName: 'Fatima Al', items: '2x Chocolate Cake, 1x Tiramisu', status: 'pending' },
  { id: '#502', timeDue: '15:00', customerName: 'Ahmed K.', items: '5x Cookies, 2x Croissants', status: 'pending' },
  { id: '#503', timeDue: '14:45', customerName: 'Sarah M.', items: '1x Wedding Cake, 10x Cupcakes', status: 'pending' },
  { id: '#504', timeDue: '16:00', customerName: 'Omar D.', items: '3x Danish Pastries', status: 'pending' },
  { id: '#505', timeDue: '15:30', customerName: 'Layla R.', items: '2x Cheesecake, 4x Muffins', status: 'pending' },
]

export const preparingOrders: Order[] = [
  { id: '#506', timeDue: '14:00', customerName: 'Hassan S.', items: '1x Birthday Cake', status: 'preparing' },
  { id: '#507', timeDue: '14:15', customerName: 'Noor A.', items: '2x Chocolate Cake', status: 'preparing' },
  { id: '#508', timeDue: '14:20', customerName: 'Yusuf M.', items: '3x Cookies Box', status: 'preparing' },
  { id: '#509', timeDue: '14:45', customerName: 'Amina K.', items: '1x Apple Pie', status: 'preparing' },
  { id: '#510', timeDue: '15:00', customerName: 'Bilal L.', items: '2x Brownies', status: 'preparing' },
]

export const readyOrders: Order[] = [
  { id: '#491', timeDue: '13:00', customerName: 'Khalid B.', items: '1x Tiramisu', status: 'ready' },
  { id: '#492', timeDue: '13:15', customerName: 'Maya H.', items: '5x Cookies', status: 'ready' },
  { id: '#493', timeDue: '13:30', customerName: 'Zain A.', items: '2x Chocolate Cake', status: 'ready' },
  { id: '#494', timeDue: '13:45', customerName: 'Samira D.', items: '1x Cheesecake', status: 'ready' },
  { id: '#495', timeDue: '14:00', customerName: 'Yara M.', items: '3x Croissants', status: 'ready' },
  { id: '#496', timeDue: '14:10', customerName: 'Tariq S.', items: '1x Apple Pie', status: 'ready' },
  { id: '#497', timeDue: '14:20', customerName: 'Lina K.', items: '2x Muffins', status: 'ready' },
]

export const productionQueue: ProductionItem[] = [
  { id: '1', name: 'Chocolate Cake', stage: 'Baking', status: 'baking', quantity: 8 },
  { id: '2', name: 'Vanilla Cake', stage: 'Decorating', status: 'decorating', quantity: 5 },
  { id: '3', name: 'Strawberry Cake', stage: 'Baking', status: 'baking', quantity: 6 },
  { id: '4', name: 'Cheesecake', stage: 'Ready', status: 'ready', quantity: 7 },
  { id: '5', name: 'Tiramisu', stage: 'Baking', status: 'baking', quantity: 4 },
  { id: '6', name: 'Apple Pie', stage: 'Ready', status: 'ready', quantity: 3 },
]

export const drivers: Driver[] = [
  { id: '1', name: 'Ahmed Hassan', status: 'on-route', currentOrder: '#504' },
  { id: '2', name: 'Fatima Ali', status: 'available' },
  { id: '3', name: 'Mahmoud Said', status: 'on-route', currentOrder: '#492' },
  { id: '4', name: 'Amira Mahmoud', status: 'available' },
]

export const notifications: Notification[] = [
  { id: '1', type: 'alert', message: 'Report Stock Shortage', timestamp: '10:30' },
  { id: '2', type: 'info', message: 'Order #503 canceled by customer', timestamp: '11:15' },
  { id: '3', type: 'warning', message: 'Low stock: Almond Flour', timestamp: '12:00' },
  { id: '4', type: 'alert', message: 'Order #501 needs urgent attention', timestamp: '13:45' },
]

export const summaryStats = {
  newOrders: 12,
  inProduction: 20,
  readyForDispatch: 3,
}

