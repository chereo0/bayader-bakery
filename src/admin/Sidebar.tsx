import React from 'react'
import { WheatIcon, ShoppingCartIcon, UserCircleIcon } from '../components/ui/Icon'

type Item = { key: string; label: string }

interface Props {
  selected?: string
  onSelect?: (key: string) => void
}

const ChartIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M3 3v18h18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 14v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 10v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M17 6v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const EventsIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.2" />
    <path d="M8 3v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M16 3v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
)

const InventoryIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M3 7h18v10H3z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    <path d="M7 7v-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M17 7v-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
)

const Sidebar: React.FC<Props> = ({ selected = 'Dashboard', onSelect }) => {
  // Removed Feedback and Promotions per request
  const items: Item[] = [
    { key: 'Dashboard', label: 'Dashboard' },
    { key: 'Products', label: 'Products' },
    { key: 'Analytics', label: 'Analytics' },
    { key: 'Users', label: 'Users' },
    { key: 'Events', label: 'Events' },
    { key: 'Inventory', label: 'Inventory' }
  ]

  const renderIcon = (key: string) => {
    switch (key) {
      case 'Dashboard': return <WheatIcon className="h-5 w-5" />
      case 'Products': return <ShoppingCartIcon className="h-5 w-5" />
      case 'Analytics': return <ChartIcon />
      case 'Users': return <UserCircleIcon className="h-5 w-5" />
      case 'Events': return <EventsIcon />
      case 'Inventory': return <InventoryIcon />
      default: return <span className="w-5 h-5" />
    }
  }

  return (
    <aside className="w-64 bg-[#5E372E] text-white min-h-screen hidden md:block">
      <div className="p-6 border-b border-b-[#6f453f]">
        <h2 className="font-display text-2xl">EL-Bayader Admin</h2>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {items.map((it) => (
            <li key={it.key} className="group">
              <button
                onClick={() => onSelect && onSelect(it.key)}
                className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${selected === it.key ? 'bg-[#6b453f]' : 'hover:bg-[#6b453f]'}`}
              >
                <span className="w-6 h-6 text-[#f3e9e5] flex items-center justify-center">
                  {renderIcon(it.key)}
                </span>
                <span className="font-medium">{it.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar
