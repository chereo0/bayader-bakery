import React, { useState } from 'react'
import Card from './ui/Card'
import Input from './ui/Input'
import Textarea from './ui/Textarea'
import Button from './ui/Button'
import { SocialIcon } from './ui/Icon'
import { useToast, ToastProvider } from './ui/Toast'
import useReveal from '../hooks/useReveal'

function ContactForm(){
  const [name,setName] = useState('')
  const [email,setEmail] = useState('')
  const [msg,setMsg] = useState('')
  const toast = useToast()

  function handle(e:React.FormEvent){
    e.preventDefault()
    if(!name || !email || !msg) return toast.show('Please fill all fields')
    if(!/\S+@\S+\.\S+/.test(email)) return toast.show('Please enter a valid email')
    toast.show("Thanks! We'll get back to you soon.")
    setName(''); setEmail(''); setMsg('')
  }

  return (
    <Card className="p-6">
      <form onSubmit={handle} className="space-y-4">
        <Input placeholder="Name" value={name} onChange={e=> setName((e.target as HTMLInputElement).value)} />
        <Input placeholder="Email" value={email} onChange={e=> setEmail((e.target as HTMLInputElement).value)} />
        <Textarea placeholder="Message" value={msg} onChange={e=> setMsg((e.target as HTMLTextAreaElement).value)} />
        <Button type="submit">Send Message</Button>
      </form>
      <div className="mt-4 text-sm text-bakery-800">
        <div className="font-medium">123 Bakery Lane</div>
        <div>Sweet Town, ST 12345</div>
        <div className="flex gap-3 mt-2">
          <a aria-label="Instagram" className="text-bakery-900"><SocialIcon name="instagram" /></a>
          <a aria-label="Facebook" className="text-bakery-900"><SocialIcon name="facebook" /></a>
          <a aria-label="Email" className="text-bakery-900"><SocialIcon name="mail" /></a>
        </div>
      </div>
    </Card>
  )
}

export default function Contact(){
  const ref = useReveal()
  return (
    <ToastProvider>
      <div ref={ref as any} className="reveal grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div>
          <img src="/images/cookies.svg" alt="Cookie stack" className="w-full h-72 object-cover rounded-2xl shadow-soft" />
        </div>
        <div>
          <ContactForm />
        </div>
      </div>
    </ToastProvider>
  )
}
