import React from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost'
  className?: string
}

export default function Button({ variant = 'primary', className = '', children, ...rest }: ButtonProps) {
  const base = 'inline-flex items-center justify-center px-5 py-2 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-bakery-700'
  const variants: Record<string, string> = {
    primary: 'bg-bakery-900 text-white hover:bg-bakery-700',
    ghost: 'bg-bakery-200 border border-bakery-700 text-bakery-900 hover:bg-bakery-100'
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  )
}
