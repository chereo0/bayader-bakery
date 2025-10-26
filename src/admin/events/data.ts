export interface EventStaff {
  role: string
  quantityOrCost: string
  responsibilities: string
  paymentStatus: string
}

export interface EventItem {
  id: number
  title: string
  status: 'Active'|'Draft'|'Archived'
  name: string
  date: string
  time: string
  venue: string
  price: string
  staffing: EventStaff[]
  budgetNotes: string[]
  activities: string[]
  theme: string[]
}

const sampleEvent: EventItem = {
  id: 1,
  title: 'Wedding Showcase Event Plan',
  status: 'Active',
  name: 'The Grand Wedding Showcase',
  date: 'December 15, 2025',
  time: '4:00 PM - 1:00 AM',
  venue: 'Engaged couples, Sweet Delight Branch - Beirut',
  price: '$25 per person',
  staffing: [
    { role: 'Event Coordinator', quantityOrCost: '$600', responsibilities: 'In Progress', paymentStatus: 'Paid' },
    { role: 'Sweets & Cakes', quantityOrCost: '$400', responsibilities: 'Completed', paymentStatus: 'Paid' }
  ],
  budgetNotes: [
    'Venue rental: $1200',
    'Decor & flowers: $600',
    'Staffing & catering: $1000'
  ],
  activities: [
    'Guest arrival and rose bouquet presentation',
    'Showcase dessert tasting and vendor introductions'
  ],
  theme: [
    'Selected Colors: Gold, Cream, Rose Blush',
    'Setup notes: Tables with golden ribbons and rose centerpieces'
  ]
}

export default sampleEvent
