import React from 'react'

export function WheatIcon({ className='h-6 w-6' }: { className?: string }){
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 20c4-6 10-8 16-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 9c2 1 4 1 6 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function SocialIcon({ name, className='h-5 w-5' }: { name: 'instagram'|'facebook'|'mail', className?: string }){
  if(name==='instagram') return (<svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden><rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.2"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.2"/><path d="M17.5 6.5h.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>)
  if(name==='facebook') return (<svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden><path d="M18 2h-3a4 4 0 00-4 4v3H8v4h3v8h4v-8h3l1-4h-4V6a1 1 0 011-1h2V2z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>)
  return (<svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden><path d="M4 4h16v16H4z" stroke="currentColor" strokeWidth="1.2"/><path d="M22 6L12 13 2 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>)
}
