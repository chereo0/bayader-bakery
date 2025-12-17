import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { MessageLayout } from '../../components/messages/MessageLayout';
import { MessageList } from '../../components/messages/MessageList';
import { MessageDetail } from '../../components/messages/MessageDetail';

interface Message {
  _id: string
  from: {
    _id: string
    name: string
    email: string
    role: string
  }
  to: {
    _id: string
    name: string
    role: string
  }
  subject: string
  message: string
  read: boolean
  readAt?: string
  createdAt: string
  type: string
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
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [isReplying, setIsReplying] = useState(false)
  const [activeTab, setActiveTab] = useState<'inbox' | 'archived'>('inbox')

  const [recipients, setRecipients] = useState<{ _id: string; name: string; role: string }[]>([])

  useEffect(() => {
    fetchAdminAndMessages()
  }, [page, activeTab])

  const fetchAdminAndMessages = async () => {
    try {
      setLoading(true)

      // Get Admins and Drivers for messaging
      const usersResponse = await axios.get(
        `${API_BASE_URL}/users`,
        {
          headers: { 'Authorization': `Bearer ${getToken()}` }
        }
      )

      if (usersResponse.data.success) {
        const potentialRecipients = usersResponse.data.data.filter((u: any) =>
          ['admin', 'driver'].includes(u.role?.toLowerCase())
        );
        setRecipients(potentialRecipients);
        // Default to first admin if available, or reset
        if (!adminId && potentialRecipients.length > 0) {
          // Do not auto-set adminId anymore, force user to select
        }
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
      // Notify sidebar to refresh count immediately
      window.dispatchEvent(new Event('messages-updated'))
    } catch (err) {
      console.error('Error marking message as read:', err)
    }
  }

  const [selectedThread, setSelectedThread] = useState<Message[]>([]);

  const handleSelectMessage = async (msg: Message) => {
    setSelectedMessage(msg)
    setSelectedThread([])

    // Fetch thread
    try {
      const response = await axios.get(
        `${API_BASE_URL}/messages/thread/${msg.from._id}`,
        { headers: { 'Authorization': `Bearer ${getToken()}` } }
      );
      if (response.data.success) {
        setSelectedThread(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching thread:', err);
    }

    if (!msg.read) {
      handleMarkAsRead(msg._id)
    }
  }

  // ...



  const handleReply = (msg: Message) => {
    setIsReplying(true)
    setSubject(`Re: ${msg.subject}`)
    setMessageText('')
    setShowCompose(true)
  }

  const handleArchiveMessage = async (msg: Message) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/messages/${msg._id}/archive`,
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

  const handleUnarchiveMessage = async (msg: Message) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/messages/${msg._id}/unarchive`,
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

  const closeDetail = () => {
    setSelectedMessage(null);
  }

  return (
    <div className="p-6">
      {error && (
        <div className="col-span-full bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-[#5E372E]">Messages</h2>
      </div>

      <MessageLayout mobileShowDetail={!!selectedMessage}>
        <MessageList
          messages={messages}
          selectedId={selectedMessage?._id}
          onSelect={handleSelectMessage as any}
          activeTab={activeTab}
          onTabChange={(tab) => { setActiveTab(tab); setPage(1); setSelectedMessage(null); }}
          onCompose={() => {
            setShowCompose(true)
            setIsReplying(false)
            setAdminId('') // Reset recipient to force selection
            setSubject('')
            setMessageText('')
          }}
          loading={loading}
        />
        <MessageDetail
          message={selectedMessage as any}
          thread={selectedThread}
          onBack={closeDetail}
          onArchive={handleArchiveMessage as any}
          onRestore={handleUnarchiveMessage as any}
          isArchivedTab={activeTab === 'archived'}
          currentUserId={(() => {
            try {
              const user = JSON.parse(localStorage.getItem('user') || '{}');
              return user._id || user.id;
            } catch (e) { return null; }
          })()}
          onSendReply={async (text) => {
            if (!selectedMessage) return;
            try {
              let currentUserId: string | null = null;
              try {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                  const user = JSON.parse(userStr);
                  currentUserId = user._id || user.id;
                }
              } catch (e) { console.error(e); }

              const recipientId = (selectedMessage.from._id === currentUserId)
                ? (selectedMessage as any).to?._id || (selectedMessage as any).to
                : selectedMessage.from._id;

              const finalRecipientId = typeof recipientId === 'object' ? recipientId._id : recipientId;

              const response = await axios.post(
                `${API_BASE_URL}/messages`,
                {
                  to: finalRecipientId,
                  subject: `Re: ${selectedMessage.subject}`,
                  message: text,
                  type: 'staff'
                },
                {
                  headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'application/json'
                  }
                }
              );

              if (response.data.success) {
                const newMessage = response.data.data;
                // 1. Append to thread
                setSelectedThread(prev => [...prev, newMessage]);

                // 2. Update messages list (Conversation preview)
                setMessages(prev => {
                  const others = prev.filter(m =>
                    !((m.from._id === finalRecipientId && m.to._id === currentUserId) ||
                      (m.from._id === currentUserId && m.to._id === finalRecipientId))
                  );
                  return [newMessage, ...others];
                });
              }
            } catch (e: any) {
              console.error(e)
              alert(`Failed to send reply: ${e.response?.data?.message || e.message}`)
            }
          }}
        />
      </MessageLayout>

      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-[#5E372E] mb-4">
              {isReplying ? 'Reply to Message' : 'Send Message'}
            </h3>
            <div className="space-y-4">
              {!isReplying && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                  <select
                    value={adminId} // We reuse adminId state for recipientId to minimize changes, or we should rename it. Let's assume adminId is now recipientId.
                    onChange={(e) => setAdminId(e.target.value)}
                    className="w-full border border-[#f3e7d9] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5E372E]"
                  >
                    <option value="">Select Recipient...</option>
                    {recipients.map(user => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter subject"
                  className="w-full border border-[#f3e7d9] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5E372E]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message..."
                  rows={5}
                  className="w-full border border-[#f3e7d9] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5E372E]"
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
                className="px-4 py-2 border border-[#f3e7d9] text-[#5E372E] rounded-md hover:bg-[#f9f3eb] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={sending}
                className="px-4 py-2 bg-[#5E372E] text-white rounded-md hover:bg-[#6b453f] transition-colors disabled:opacity-50"
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
