import type { EventItem } from './data'

const KEY = 'bayader_events'

export function loadEvents(): EventItem[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    return JSON.parse(raw) as EventItem[]
  } catch {
    return []
  }
}

export function saveEvents(items: EventItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items))
}
