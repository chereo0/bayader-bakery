import React, { useState } from 'react'

interface Message {
  id: string
  from: string
  subject: string
  message: string
  timestamp: string
  read: boolean
  type: 'system' | 'admin' | 'staff'
}

const MessagingPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      from: 'Admin',
      subject: 'New Order Priority',
      message: 'Please prioritize Order #501 for customer Fatima Al',
      timestamp: '10:30 AM',
      read: false,
      type: 'admin'
    },
    {
      id: '2',
      from: 'System',
      subject: 'Inventory Alert',
      message: 'Low stock detected: Almond Flour (8 units remaining)',
      timestamp: '12:00 PM',
      read: false,
      type: 'system'
    },
    {
      id: '3',
      from: 'Ahmed Hassan',
      subject: 'Delivery Update',
      message: 'Order #492 has been delivered successfully',
      timestamp: '1:15 PM',
      read: true,
      type: 'staff'
    },
    {
      id: '4',
      from: 'Admin',
      subject: 'Schedule Change',
      message: 'Production schedule has been updated. Please check your assignments.',
      timestamp: '2:00 PM',
      read: true,
      type: 'admin'
    }
  ])

  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [composeOpen, setComposeOpen] = useState(false)
  const [newMessage, setNewMessage] = useState({ to: '', subject: '', message: '' })

  const unreadCount = messages.filter(m => !m.read).length

  const markAsRead = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m))
  }

  const getMessageIcon = (type: Message['type']) => {
    switch (type) {
      case 'system':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )
      case 'admin':
        return (
          <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Messages List */}
      <div className="lg:col-span-1 bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#5E372E]">Messages</h2>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={() => setComposeOpen(true)}
          className="w-full mb-4 px-4 py-2 bg-[#5E372E] text-white rounded-md hover:bg-[#6b453f] transition-colors font-medium"
        >
          + New Message
        </button>
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              onClick={() => {
                setSelectedMessage(message)
                markAsRead(message.id)
              }}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedMessage?.id === message.id
                  ? 'bg-[#5E372E] text-white'
                  : message.read
                  ? 'bg-gray-50 hover:bg-gray-100'
                  : 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500'
              }`}
            >
              <div className="flex items-start gap-2">
                <div className={`mt-0.5 ${selectedMessage?.id === message.id ? 'text-white' : ''}`}>
                  {getMessageIcon(message.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className={`font-medium text-sm truncate ${selectedMessage?.id === message.id ? 'text-white' : 'text-gray-900'}`}>
                      {message.from}
                    </p>
                    <span className={`text-xs ${selectedMessage?.id === message.id ? 'text-white/80' : 'text-gray-500'}`}>
                      {message.timestamp}
                    </span>
                  </div>
                  <p className={`text-sm truncate ${selectedMessage?.id === message.id ? 'text-white/90' : 'text-gray-600'}`}>
                    {message.subject}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Detail */}
      <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
        {selectedMessage ? (
          <div>
            <div className="flex items-center justify-between mb-4 pb-4 border-b">
              <div>
                <h3 className="text-xl font-semibold text-[#5E372E]">{selectedMessage.subject}</h3>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                  <span>From: {selectedMessage.from}</span>
                  <span>•</span>
                  <span>{selectedMessage.timestamp}</span>
                </div>
              </div>
            </div>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
            </div>
            <div className="mt-6 flex gap-3">
              <button className="px-4 py-2 bg-[#5E372E] text-white rounded-md hover:bg-[#6b453f] transition-colors">
                Reply
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                Forward
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-500">Select a message to view</p>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {composeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-[#5E372E] mb-4">Compose Message</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <select
                  value={newMessage.to}
                  onChange={e => setNewMessage({ ...newMessage, to: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select recipient</option>
                  <option value="admin">Admin</option>
                  <option value="staff">All Staff</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  value={newMessage.subject}
                  onChange={e => setNewMessage({ ...newMessage, subject: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter subject"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={newMessage.message}
                  onChange={e => setNewMessage({ ...newMessage, message: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows={5}
                  placeholder="Enter your message"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setComposeOpen(false)
                  setNewMessage({ to: '', subject: '', message: '' })
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle send message
                  setComposeOpen(false)
                  setNewMessage({ to: '', subject: '', message: '' })
                }}
                className="px-4 py-2 bg-[#5E372E] text-white rounded-md hover:bg-[#6b453f]"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MessagingPage

