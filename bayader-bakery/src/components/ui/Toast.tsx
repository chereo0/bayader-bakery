import React, { createContext, useContext, useState, useCallback } from 'react'

type ToastContextValue = {
  show: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export const ToastProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [msg, setMsg] = useState<string | null>(null)

  const show = useCallback((m: string) => {
    setMsg(m)
    setTimeout(() => setMsg(null), 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {msg && (
        <div className="fixed right-6 bottom-6 z-50">
          <div className="bg-[#6b3f2f] text-white px-4 py-2 rounded shadow-lg">{msg}</div>
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}

export default ToastProvider
