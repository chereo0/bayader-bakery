import React from 'react'
import Button from './ui/Button'
import useReveal from '../hooks/useReveal'

export default function Hero(){
  const ref = useReveal()
  return (
    <div ref={ref as any} className="reveal grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-24">
      <div className="hero-overlay">
        <h1 className="text-4xl md:text-5xl font-display font-semibold mb-4">Baked with love, served with joy.</h1>
        <p className="text-lg text-bakery-800 mb-6">Handcrafted treats using the finest ingredients. Fresh daily from our oven to your table.</p>
        <div className="flex gap-3">
          <Button>View Menu</Button>
          <Button variant="ghost">Order Now</Button>
        </div>
      </div>
      <div className="flex justify-center">
        {/* Intentionally blank: hero illustration removed — background covers the hero area */}
      </div>
    </div>
  )
}
