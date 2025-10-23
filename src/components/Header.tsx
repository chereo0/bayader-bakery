import React, { useState } from 'react'
import { WheatIcon } from './ui/Icon'
import Button from './ui/Button'

export default function Header(){
  const [open, setOpen] = useState(false)
  const links = [ ['Home','#home'], ['About','#about'], ['Menu','#menu'], ['Contact','#contact'] ]
  return (
    <header className="sticky top-0 z-30 backdrop-blur-sm bg-bakery-100/80 border-b border-bakery-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* three-column layout: logo | nav(center) | actions */}
        <div className="grid grid-cols-3 items-center h-16">
          <div className="flex items-center gap-3">
            <WheatIcon className="h-6 w-6 text-bakery-900" />
            <span className="font-display text-xl text-bakery-900">EL-Bayader</span>
          </div>

          <nav className="hidden md:flex items-center justify-center gap-6" aria-label="Main navigation">
            {links.map(([t,h])=> (
              <a key={t} href={h} className="text-bakery-900 hover:text-bakery-700 focus:outline-none focus:ring-2 focus:ring-bakery-700">{t}</a>
            ))}
          </nav>

          <div className="flex justify-end items-center gap-3">
            <div className="hidden md:flex items-center gap-3">
              <a href="#" className="hidden md:inline-block"><Button variant="ghost" className="px-4 py-1">Log in</Button></a>
              <a href="#" className="hidden md:inline-block"><Button className="px-4 py-1">Sign up</Button></a>
            </div>
            <div className="md:hidden">
              <button aria-label="Toggle menu" onClick={()=> setOpen(s=>!s)} className="p-2 rounded-md focus:ring-2 focus:ring-bakery-700">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 6h16M4 12h16M4 18h16" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden px-4 pb-4">
          <nav className="flex flex-col gap-2">
            {links.map(([t,h])=> (
              <a key={t} href={h} onClick={()=> setOpen(false)} className="block px-3 py-2 rounded-md text-bakery-900 hover:bg-bakery-200">{t}</a>
            ))}
            <div className="border-t border-bakery-200 pt-3">
              <a href="#" onClick={()=> setOpen(false)} className="block px-3 py-2 rounded-md text-bakery-900 hover:bg-bakery-200">Log in</a>
              <a href="#" onClick={()=> setOpen(false)} className="block mt-2 px-3 py-2 rounded-2xl bg-bakery-900 text-white text-center">Sign up</a>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
