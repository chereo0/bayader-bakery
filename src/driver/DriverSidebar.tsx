import React from 'react'

type Item = { key: string; label: string; icon: React.ReactNode }

interface Props {
  selected?: string
  onSelect?: (key: string) => void
}

const HomeIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
)

const TruckIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6.75V16.5m-9.75-3H13.5m-3.75 3H7.5m.75-9V8.25m0 0V6a2.25 2.25 0 012.25-2.25h6a2.25 2.25 0 012.25 2.25v2.25M7.5 13.5h4.5m0 0H18v-1.5m-6 1.5v-6m-1.5 0H9m3.75 3v9m-4.5 0H12M15.75 16.5h3a2.25 2.25 0 002.25-2.25V9.75a2.25 2.25 0 00-2.25-2.25h-3M15.75 16.5V21m-9-4.5v-6m9 6v6m-9-4.5h6m-6 0H12" />
  </svg>
)

const MapPinIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
)

const MessageCircleIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
  </svg>
)

const SettingsIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941 1.11.941h2.594c.55 0 1.02-.398 1.11-.94l.213-1.281c.063-.374.313-.686.645-.87.074-.04.147-.083.22-.127.324-.196.72-.257 1.075-.124l1.217.456a1.125 1.125 0 001.37-.49l1.297-2.247a1.125 1.125 0 00-.26-1.431l-1.004-.827c-.292-.24-.438-.613-.43-.992a6.932 6.932 0 010-.255c-.007-.378.138-.75.43-.99l1.004-.828a1.125 1.125 0 00.26-1.43l-1.297-2.247a1.125 1.125 0 00-1.37-.491l-1.217.456c-.355.133-.75.072-1.076-.124a6.556 6.556 0 01-.22-.128c-.331-.183-.581-.495-.644-.869l-.214-1.281z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const DriverSidebar: React.FC<Props> = ({ selected = 'Dashboard', onSelect }) => {
  const items: Item[] = [
    { key: 'Dashboard', label: 'Dashboard', icon: <HomeIcon /> },
    { key: 'My Deliveries', label: 'My Deliveries', icon: <TruckIcon /> },
    { key: 'Route Planner', label: 'Route Planner', icon: <MapPinIcon /> },
    { key: 'Messages', label: 'Messages', icon: <MessageCircleIcon /> },
    { key: 'Settings', label: 'Settings', icon: <SettingsIcon /> },
  ]

  return (
    <aside className="w-64 bg-[#5E372E] text-white min-h-screen hidden md:block">
      <div className="p-6 border-b border-b-[#6f453f]">
        <h2 className="font-display text-2xl">EL-Bayader Driver</h2>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {items.map((it) => (
            <li key={it.key} className="group">
              <button
                onClick={() => onSelect && onSelect(it.key)}
                className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  selected === it.key
                    ? 'bg-gradient-to-r from-[#c79a63] to-[#d4ac6f] text-[#5E372E]'
                    : 'hover:bg-[#6b453f]'
                }`}
              >
                <span className={`w-6 h-6 flex items-center justify-center ${selected === it.key ? 'text-[#5E372E]' : 'text-[#f3e9e5]'}`}>
                  {it.icon}
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

export default DriverSidebar

