import React, { useState, useEffect } from 'react'

const API_BASE_URL = 'http://localhost:5000/api';

interface MessageItem {
  _id: string
  from: {
    _id: string
    name: string
    email: string
    role: string
  }
  subject: string
  message: string
  timestamp?: string
  read: boolean
  type: 'system' | 'admin' | 'staff'
  createdAt: string
}

interface SelectedMessage extends MessageItem {
  timestamp?: string
}

const MessagingPage: React.FC = () => {
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [selectedMessage, setSelectedMessage] = useState<SelectedMessage | null>(null)
  const [composeOpen, setComposeOpen] = useState(false)
  const [newMessage, setNewMessage] = useState({ to: '', subject: '', message: '' })
  const [staffMembers, setStaffMembers] = useState<Array<{ _id: string; name: string }>>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const [roleFilter, setRoleFilter] = useState<'all' | 'staff' | 'driver'>('all')

  const token = localStorage.getItem('token');

  // Fetch messages on component mount
  useEffect(() => {
    fetchMessages();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [roleFilter]);

  const fetchMessages = async () => {
    try {
      if (!token) return;

      let url = `${API_BASE_URL}/messages/conversations/all`;
      if (roleFilter !== 'all') {
        url += `?fromRole=${roleFilter}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch messages');

      const data = await response.json();
      if (data.success) {
        const formattedMessages = data.data.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        setMessages(formattedMessages);
        setUnreadCount(data.meta?.unreadCount || 0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const getMessageIcon = (type: MessageItem['type']) => {
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

  const markAsRead = async (messageId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/${messageId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to mark as read');

      await response.json();
      fetchMessages(); // Refresh messages
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

  const handleSelectMessage = async (message: MessageItem) => {
    setSelectedMessage({
      ...message,
      timestamp: new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    if (!message.read) {
      await markAsRead(message._id);
    }
  };

  const sendNewMessage = async () => {
    try {
      if (!newMessage.to || !newMessage.subject || !newMessage.message) {
        setError('All fields are required');
        return;
      }

      setSending(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: newMessage.to,
          subject: newMessage.subject,
          message: newMessage.message,
          type: 'staff'
        })
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      if (data.success) {
        setSuccess('Message sent successfully!');
        setComposeOpen(false);
        setNewMessage({ to: '', subject: '', message: '' });
        fetchMessages(); // Refresh messages
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to delete message');

      setSuccess('Message archived');
      setSelectedMessage(null);
      fetchMessages();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete message');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Alert Messages */}
      {error && (
        <div className="col-span-full bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="col-span-full bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-700 text-sm">{success}</p>
        </div>
      )}

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

        {/* Role Filter Tabs */}
        <div className="flex gap-2 mb-4 border-b">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              roleFilter === 'all'
                ? 'text-[#5E372E] border-b-2 border-[#c79a63]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setRoleFilter('staff')}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              roleFilter === 'staff'
                ? 'text-[#5E372E] border-b-2 border-[#c79a63]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Staff
          </button>
          <button
            onClick={() => setRoleFilter('driver')}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              roleFilter === 'driver'
                ? 'text-[#5E372E] border-b-2 border-[#c79a63]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Drivers
          </button>
        </div>
        <button
          onClick={() => setComposeOpen(true)}
          className="w-full mb-4 px-4 py-2 bg-[#5E372E] text-white rounded-md hover:bg-[#6b453f] transition-colors font-medium"
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
              <p className="text-center text-gray-500 py-4">No messages</p>
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
                    <div className={`mt-0.5 ${selectedMessage?._id === message._id ? 'text-white' : ''}`}>
                      {getMessageIcon(message.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`font-medium text-sm truncate ${selectedMessage?._id === message._id ? 'text-white' : 'text-gray-900'}`}>
                          {message.from.name}
                        </p>
                        <span className={`text-xs ${selectedMessage?._id === message._id ? 'text-white/80' : 'text-gray-500'}`}>
                          {message.timestamp}
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
                  <span>{selectedMessage.timestamp}</span>
                </div>
              </div>
            </div>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
            </div>
            <div className="mt-6 flex gap-3">
              <button 
                onClick={() => {
                  setComposeOpen(true);
                  setNewMessage({
                    to: selectedMessage.from._id,
                    subject: `Re: ${selectedMessage.subject}`,
                    message: ''
                  });
                }}
                className="px-4 py-2 bg-[#5E372E] text-white rounded-md hover:bg-[#6b453f] transition-colors"
              >
                Reply
              </button>
              <button 
                onClick={() => deleteMessage(selectedMessage._id)}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors"
              >
                Archive
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
                <input
                  type="text"
                  value={newMessage.to ? staffMembers.find(s => s._id === newMessage.to)?.name || newMessage.to : ''}
                  onChange={e => {
                    const selected = staffMembers.find(s => s.name === e.target.value);
                    setNewMessage({ ...newMessage, to: selected?._id || '' });
                  }}
                  onFocus={() => {
                    // Could implement autocomplete here
                  }}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Search staff member..."
                  list="staff-list"
                />
                <datalist id="staff-list">
                  {staffMembers.map(staff => (
                    <option key={staff._id} value={staff.name} />
                  ))}
                </datalist>
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
                  setError('')
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={sendNewMessage}
                disabled={sending}
                className="px-4 py-2 bg-[#5E372E] text-white rounded-md hover:bg-[#6b453f] disabled:opacity-50 disabled:cursor-not-allowed"
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

export default MessagingPage
