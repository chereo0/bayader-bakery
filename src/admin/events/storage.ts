import { EventItem } from './data'

const KEY = 'sd_events'

export function loadEvents(): EventItem[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    return JSON.parse(raw) as EventItem[]
  } catch {
    return []
  }
}

export function saveEvents(events: EventItem[]) {
  localStorage.setItem(KEY, JSON.stringify(events))
}
