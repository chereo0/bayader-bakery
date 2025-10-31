import React from 'react'

type Props = React.HTMLAttributes<HTMLDivElement> & {
  className?: string
  onClick?: () => void
}

export default function Card({ className = '', children, onClick, ...rest }: Props) {
  return (
    <div
      role={onClick ? 'button' : 'region'}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-soft overflow-hidden ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
