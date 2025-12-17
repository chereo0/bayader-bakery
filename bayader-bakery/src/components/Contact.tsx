import React, { useState } from 'react'
import Card from './ui/Card'
import Input from './ui/Input'
import Textarea from './ui/Textarea'
import Button from './ui/Button'
import { SocialIcon } from './ui/Icon'
import { useToast, ToastProvider } from './ui/Toast'
import useReveal from '../hooks/useReveal'

function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [msg, setMsg] = useState('')
  const [sending, setSending] = useState(false)
  const toast = useToast()

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  async function handle(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email || !subject || !msg) return toast.show('Please fill all fields')
    if (!/\S+@\S+\.\S+/.test(email)) return toast.show('Please enter a valid email')

    setSending(true)
    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, subject, message: msg })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Failed to send message')
      }

      toast.show(data.message || "Thanks! We'll get back to you soon.")
      setName(''); setEmail(''); setSubject(''); setMsg('')
    } catch (err: any) {
      console.error(err)
      toast.show(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handle} className="space-y-4">
        <Input placeholder="Name" value={name} onChange={e => setName((e.target as HTMLInputElement).value)} disabled={sending} />
        <Input placeholder="Email" value={email} onChange={e => setEmail((e.target as HTMLInputElement).value)} disabled={sending} />
        <Input placeholder="Subject" value={subject} onChange={e => setSubject((e.target as HTMLInputElement).value)} disabled={sending} />
        <Textarea placeholder="Message" value={msg} onChange={e => setMsg((e.target as HTMLTextAreaElement).value)} disabled={sending} />
        <Button type="submit" disabled={sending}>
          {sending ? 'Sending...' : 'Send Message'}
        </Button>
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

export default function Contact() {
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
