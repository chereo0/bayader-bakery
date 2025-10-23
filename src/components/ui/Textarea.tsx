import React from 'react'

export default function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>){
  return (
    <textarea {...props} rows={4} className={`w-full px-4 py-3 rounded-2xl bg-bakery-200 border border-transparent focus:border-bakery-700 focus:ring-2 focus:ring-bakery-200 ${props.className || ''}`} />
  )
}
