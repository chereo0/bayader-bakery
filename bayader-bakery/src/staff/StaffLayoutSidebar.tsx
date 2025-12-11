import React from 'react'

type Item = { key: string; label: string; icon: React.ReactNode }

interface Props {
  selected?: string
  onSelect?: (key: string) => void
}

const DashboardIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
)

const OrderIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .984.744 1.823 1.773 1.823h2.896A3 3 0 0015 9.75v.375c0 .984-.744 1.823-1.773 1.823H10.5c-1.029 0-1.773-.839-1.773-1.823V9.75m0 0C9 9.539 9.158 9 10.5 9m0 0h3.75m-3.75 0a1.5 1.5 0 01-1.5-1.5M15 19.5h-1.5a1.5 1.5 0 00-1.5 1.5m0 0h-3m0 0a1.5 1.5 0 00-1.5-1.5m1.5 1.5v.75m-1.5-1.5H4.5m0 0a1.5 1.5 0 01-1.5 1.5" />
  </svg>
)

const MessageIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
)

const EventIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0121 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
)

const MaterialIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
  </svg>
)

const SettingsIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.592c.55 0 1.02.398 1.11.94a29.26 29.26 0 001.823 6.355c.118.319-.406.719-.879.959-.282.16-.521.537-.497.91.025.37.304.643.604.643.372 0 .577-.038.577-.038a.5.5 0 00.438-.393c.11-.33.172-.704.172-1.097 0-2.424-1.935-4.359-4.359-4.359S9.321 5.576 9.321 8c0 .393.061.767.172 1.097a.5.5 0 00.438.393s.205.038.577.038c.3 0 .579-.273.604-.643.024-.373-.215-.75-.497-.91-.473-.24-.997-.64-.879-.96a29.26 29.26 0 001.823-6.354z" />
  </svg>
)

const StaffLayoutSidebar: React.FC<Props> = ({ selected = 'Dashboard', onSelect }) => {
  const items: Item[] = [
    { key: 'Dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { key: 'Orders', label: 'Orders', icon: <OrderIcon /> },
    { key: 'Messages', label: 'Messages', icon: <MessageIcon /> },
    { key: 'Materials', label: 'Materials', icon: <MaterialIcon /> },
    { key: 'Settings', label: 'Settings', icon: <SettingsIcon /> },
    { key: 'Events', label: 'Events', icon: <EventIcon /> },
  ]

  return (
    <aside className="w-64 bg-[#5E372E] dark:bg-gray-800 text-white min-h-screen hidden md:block">
      <div className="p-6 border-b border-b-[#6f453f] dark:border-b-gray-700">
        <h2 className="font-display text-xl">Staff Menu</h2>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.key}>
              <button
                onClick={() => onSelect && onSelect(item.key)}
                className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  selected === item.key
                    ? 'bg-gradient-to-r from-[#c79a63] to-[#d4ac6f] text-[#5E372E] dark:from-[#a0794a] dark:to-[#8f6a3b] dark:text-white'
                    : 'hover:bg-[#6b453f] dark:hover:bg-gray-700 text-[#f3e9e5] dark:text-gray-300'
                }`}
              >
                <span className="w-6 h-6 flex items-center justify-center">
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

export default StaffLayoutSidebar
