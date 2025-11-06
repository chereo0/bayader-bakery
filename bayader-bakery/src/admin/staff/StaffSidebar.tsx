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

const OrderIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a2.25 2.25 0 00-.093.386l.75 1.125.813-.875M9 10.5l.145-.27.505-.604.505.604L15.855 10.5m-6.855 3.75l-.195 3.585-1.005-.08m-3.75-3.75l.08 1.005m3.75-3.75L3 21m13.5-10.5l1.5-1.5M17.25 21L21 17.25" />
  </svg>
)

const ProductionIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17.25v1.007a3 3 0 01-.879 2.122L6.75 21h9.75a3 3 0 003-3V6a3 3 0 00-3-3h-9.75a3 3 0 00-3 3v9.75M12 9.75h3" />
  </svg>
)

const AlertIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const MessageIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
)

const SettingsIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941 1.11.941h2.594c.55 0 1.02-.398 1.11-.94l.213-1.281c.063-.374.313-.686.645-.87.074-.04.147-.083.22-.127.324-.196.72-.257 1.075-.124l1.217.456a1.125 1.125 0 001.37-.49l1.297-2.247a1.125 1.125 0 00-.26-1.431l-1.004-.827c-.292-.24-.438-.613-.43-.992a6.932 6.932 0 010-.255c-.007-.378.138-.75.43-.99l1.004-.828a1.125 1.125 0 00.26-1.43l-1.297-2.247a1.125 1.125 0 00-1.37-.491l-1.217.456c-.355.133-.75.072-1.076-.124a6.556 6.556 0 01-.22-.128c-.331-.183-.581-.495-.644-.869l-.214-1.281z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const StaffSidebar: React.FC<Props> = ({ selected = 'Dashboard', onSelect }) => {
  const items: Item[] = [
    { key: 'Dashboard', label: 'Dashboard', icon: <HomeIcon /> },
    { key: 'Orders', label: 'Orders', icon: <OrderIcon /> },
    { key: 'Production', label: 'Production', icon: <ProductionIcon /> },
    { key: 'Inventory Alerts', label: 'Inventory Alerts', icon: <AlertIcon /> },
    { key: 'Messaging', label: 'Messaging', icon: <MessageIcon /> },
    { key: 'Staff Settings', label: 'Staff Settings', icon: <SettingsIcon /> },
  ]

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

export default StaffSidebar

