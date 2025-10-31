import React from 'react'

type Props = React.InputHTMLAttributes<HTMLInputElement>

export default function Input(props: Props) {
  return <input className="w-full rounded-md border border-[#e6dcd6] px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#caa77a]" {...props} />
}
