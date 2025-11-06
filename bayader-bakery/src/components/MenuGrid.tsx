import React from 'react'
import Card from './ui/Card'
import useReveal from '../hooks/useReveal'

const items = [
  { title: 'Cakes', img: '/images/cakes.svg' },
  { title: 'Pastries', img: '/images/pastries.svg' },
  { title: 'Cookies', img: '/images/cookies.svg' },
  { title: 'Custom Orders', img: '/images/custom.svg' },
]

export default function MenuGrid(){
  const ref = useReveal()
  return (
    <div ref={ref as any} className="reveal">
      <h2 className="text-3xl font-display mb-6">Our Menu</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {items.map(i=> (
          <Card key={i.title} onClick={()=>{}} className="cursor-pointer transform transition-all hover:shadow-lg hover:-translate-y-1">
            <img src={i.img} alt={i.title} className="w-full h-40 object-cover" />
            <div className="p-4 text-center font-medium">{i.title}</div>
          </Card>
        ))}
      </div>
    </div>
  )
}
