import React, { useState, useEffect } from 'react'
import messageService, { Message } from './services/messageService'
import { MessageLayout } from '../components/messages/MessageLayout';
import { MessageList } from '../components/messages/MessageList';
import { MessageDetail } from '../components/messages/MessageDetail';

const MessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [selectedThread, setSelectedThread] = useState<Message[]>([])
  const [composingReply, setComposingReply] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [activeTab, setActiveTab] = useState<'inbox' | 'archived'>('inbox')

  // Fetch messages on component mount or tab change
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true)
        const archived = activeTab === 'archived'
        const data = await messageService.getMessages(archived)
        // Filter to show conversations involving admin, staff, or self (driver)
        // Since getMessages returns conversations where the user is a participant, we should be careful not to over-filter.
        // We want to see messages from Admin/Staff, OR messages sent by ME (Driver).
        const staffMessages = data.filter(m =>
          m.from?.role === 'admin' ||
          m.from?.role === 'staff' ||
          m.from?.role === 'driver' || // Include my own sent messages
          m.type === 'admin'
        );
        setMessages(staffMessages)
        setError(null)
      } catch (err) {
        console.error('Error fetching messages:', err)
        setError('Failed to load messages. Using demo data.')
        // Demo data fallback - Staff only
        setMessages([
          {
            _id: '507f1f77bcf86cd799439011',
            from: {
              _id: '507f1f77bcf86cd799439012',
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
            to: {
              _id: 'driver_id_demo',
              name: 'Demo Driver',
              role: 'driver'
            }
          },
          {
            _id: '507f1f77bcf86cd799439013',
            from: {
              _id: '507f1f77bcf86cd799439014',
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
            to: {
              _id: 'driver_id_demo',
              name: 'Demo Driver',
              role: 'driver'
            }
          },
          {
            _id: '507f1f77bcf86cd799439015',
            from: {
              _id: '507f1f77bcf86cd799439016',
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
            to: {
              _id: 'driver_id_demo',
              name: 'Demo Driver',
              role: 'driver'
            }
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [activeTab])



  const handleSelectMessage = async (message: Message) => {
    setSelectedMessage(message);
    setSelectedThread([]); // Clear previous thread immediately

    // Fetch full conversation thread
    try {
      // Determine partner ID
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const myId = user._id || user.id;
      // If I am the sender, the partner is the recipient (to). If I am the recipient, the partner is the sender (from).
      // Note: 'to' might be an object or string depending on population, but here message is likely populated.
      // Safely access _id if it's an object, or use it directly if it's a string, though our type usually says object.
      const partnerId = (message.from._id === myId) ? (message.to?._id || message.to) : message.from._id;

      const thread = await messageService.getThread(partnerId as string);
      setSelectedThread(thread);
    } catch (err) {
      console.error('Error fetching thread:', err);
    }

    if (!message.read) {
      try {
        await messageService.markAsRead(message._id)
        setMessages(prev =>
          prev.map(m => m._id === message._id ? { ...m, read: true } : m)
        )
        window.dispatchEvent(new Event('messages-updated'))
      } catch (err) {
        console.error('Error marking message as read:', err)
      }
    }
  }

  // ... (rest of component)

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
    } catch (err: any) {
      console.error('Error sending reply:', err)
      alert(`Failed to send reply: ${err.response?.data?.message || err.message}`)
    }
  };

  const handleArchive = async (message: Message) => {
    try {
      // proper partner ID logic
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const myId = user._id || user.id;
      const partnerId = (message.from._id === myId) ? (message.to?._id || message.to) : message.from._id;
      // Use string cast or object access
      const pid = typeof partnerId === 'object' ? partnerId._id : partnerId;

      await messageService.archiveConversation(pid as string)

      // Remove all messages from this partner in the list. 
      // Actually we just need to remove the conversation item which is represented by this message.
      // But wait, 'messages' list is a list of CONVERSATIONS (latest message). 
      // If we archive the whole conversation, this item should disappear.
      setMessages(prev => prev.filter(m => m._id !== message._id))

      if (selectedMessage?._id === message._id) {
        setSelectedMessage(null)
      }
    } catch (err) {
      console.error('Error archiving conversation:', err)
      alert('Failed to archive conversation')
    }
  };

  const handleUnarchive = async (message: Message) => {
    try {
      // proper partner ID logic
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const myId = user._id || user.id;
      const partnerId = (message.from._id === myId) ? (message.to?._id || message.to) : message.from._id;
      const pid = typeof partnerId === 'object' ? partnerId._id : partnerId;

      await messageService.unarchiveConversation(pid as string)
      setMessages(prev => prev.filter(m => m._id !== message._id))
      if (selectedMessage?._id === message._id) {
        setSelectedMessage(null)
      }
    } catch (err) {
      console.error('Error unarchiving conversation:', err)
      alert('Failed to unarchive conversation')
    }
  };

  const closeDetail = () => {
    setSelectedMessage(null);
  };

  // Convert Message to the format expected by shared components if needed
  // In this case, our Message interface likely aligns well enough, or we cast it.
  // We need to ensure 'body' is passed effectively. The MessageDetail component checks for 'message' or 'body'.

  const [showCompose, setShowCompose] = useState(false)
  const [recipientId, setRecipientId] = useState('')
  const [subject, setSubject] = useState('')
  const [messageBody, setMessageBody] = useState('')
  const [recipients, setRecipients] = useState<{ _id: string; name: string; role: string }[]>([])
  const [sending, setSending] = useState(false)

  useEffect(() => {
    // Load potential recipients when component mounts
    const loadRecipients = async () => {
      const users = await messageService.getRecipients();
      setRecipients(users);
    };
    loadRecipients();
  }, []);

  const handleSendMessage = async () => {
    if (!recipientId || !subject.trim() || !messageBody.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setSending(true);
      await messageService.sendMessage(recipientId, subject, messageBody);
      setSubject('');
      setMessageBody('');
      setRecipientId('');
      setShowCompose(false);
      alert('Message sent successfully!');
      // Refresh messages
      setActiveTab('inbox'); // Switch to inbox or stay? Probably stay or refresh.
      // Trigger fetch
      const data = await messageService.getMessages(activeTab === 'archived');
      const staffMessages = data.filter(m => m.from?.role === 'admin' || m.from?.role === 'staff' || m.type === 'admin');
      setMessages(staffMessages);
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-[#fffaf4] rounded-lg shadow-sm min-h-[600px] p-6">
      {/* Error Message */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
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
          onSelect={(msg) => handleSelectMessage(msg as Message)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onCompose={() => setShowCompose(true)}
          loading={loading}
          currentUserId={(() => {
            try {
              const user = JSON.parse(localStorage.getItem('user') || '{}');
              return user._id || user.id;
            } catch (e) { return null; }
          })()}
        // No role filter for driver view in original code
        />
        <MessageDetail
          message={selectedMessage as any}
          onBack={closeDetail}
          onArchive={handleArchive as any}
          onRestore={handleUnarchive as any}
          isArchivedTab={activeTab === 'archived'}
          thread={selectedThread}
          currentUserId={(() => {
            try {
              const user = JSON.parse(localStorage.getItem('user') || '{}');
              return user._id || user.id;
            } catch (e) { return null; }
          })()}
          onSendReply={async (text) => {
            if (!selectedMessage) return;
            try {
              // Determine recipient
              let currentUserId: string | null = null;
              try {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                  const user = JSON.parse(userStr);
                  currentUserId = user._id || user.id;
                }
              } catch (e) { console.error('Error parsing user from local storage', e); }

              const recipientId = (selectedMessage.from._id === currentUserId)
                ? selectedMessage.to._id
                : selectedMessage.from._id;

              const newMessage = await messageService.sendMessage(
                recipientId,
                `Re: ${selectedMessage.subject}`,
                text
              );

              // 1. Append new message to the thread locally (Optimistic / Immediate update)
              setSelectedThread(prev => [...prev, newMessage]);

              // 2. Update the conversation list preview
              // We need to move this conversation to the top and update its preview snippet/time
              setMessages(prev => {
                // Remove the old conversation entry for this thread
                const otherMessages = prev.filter(m =>
                  !((m.from._id === recipientId && m.to._id === currentUserId) ||
                    (m.from._id === currentUserId && m.to._id === recipientId))
                );
                // Add the new message at the top as the new conversation preview
                return [newMessage, ...otherMessages];
              });

            } catch (err: any) {
              console.error('Error sending reply:', err);
              alert(`Failed to send reply: ${err.response?.data?.message || err.message}`);
            }
          }}
        />
      </MessageLayout>

      {/* Reply Modal */}
      {composingReply && selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-[#5E372E] mb-4">Reply to {selectedMessage.from.name}</h3>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your message here..."
              className="w-full border border-[#f3e7d9] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5E372E] mb-3"
              rows={5}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setComposingReply(false)
                  setReplyText('')
                }}
                className="px-4 py-2 border border-[#f3e7d9] text-[#5E372E] rounded-md hover:bg-[#f9f3eb] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReply}
                disabled={!replyText.trim()}
                className="px-4 py-2 bg-[#5E372E] text-white rounded-md hover:bg-[#6b453f] transition-colors disabled:opacity-50"
              >
                Send Reply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Message (Compose) Modal */}
      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-[#5E372E] mb-4">New Message</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="recipient-select" className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <select
                  id="recipient-select"
                  aria-label="Select message recipient"
                  value={recipientId}
                  onChange={(e) => setRecipientId(e.target.value)}
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
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
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
                  setSubject('')
                  setMessageBody('')
                  setRecipientId('')
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

export default MessagesPage

