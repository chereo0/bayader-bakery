import React, { createContext, useContext, useEffect, useState } from 'react'

export interface CartItem {
  id: number
  name: string
  price: number
  image?: string
  quantity: number
}

interface CartContextShape {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void
  removeItem: (id: number) => void
  updateQuantity: (id: number, qty: number) => void
  clearCart: () => void
  showToast: (message: string) => void
  toast: { visible: boolean; message: string }
}

const CartContext = createContext<CartContextShape | undefined>(undefined)

const CART_KEY = 'bayader_cart_v1'

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(CART_KEY)
      return raw ? JSON.parse(raw) : []
    } catch (e) {
      return []
    }
  })

  const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' })

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items))
    } catch (e) {
      // ignore
    }
  }, [items])

  const addItem = (item: Omit<CartItem, 'quantity'>, qty = 1) => {
    setItems(prev => {
      const found = prev.find(p => p.id === item.id)
      if (found) {
        return prev.map(p => p.id === item.id ? { ...p, quantity: p.quantity + qty } : p)
      }
      return [...prev, { ...item, quantity: qty }]
    })
  }

  const removeItem = (id: number) => setItems(prev => prev.filter(p => p.id !== id))

  const updateQuantity = (id: number, qty: number) => {
    if (qty <= 0) return removeItem(id)
    setItems(prev => prev.map(p => p.id === id ? { ...p, quantity: qty } : p))
  }

  const clearCart = () => setItems([])

  const showToast = (message: string) => {
    setToast({ visible: true, message })
    setTimeout(() => setToast({ visible: false, message: '' }), 2500)
  }

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, showToast, toast }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

export default CartContext
