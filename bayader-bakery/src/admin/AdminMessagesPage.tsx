import React, { useState, useEffect } from 'react'
import { MessageLayout } from '../components/messages/MessageLayout';
import { MessageList } from '../components/messages/MessageList';
import { MessageDetail } from '../components/messages/MessageDetail';

const API_BASE_URL = 'http://localhost:5000/api';

interface MessageItem {
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
  timestamp?: string
  read: boolean
  type: string
  createdAt: string
}

interface User {
  _id: string
  name: string
  email: string
  role: string
}

const AdminMessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [selectedMessage, setSelectedMessage] = useState<MessageItem | null>(null)
  const [selectedThread, setSelectedThread] = useState<MessageItem[]>([])
  const [composeOpen, setComposeOpen] = useState(false)
  const [newMessage, setNewMessage] = useState({ to: '', subject: '', message: '' })
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'staff' | 'driver' | 'customer'>('all')
  const [activeTab, setActiveTab] = useState<'inbox' | 'archived'>('inbox')

  const token = localStorage.getItem('token');

  // Fetch messages and users on component mount
  useEffect(() => {
    fetchMessages();
    fetchUsers();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [roleFilter, activeTab]);

  const fetchMessages = async () => {
    try {
      if (!token) return;

      let url = `${API_BASE_URL}/messages/conversations/all`;
      const params = new URLSearchParams();
      if (roleFilter !== 'all') {
        params.append('fromRole', roleFilter);
      }
      params.append('archived', activeTab === 'archived' ? 'true' : 'false');
      url += `?${params.toString()}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch messages');

      const data = await response.json();
      if (data.success) {
        let currentUserId = '';
        try {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          currentUserId = user._id || user.id;
        } catch (e) {
          console.error('Error parsing user from local storage', e);
        }

        const filteredMessages = data.data.filter((m: MessageItem) => {
          // Safety check
          if (!m.from || !m.to) return false;

          // Identify partner
          const partner = (m.from._id === currentUserId) ? m.to : m.from;
          // If partner is null/undefined, skip
          if (!partner) return false;

          const partnerRole = partner.role;

          // 1. Strict Customer Exclusion
          if (partnerRole === 'customer') return false;

          // 2. Role Filter from Tab
          if (roleFilter === 'staff' && partnerRole !== 'staff') return false;
          if (roleFilter === 'driver' && partnerRole !== 'driver') return false;

          return true;
        });

        setMessages(filteredMessages);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      if (data.success) {
        // Only show staff and drivers in user list for new messages
        setUsers(data.data.filter((u: User) => u.role !== 'customer'));
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

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

      // Update local state without full refresh
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, read: true } : m));
      window.dispatchEvent(new Event('messages-updated'));
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

  const handleSelectMessage = async (message: MessageItem) => {
    setSelectedMessage(message);
    setSelectedThread([]);

    // Fetch thread
    try {
      if (!token) return;

      // Determine partner ID
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const myId = user._id || user.id;
      // If I am the sender, the partner is the recipient (to). If I am the recipient, the partner is the sender (from).
      const partnerId = (message.from._id === myId) ? (message.to?._id || message.to) : message.from._id;
      const pid = typeof partnerId === 'object' ? partnerId._id : partnerId; // Safety check

      const response = await fetch(`${API_BASE_URL}/messages/thread/${pid}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSelectedThread(data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching thread:', err);
    }

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
          type: 'admin'
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

  const archiveMessage = async (message: MessageItem) => {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/${message._id}/archive`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to archive message');

      setSuccess('Message archived');
      setSelectedMessage(null);
      fetchMessages();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive message');
    }
  };

  const unarchiveMessage = async (message: MessageItem) => {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/${message._id}/unarchive`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to unarchive message');

      setSuccess('Message restored to inbox');
      setSelectedMessage(null);
      fetchMessages();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unarchive message');
    }
  };

  const closeDetail = () => {
    setSelectedMessage(null);
  };

  const openReply = (message: MessageItem) => {
    setComposeOpen(true);
    setNewMessage({
      to: message.from._id,
      subject: `Re: ${message.subject}`,
      message: ''
    });
  };

  const filterOptions = [
    { label: 'Staff', value: 'staff' },
    { label: 'Drivers', value: 'driver' }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#5E372E]">Messages</h1>
        <p className="text-gray-600">Communicate with staff, drivers, and customers</p>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-700 text-sm">{success}</p>
        </div>
      )}

      <MessageLayout mobileShowDetail={!!selectedMessage}>
        <MessageList
          messages={messages}
          selectedId={selectedMessage?._id}
          onSelect={handleSelectMessage as any}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          roleFilter={roleFilter}
          onRoleFilterChange={(role) => setRoleFilter(role as any)}
          onCompose={() => {
            setComposeOpen(true);
            setNewMessage({ to: '', subject: '', message: '' });
          }}
          loading={loading}
          filterOptions={filterOptions}
        />
        <MessageDetail
          message={selectedMessage}
          thread={selectedThread}
          onBack={closeDetail}
          onArchive={() => selectedMessage && archiveMessage(selectedMessage)}
          onRestore={() => selectedMessage && unarchiveMessage(selectedMessage)}
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
                ? selectedMessage.to._id
                : selectedMessage.from._id;

              const response = await fetch(`${API_BASE_URL}/messages`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  to: recipientId,
                  subject: `Re: ${selectedMessage.subject}`,
                  message: text,
                  type: 'admin'
                })
              });

              if (response.ok) {
                const data = await response.json();
                if (data.success) {
                  const newMessage = data.data;
                  // 1. Append to thread
                  setSelectedThread(prev => [...prev, newMessage]);

                  // 2. Update messages list
                  setMessages(prev => {
                    const others = prev.filter(m =>
                      !((m.from._id === recipientId && m.to._id === currentUserId) ||
                        (m.from._id === currentUserId && m.to._id === recipientId))
                    );
                    return [newMessage, ...others];
                  });
                }
              }
            } catch (e) {
              console.error(e);
            }
          }}
        />
      </MessageLayout>

      {/* Compose Modal */}
      {composeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-[#5E372E] mb-4">Compose Message</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <select
                  title="Select message recipient"
                  value={newMessage.to}
                  onChange={e => setNewMessage({ ...newMessage, to: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select recipient...</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
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

export default AdminMessagesPage

