import React from 'react'
import { WheatIcon, ShoppingCartIcon, UserCircleIcon } from '../components/ui/Icon'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

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

const OrdersIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M9 2H3v20h18V8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13 2v6h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 12h10M7 16h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const DeliveryIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M5 13v6h14v-6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="8" cy="20" r="1.5" stroke="currentColor" strokeWidth="1.2" />
    <circle cx="16" cy="20" r="1.5" stroke="currentColor" strokeWidth="1.2" />
    <path d="M13 13V7L5 3H2v10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const Sidebar: React.FC<Props> = ({ selected = 'Dashboard', onSelect }) => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  // Removed Feedback and Promotions per request
  const items: Item[] = [
    { key: 'Dashboard', label: 'Dashboard' },
    { key: 'Products', label: 'Products' },
    { key: 'Analytics', label: 'Analytics' },
    { key: 'Orders', label: 'Orders' },
    { key: 'Deliveries', label: 'Deliveries' },
    { key: 'Users', label: 'Users' },
    { key: 'Events', label: 'Events' },
    { key: 'Inventory', label: 'Inventory' }
  ]

  const renderIcon = (key: string) => {
    switch (key) {
      case 'Dashboard': return <WheatIcon className="h-5 w-5" />
      case 'Products': return <ShoppingCartIcon className="h-5 w-5" />
      case 'Analytics': return <ChartIcon />
      case 'Orders': return <OrdersIcon />
      case 'Deliveries': return <DeliveryIcon />
      case 'Users': return <UserCircleIcon className="h-5 w-5" />
      case 'Events': return <EventsIcon />
      case 'Inventory': return <InventoryIcon />
      default: return <span className="w-5 h-5" />
    }
  }

  return (
    <aside className="w-64 bg-[#5E372E] text-white min-h-screen hidden md:block">
      <div className="flex flex-col justify-between h-full">
        <div>
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
        </div>

        <div className="p-4 border-t border-t-[#6f453f]">
          <button
            onClick={() => { logout(); navigate('/', { replace: true }); }}
            className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-[#6b453f]"
          >
            <span className="w-6 h-6 text-[#f3e9e5] flex items-center justify-center">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M16 17l5-5m0 0l-5-5m5 5H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 7v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
