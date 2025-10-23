import React from 'react'

export default function Card({ children, className='', onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }){
  return (
    <div onClick={onClick} role={onClick? 'button':'region'} tabIndex={0} className={`bg-white rounded-2xl shadow-soft overflow-hidden ${className}`}>
      {children}
    </div>
  )
}
