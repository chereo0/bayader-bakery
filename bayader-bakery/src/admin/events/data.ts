export type EventItem = {
  id: number
  title: string
  name: string
  date: string
  time?: string
  venue?: string
  price?: string
  theme?: string[]
}

const sampleEvent: EventItem = {
  id: 1,
  title: 'Bakery Tasting & Workshop',
  name: 'EL-Bayader Studio',
  date: '2025-11-15',
  time: '10:00 AM',
  venue: '123 Bakery Lane',
  price: '$25',
  theme: ['Tasting', 'Hands-on']
}

export default sampleEvent
