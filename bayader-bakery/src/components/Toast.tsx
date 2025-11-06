import React from 'react'
import { useCart } from '../context/CartContext'

const Toast: React.FC = () => {
  const { toast } = useCart()

  if (!toast.visible) return null

  return (
    <div className="fixed right-6 bottom-6 z-50">
      <div className="bg-[#6b3f2f] text-white px-4 py-2 rounded shadow-lg">
        {toast.message}
      </div>
    </div>
  )
}

export default Toast
