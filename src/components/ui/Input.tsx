import React from 'react'

export default function Input(props: React.InputHTMLAttributes<HTMLInputElement>){
  return (
    <input {...props} className={`w-full px-4 py-2 rounded-2xl bg-bakery-200 border border-transparent focus:border-bakery-700 focus:ring-2 focus:ring-bakery-200 ${props.className || ''}`} />
  )
}
