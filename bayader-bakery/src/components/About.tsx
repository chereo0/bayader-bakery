import React from 'react'
import useReveal from '../hooks/useReveal'

export default function About(){
  const ref = useReveal()
  return (
    <div ref={ref as any} className="reveal grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      <div>
  <img src="/images/about.svg" alt="Hands kneading dough" className="w-full h-72 object-cover rounded-2xl shadow-soft"/>
      </div>
      <div>
        <h2 className="text-3xl font-display mb-4">About Us</h2>
        <p className="text-bakery-800">At EL-Bayader, we're passionate about creating delicious baked goods with the finest ingredients. We blend traditional techniques with modern flavors to bring joy to every bite.</p>
      </div>
    </div>
  )
}
