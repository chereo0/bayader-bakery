export interface Delivery {
  id: string
  orderId: string
  customerName: string
  address: string
  status: 'pending' | 'picked' | 'on-way' | 'delivered'
  phone?: string
  notes?: string
}

export const deliveries: Delivery[] = [
  { id: '1', orderId: '#505', customerName: 'Sarah L', address: '456 Oak Ave, Riyadh', status: 'picked', phone: '+966 50 123 4567' },
  { id: '2', orderId: '#506', customerName: 'Ahmed K', address: '789 King Fahd Rd, Riyadh', status: 'pending', phone: '+966 50 234 5678' },
  { id: '3', orderId: '#507', customerName: 'Fatima M', address: '123 Prince St, Riyadh', status: 'on-way', phone: '+966 50 345 6789' },
  { id: '4', orderId: '#508', customerName: 'Omar S', address: '321 Al Olaya, Riyadh', status: 'pending', phone: '+966 50 456 7890' },
  { id: '5', orderId: '#509', customerName: 'Layla R', address: '654 King Abdulaziz Rd, Riyadh', status: 'on-way', phone: '+966 50 567 8901' },
  { id: '6', orderId: '#510', customerName: 'Hassan A', address: '987 Tahlia St, Riyadh', status: 'picked', phone: '+966 50 678 9012' },
  { id: '7', orderId: '#511', customerName: 'Noor B', address: '147 University Rd, Riyadh', status: 'delivered', phone: '+966 50 789 0123' },
  { id: '8', orderId: '#512', customerName: 'Yusuf C', address: '258 Ring Rd, Riyadh', status: 'delivered', phone: '+966 50 890 1234' },
]

export const summaryStats = {
  totalDeliveries: 8,
  awaitingPickup: 2,
  currentlyDelivering: 3,
}

