import React, { createContext, useContext, useState } from 'react'

const ToastContext = createContext({ show: (msg:string)=>{} })

export function ToastProvider({ children }: { children: React.ReactNode }){
  const [msg, setMsg] = useState('')
  function show(m:string){
    setMsg(m)
    setTimeout(()=> setMsg(''), 3000)
  }
  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {msg && (
        <div className="fixed bottom-6 right-6 bg-bakery-900 text-white px-4 py-2 rounded-2xl shadow-soft">{msg}</div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast(){
  return useContext(ToastContext)
}
