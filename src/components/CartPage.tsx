import React from 'react'
import { useCart } from '../context/CartContext'

const CartPage: React.FC = () => {
  const { items, updateQuantity, removeItem, clearCart } = useCart()

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)

  return (
    <div className="min-h-screen bg-[#F5F1E8] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-display mb-4 text-[#5E372E]">Your Cart</h2>
        {items.length === 0 ? (
          <div className="bg-white rounded p-6 shadow">Your cart is empty.</div>
        ) : (
          <div className="space-y-4">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded p-4 shadow flex gap-4 items-center">
                <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded" />
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-[#5E372E]">{item.name}</h3>
                  <p className="text-sm text-[#6b4f45]">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1 bg-gray-200 rounded">-</button>
                  <span className="px-2">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1 bg-gray-200 rounded">+</button>
                </div>
                <div className="ml-4 text-right">
                  <div className="text-lg font-bold text-[#5E372E]">${(item.price * item.quantity).toFixed(2)}</div>
                  <button onClick={() => removeItem(item.id)} className="mt-2 text-sm text-red-600">Remove</button>
                </div>
              </div>
            ))}

            <div className="bg-white p-4 rounded shadow flex items-center justify-between">
              <div>
                <div className="text-sm text-[#6b4f45]">Total</div>
                <div className="text-2xl font-bold text-[#5E372E]">${total.toFixed(2)}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => clearCart()} className="px-4 py-2 bg-gray-200 rounded">Clear</button>
                <button className="px-4 py-2 bg-[#6b3f2f] text-white rounded">Checkout</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CartPage
