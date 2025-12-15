import React, { createContext, useContext, useEffect, useState } from 'react'

export interface CartItem {
  id: string  // Changed from number to string to store MongoDB ObjectId
  name: string
  price: number
  image?: string
  quantity: number
}

interface CartContextShape {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, qty: number) => void
  clearCart: () => void
  setCartItems: (items: CartItem[]) => void
  getCartItems: () => CartItem[]
  showToast: (message: string) => void
  toast: { visible: boolean; message: string }
}

const CartContext = createContext<CartContextShape | undefined>(undefined)

// Helper function to get cart key based on user
const getCartKey = (userId?: string | null): string => {
  return userId ? `bayader_cart_${userId}` : 'bayader_cart_guest'
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      // Try to load from guest cart first (will be replaced on login)
      const raw = localStorage.getItem(getCartKey())
      return raw ? JSON.parse(raw) : []
    } catch (e) {
      return []
    }
  })

  const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' })
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Update localStorage whenever items change
  useEffect(() => {
    try {
      const cartKey = getCartKey(currentUserId)
      localStorage.setItem(cartKey, JSON.stringify(items))
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e)
    }
  }, [items, currentUserId])

  // Load cart from localStorage when userId changes
  useEffect(() => {
    try {
      const cartKey = getCartKey(currentUserId)
      const raw = localStorage.getItem(cartKey)
      if (raw) {
        const savedItems = JSON.parse(raw)
        setItems(savedItems)
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage:', e)
    }
  }, [currentUserId])

  const addItem = (item: Omit<CartItem, 'quantity'>, qty = 1) => {
    setItems(prev => {
      const found = prev.find(p => p.id === item.id)
      if (found) {
        return prev.map(p => p.id === item.id ? { ...p, quantity: p.quantity + qty } : p)
      }
      return [...prev, { ...item, quantity: qty }]
    })
  }

  const removeItem = (id: string) => setItems(prev => prev.filter(p => p.id !== id))

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) return removeItem(id)
    setItems(prev => prev.map(p => p.id === id ? { ...p, quantity: qty } : p))
  }

  const clearCart = () => {
    setItems([])
    // Also clear from localStorage
    try {
      const cartKey = getCartKey(currentUserId)
      localStorage.removeItem(cartKey)
      // Also clear guest cart if exists
      localStorage.removeItem(getCartKey())
    } catch (e) {
      console.error('Failed to clear cart from localStorage:', e)
    }
  }

  const setCartItems = (newItems: CartItem[]) => {
    setItems(newItems)
  }

  const getCartItems = (): CartItem[] => {
    return items
  }

  const showToast = (message: string) => {
    setToast({ visible: true, message })
    setTimeout(() => setToast({ visible: false, message: '' }), 2500)
  }

  return (
    <CartContext.Provider value={{ 
      items, 
      addItem, 
      removeItem, 
      updateQuantity, 
      clearCart, 
      setCartItems,
      getCartItems,
      showToast, 
      toast 
    }}>
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
