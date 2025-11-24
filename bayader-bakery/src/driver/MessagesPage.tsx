import React, { useState, useEffect } from 'react'
import messageService, { Message } from './services/messageService'

const MessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [composingReply, setComposingReply] = useState(false)
  const [replyText, setReplyText] = useState('')

  // Fetch messages on component mount
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true)
        const data = await messageService.getMessages()
        // Filter to show only staff messages (admin and staff roles)
        const staffMessages = data.filter(m => m.from?.role === 'admin' || m.from?.role === 'staff' || m.type === 'admin')
        setMessages(staffMessages)
        setError(null)
      } catch (err) {
        console.error('Error fetching messages:', err)
        setError('Failed to load messages. Using demo data.')
        // Demo data fallback - Staff only
        setMessages([
          {
            _id: '1',
            from: {
              _id: 'admin1',
              name: 'Staff Admin',
              email: 'admin@bayader.com',
              role: 'admin'
            },
            subject: 'New Deliveries Assigned',
            body: 'You have been assigned 3 new orders to deliver today. Please check your orders list and start with the priority items.',
            read: false,
            type: 'admin',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
          {
            _id: '2',
            from: {
              _id: 'staff1',
              name: 'Operations Manager',
              email: 'ops@bayader.com',
              role: 'staff'
            },
            subject: 'Priority: Order #ORD-0000042',
            body: 'This order needs to be delivered before 2:00 PM. Customer requested morning delivery. Please update status once picked up.',
            read: false,
            type: 'admin',
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          },
          {
            _id: '3',
            from: {
              _id: 'staff2',
              name: 'Delivery Coordinator',
              email: 'delivery@bayader.com',
              role: 'staff'
            },
            subject: 'Route Update Available',
            body: 'New optimized route available for your current deliveries. Please refer to My Orders page for the recommended sequence.',
            read: true,
            type: 'admin',
            createdAt: new Date(Date.now() - 0.5 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 0.5 * 60 * 60 * 1000).toISOString(),
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [])

  const unreadCount = messages.filter(m => !m.read).length

  const handleSelectMessage = async (message: Message) => {
    setSelectedMessage(message)
    if (!message.read) {
      try {
        await messageService.markAsRead(message._id)
        setMessages(prev =>
          prev.map(m => m._id === message._id ? { ...m, read: true } : m)
        )
      } catch (err) {
        console.error('Error marking message as read:', err)
      }
    }
  }

  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim()) return

    try {
      await messageService.sendMessage(
        selectedMessage.from._id,
        `Re: ${selectedMessage.subject}`,
        replyText
      )
      setReplyText('')
      setComposingReply(false)
      alert('Reply sent successfully!')
    } catch (err) {
      console.error('Error sending reply:', err)
      alert('Failed to send reply')
    }
  }

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'system':
        return 'border-blue-500 bg-blue-50'
      case 'admin':
        return 'border-red-500 bg-red-50'
      case 'customer':
        return 'border-green-500 bg-green-50'
      default:
        return 'border-gray-500 bg-gray-50'
    }
  }

  return (
    <div className="bg-[#fffaf4] rounded-lg shadow-sm min-h-[600px] p-6">
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-[#5E372E]">Messages</h2>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            {unreadCount} unread
          </span>
        )}
      </div>

      {loading && (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5E372E]"></div>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-1 space-y-2 max-h-[600px] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No messages</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message._id}
                  onClick={() => handleSelectMessage(message)}
                  className={`p-4 rounded-lg cursor-pointer transition-colors border-l-4 ${
                    selectedMessage?._id === message._id
                      ? 'bg-[#5E372E] text-white border-l-[#c79a63]'
                      : message.read
                      ? 'bg-white hover:bg-[#f9f3eb] border-l-gray-300'
                      : getMessageTypeColor(message.type)
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className={`font-medium text-sm ${selectedMessage?._id === message._id ? 'text-white' : 'text-[#5E372E]'}`}>
                      {message.from.name}
                    </div>
                    <span className={`text-xs ${selectedMessage?._id === message._id ? 'text-white/80' : 'text-[#6b4f45]'}`}>
                      {messageService.formatTime(message.createdAt)}
                    </span>
                  </div>
                  <p className={`text-sm truncate ${selectedMessage?._id === message._id ? 'text-white/90' : 'text-[#6b4f45]'}`}>
                    {message.subject}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <div className="bg-white rounded-lg shadow-sm p-6 max-h-[600px] overflow-y-auto">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#f3e7d9]">
                  <div>
                    <h3 className="text-xl font-semibold text-[#5E372E]">{selectedMessage.subject}</h3>
                    <div className="flex items-center gap-2 mt-2 text-sm text-[#6b4f45]">
                      <span>From: {selectedMessage.from.name}</span>
                      <span>•</span>
                      <span>{messageService.formatTime(selectedMessage.createdAt)}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    selectedMessage.type === 'system'
                      ? 'bg-blue-100 text-blue-800'
                      : selectedMessage.type === 'admin'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {selectedMessage.type.charAt(0).toUpperCase() + selectedMessage.type.slice(1)}
                  </span>
                </div>
                <div className="prose max-w-none mb-6">
                  <p className="text-[#6b4f45] whitespace-pre-wrap">{selectedMessage.body}</p>
                </div>

                {composingReply ? (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-[#6b4f45] mb-2">Your Reply</label>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your message here..."
                      className="w-full border border-[#f3e7d9] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5E372E] mb-3"
                      rows={4}
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleReply}
                        disabled={!replyText.trim()}
                        className="px-4 py-2 bg-[#5E372E] text-white rounded-md hover:bg-[#6b453f] transition-colors disabled:opacity-50"
                      >
                        Send Reply
                      </button>
                      <button
                        onClick={() => {
                          setComposingReply(false)
                          setReplyText('')
                        }}
                        className="px-4 py-2 border border-[#f3e7d9] text-[#5E372E] rounded-md hover:bg-[#f9f3eb] transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setComposingReply(true)}
                      className="px-4 py-2 bg-[#5E372E] text-white rounded-md hover:bg-[#6b453f] transition-colors"
                    >
                      Reply
                    </button>
                    <button className="px-4 py-2 border border-[#f3e7d9] text-[#5E372E] rounded-md hover:bg-[#f9f3eb] transition-colors">
                      Forward
                    </button>
                  </div>
                )}
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
      )}
    </div>
  )
}

export default MessagesPage

