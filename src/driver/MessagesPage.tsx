import React, { useState } from 'react'

interface Message {
  id: string
  from: string
  subject: string
  message: string
  timestamp: string
  read: boolean
  type: 'system' | 'admin' | 'customer'
}

const MessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      from: 'System',
      subject: 'New Delivery Assignment',
      message: 'You have been assigned 3 new deliveries. Please check your route planner.',
      timestamp: '10:30 AM',
      read: false,
      type: 'system'
    },
    {
      id: '2',
      from: 'Admin',
      subject: 'Priority Delivery',
      message: 'Order #505 needs to be delivered before 2:00 PM. Please prioritize this delivery.',
      timestamp: '11:15 AM',
      read: false,
      type: 'admin'
    },
    {
      id: '3',
      from: 'Sarah L',
      subject: 'Delivery Instructions',
      message: 'Please leave the order at the front door. Ring the bell twice.',
      timestamp: '12:00 PM',
      read: true,
      type: 'customer'
    },
  ])

  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

  const unreadCount = messages.filter(m => !m.read).length

  const markAsRead = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m))
    if (selectedMessage?.id === id) {
      setSelectedMessage({ ...selectedMessage, read: true })
    }
  }

  return (
    <div className="bg-[#fffaf4] rounded-lg shadow-sm min-h-[600px] p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-[#5E372E]">Messages</h2>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            {unreadCount} unread
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1 space-y-2 max-h-[600px] overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              onClick={() => {
                setSelectedMessage(message)
                markAsRead(message.id)
              }}
              className={`p-4 rounded-lg cursor-pointer transition-colors ${
                selectedMessage?.id === message.id
                  ? 'bg-[#5E372E] text-white'
                  : message.read
                  ? 'bg-white hover:bg-[#f9f3eb] border border-[#f3e7d9]'
                  : 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className={`font-medium text-sm ${selectedMessage?.id === message.id ? 'text-white' : 'text-[#5E372E]'}`}>
                  {message.from}
                </div>
                <span className={`text-xs ${selectedMessage?.id === message.id ? 'text-white/80' : 'text-[#6b4f45]'}`}>
                  {message.timestamp}
                </span>
              </div>
              <p className={`text-sm truncate ${selectedMessage?.id === message.id ? 'text-white/90' : 'text-[#6b4f45]'}`}>
                {message.subject}
              </p>
            </div>
          ))}
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#f3e7d9]">
                <div>
                  <h3 className="text-xl font-semibold text-[#5E372E]">{selectedMessage.subject}</h3>
                  <div className="flex items-center gap-2 mt-2 text-sm text-[#6b4f45]">
                    <span>From: {selectedMessage.from}</span>
                    <span>•</span>
                    <span>{selectedMessage.timestamp}</span>
                  </div>
                </div>
              </div>
              <div className="prose max-w-none">
                <p className="text-[#6b4f45] whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>
              <div className="mt-6 flex gap-3">
                <button className="px-4 py-2 bg-[#5E372E] text-white rounded-md hover:bg-[#6b453f] transition-colors">
                  Reply
                </button>
                <button className="px-4 py-2 border border-[#f3e7d9] text-[#5E372E] rounded-md hover:bg-[#f9f3eb] transition-colors">
                  Forward
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-500">Select a message to view</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MessagesPage

