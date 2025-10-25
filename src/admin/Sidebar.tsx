import React from 'react'

type Item = { key: string; label: string }

interface Props {
  selected?: string
  onSelect?: (key: string) => void
}

const Sidebar: React.FC<Props> = ({ selected = 'Dashboard', onSelect }) => {
  const items: Item[] = [
    { key: 'Dashboard', label: 'Dashboard' },
    { key: 'Products', label: 'Products' },
    { key: 'Analytics', label: 'Analytics' },
    { key: 'Users', label: 'Users' },
    { key: 'Events', label: 'Events' },
    { key: 'Inventory', label: 'Inventory' },
    { key: 'Feedback', label: 'Feedback' },
    { key: 'Promotions', label: 'Promotions' }
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
                <span className="w-6 h-6 bg-[#7b503f] rounded-sm flex items-center justify-center text-xs">•</span>
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
