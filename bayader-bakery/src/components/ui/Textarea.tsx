import React from 'react'

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export default function Textarea(props: Props) {
  return <textarea className="w-full rounded-md border border-[#e6dcd6] px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#caa77a]" {...props} />
}
