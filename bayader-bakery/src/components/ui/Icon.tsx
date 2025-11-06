import React from 'react'

export const WheatIcon = ({ className = 'h-6 w-6', ...rest }: any) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" {...rest}>
    <path d="M12 3v18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 8c1 1.5 3 2 5 2s4-0.5 5-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const ShoppingCartIcon = ({ className = 'h-6 w-6', ...rest }: any) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" {...rest}>
    <path d="M3 3h2l2 12h9l3-8H6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="10" cy="20" r="1" fill="currentColor" />
    <circle cx="18" cy="20" r="1" fill="currentColor" />
  </svg>
)

export const UserCircleIcon = ({ className = 'h-6 w-6', ...rest }: any) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" {...rest}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" />
    <path d="M8 14c1.333-1.333 4.667-1.333 6 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <circle cx="12" cy="9" r="1.5" fill="currentColor" />
  </svg>
)

export const SocialIcon = ({ name = 'instagram', className = 'h-5 w-5', ...rest }: any) => {
  if (name === 'instagram') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" {...rest}>
        <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="17" cy="7" r="0.5" fill="currentColor" />
      </svg>
    )
  }
  if (name === 'facebook') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" {...rest}>
        <path d="M15 8h2v-3h-2c-1 0-2 1-2 2v2H11v3h2v6h3v-6h2l1-3h-3V9c0-.5.5-1 1-1z" fill="currentColor" />
      </svg>
    )
  }
  // mail
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" {...rest}>
      <path d="M3 6.5v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 6.5l9 6 9-6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default null
