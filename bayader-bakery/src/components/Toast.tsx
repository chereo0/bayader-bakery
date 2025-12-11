import React, { useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { CheckCircle2, AlertCircle, Info } from 'lucide-react'

interface ToastProps {
  type?: 'success' | 'error' | 'info'
  message?: string
  onClose?: () => void
}

const Toast: React.FC<ToastProps> = ({ type = 'info', message, onClose }) => {
  const { toast: cartToast } = useCart()

  // If props are provided, use them; otherwise use cart context
  const isVisible = message !== undefined || cartToast.visible
  const displayMessage = message !== undefined ? message : cartToast.message
  const displayType = message !== undefined ? type : 'info'

  useEffect(() => {
    if (message !== undefined && onClose) {
      const timer = setTimeout(onClose, 3000)
      return () => clearTimeout(timer)
    }
  }, [message, onClose])

  if (!isVisible) return null

  const getIcon = () => {
    switch (displayType) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5" />
      case 'error':
        return <AlertCircle className="w-5 h-5" />
      case 'info':
      default:
        return <Info className="w-5 h-5" />
    }
  }

  const getBgColor = () => {
    switch (displayType) {
      case 'success':
        return 'bg-green-500'
      case 'error':
        return 'bg-red-500'
      case 'info':
      default:
        return 'bg-[#6b3f2f]'
    }
  }

  return (
    <div className="fixed right-6 bottom-6 z-50">
      <div className={`${getBgColor()} text-white px-4 py-3 rounded shadow-lg flex items-center gap-3`}>
        {getIcon()}
        <span>{displayMessage}</span>
      </div>
    </div>
  )
}

export default Toast
