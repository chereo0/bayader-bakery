import React from 'react'
import { WheatIcon, SocialIcon } from './ui/Icon'

export default function Footer(){
  return (
    <footer className="bg-bakery-100 border-t border-bakery-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <WheatIcon className="h-5 w-5 text-bakery-900" />
          <span className="font-display">EL-Bayader</span>
        </div>
        <div className="flex items-center gap-3 text-bakery-900">
          <SocialIcon name="instagram" />
          <SocialIcon name="facebook" />
          <SocialIcon name="mail" />
        </div>
      </div>
    </footer>
  )
}
