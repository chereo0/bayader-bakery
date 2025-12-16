import React, { useState, useEffect } from 'react'
import axios from 'axios'

interface Message {
  _id: string
  from: {
    _id: string
    name: string
    email: string
    role: string
  }
  to: string
  subject: string
  message: string
  read: boolean
  readAt?: string
  createdAt: string
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const getToken = () => localStorage.getItem('token')

const StaffMessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCompose, setShowCompose] = useState(false)
  const [subject, setSubject] = useState('')
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const [adminId, setAdminId] = useState<string>('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [isReplying, setIsReplying] = useState(false)
  const [activeTab, setActiveTab] = useState<'inbox' | 'archived'>('inbox')

  useEffect(() => {
    fetchAdminAndMessages()
  }, [page, activeTab])

  const fetchAdminAndMessages = async () => {
    try {
      setLoading(true)

      // Get current user ID from token
      const tokenData = localStorage.getItem('user')
      if (tokenData) {
        const user = JSON.parse(tokenData)
        setCurrentUserId(user._id)
      }

      // Get first admin user for messaging
      const adminResponse = await axios.get(
        `${API_BASE_URL}/users?role=admin&limit=1`,
        {
          headers: { 'Authorization': `Bearer ${getToken()}` }
        }
      )

      if (adminResponse.data.data.length > 0) {
        setAdminId(adminResponse.data.data[0]._id)
      }

      // Fetch ALL messages (both received FROM admin and sent TO admin)
      const messagesResponse = await axios.get(
        `${API_BASE_URL}/messages/conversations/all?page=${page}&limit=50&archived=${activeTab === 'archived' ? 'true' : 'false'}`,
        {
          headers: { 'Authorization': `Bearer ${getToken()}` }
        }
      )

      let allMessages: Message[] = []

      if (messagesResponse.data.success) {
        allMessages = messagesResponse.data.data || []
        setTotal(messagesResponse.data.meta?.total || 0)
        setError(null)
      }

      // Sort by newest first and display all messages (both received and sent)
      setMessages(allMessages.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages')
      console.error('Error fetching messages:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!subject.trim() || !messageText.trim() || !adminId) {
      setError('Please fill in all fields')
      return
    }

    try {
      setSending(true)
      const response = await axios.post(
        `${API_BASE_URL}/messages`,
        {
          to: adminId,
          subject: subject.trim(),
          message: messageText.trim(),
          type: 'staff'
        },
        {
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.success) {
        setSubject('')
        setMessageText('')
        setShowCompose(false)
        setIsReplying(false)
        setSelectedMessage(null)
        setError(null)
        // Refresh messages
        setPage(1)
        await fetchAdminAndMessages()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await axios.put(
        `${API_BASE_URL}/messages/${messageId}/read`,
        {},
        {
          headers: { 'Authorization': `Bearer ${getToken()}` }
        }
      )
      // Refresh messages
      await fetchAdminAndMessages()
    } catch (err) {
      console.error('Error marking message as read:', err)
    }
  }

  const handleSelectMessage = (msg: Message) => {
    setSelectedMessage(msg)
    if (!msg.read) {
      handleMarkAsRead(msg._id)
    }
  }

  const handleReply = () => {
    if (!selectedMessage) return
    setIsReplying(true)
    setSubject(`Re: ${selectedMessage.subject}`)
    setMessageText('')
    setShowCompose(true)
  }

  const handleArchiveMessage = async (messageId: string) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/messages/${messageId}/archive`,
        {},
        {
          headers: { 'Authorization': `Bearer ${getToken()}` }
        }
      )
      setSelectedMessage(null)
      setIsReplying(false)
      await fetchAdminAndMessages()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive message')
    }
  }

  const handleUnarchiveMessage = async (messageId: string) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/messages/${messageId}/unarchive`,
        {},
        {
          headers: { 'Authorization': `Bearer ${getToken()}` }
        }
      )
      setSelectedMessage(null)
      setIsReplying(false)
      await fetchAdminAndMessages()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unarchive message')
    }
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`

    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {error && (
        <div className="col-span-full bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Messages List */}
      <div className="lg:col-span-1 bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#5E372E]">Messages</h2>
        </div>

        {/* Tabs: Inbox / Archived */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => { setActiveTab('inbox'); setPage(1); setSelectedMessage(null); }}
            className={`px-3 py-1 rounded-lg text-sm border transition-colors ${
              activeTab === 'inbox'
                ? 'bg-[#c79a63] text-white border-[#c79a63]'
                : 'bg-white text-[#5E372E] border-gray-300 hover:bg-gray-50'
            }`}
          >
            Inbox
          </button>
          <button
            onClick={() => { setActiveTab('archived'); setPage(1); setSelectedMessage(null); }}
            className={`px-3 py-1 rounded-lg text-sm border transition-colors ${
              activeTab === 'archived'
                ? 'bg-[#c79a63] text-white border-[#c79a63]'
                : 'bg-white text-[#5E372E] border-gray-300 hover:bg-gray-50'
            }`}
          >
            Archived
          </button>
        </div>

        <button
          onClick={() => {
            setShowCompose(true)
            setIsReplying(false)
            setSubject('')
            setMessageText('')
          }}
          className="w-full mb-4 px-4 py-2 bg-[#c79a63] text-white rounded-lg hover:bg-[#b88a52] transition-colors font-medium"
        >
          + New Message
        </button>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading messages...</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                {activeTab === 'archived' ? 'No archived messages' : 'No messages'}
              </p>
            ) : (
              messages.map((message) => (
                <div
                  key={message._id}
                  onClick={() => handleSelectMessage(message)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedMessage?._id === message._id
                      ? 'bg-[#5E372E] text-white'
                      : message.read
                      ? 'bg-gray-50 hover:bg-gray-100'
                      : 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`font-medium text-sm truncate ${selectedMessage?._id === message._id ? 'text-white' : 'text-gray-900'}`}>
                          {message.from.name}
                        </p>
                        <span className={`text-xs ${selectedMessage?._id === message._id ? 'text-white/80' : 'text-gray-500'}`}>
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                      <p className={`text-sm truncate ${selectedMessage?._id === message._id ? 'text-white/90' : 'text-gray-600'}`}>
                        {message.subject}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Message Detail */}
      <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
        {selectedMessage ? (
          <div>
            <div className="flex items-center justify-between mb-4 pb-4 border-b">
              <div>
                <h3 className="text-xl font-semibold text-[#5E372E]">{selectedMessage.subject}</h3>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                  <span>From: {selectedMessage.from.name}</span>
                  <span>•</span>
                  <span>{formatDate(selectedMessage.createdAt)}</span>
                </div>
              </div>
            </div>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
            </div>
            <div className="mt-6 flex gap-3">
              <button 
                onClick={handleReply}
                className="px-4 py-2 bg-[#c79a63] text-white rounded-lg hover:bg-[#b88a52] transition-colors"
              >
                Reply
              </button>
              {activeTab === 'archived' ? (
                <button
                  onClick={() => handleUnarchiveMessage(selectedMessage._id)}
                  className="px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
                >
                  Restore
                </button>
              ) : (
                <button 
                  onClick={() => handleArchiveMessage(selectedMessage._id)}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Archive
                </button>
              )}
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
      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-[#5E372E] mb-4">
              {isReplying ? 'Reply to Message' : 'Send Message'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter subject"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#c79a63] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message..."
                  rows={5}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#c79a63] focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCompose(false)
                  setIsReplying(false)
                  setSubject('')
                  setMessageText('')
                  setError('')
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={sending}
                className="px-4 py-2 bg-[#c79a63] text-white rounded-lg hover:bg-[#b88a52] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StaffMessagesPage
