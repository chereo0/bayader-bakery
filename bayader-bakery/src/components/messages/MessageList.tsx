import React from 'react';

// Define the Message interface here to avoid circular dependencies or massive imports
// Ideally, this should be in a types file, but for now we'll keep it self-contained or import if available.
// We'll mimic the structure used in the pages.
interface MessagePreview {
    _id: string;
    from: {
        _id: string;
        name: string;
        email: string;
        role: string;
    };
    to?: {
        _id: string;
        name: string;
        role: string;
    };
    subject: string;
    message?: string;
    body?: string;
    createdAt: string;
    updatedAt?: string;
    read: boolean;
    type: string;
}

interface MessageListProps {
    messages: MessagePreview[];
    selectedId?: string;
    onSelect: (message: MessagePreview) => void;
    activeTab: 'inbox' | 'archived';
    onTabChange: (tab: 'inbox' | 'archived') => void;
    roleFilter?: string;
    onRoleFilterChange?: (role: string) => void;
    onCompose?: () => void;
    loading: boolean;
    filterOptions?: { label: string; value: string }[];
    currentUserId?: string;
}

export const MessageList: React.FC<MessageListProps> = ({
    messages,
    selectedId,
    onSelect,
    activeTab,
    onTabChange,
    roleFilter,
    onRoleFilterChange,
    onCompose,
    loading,
    filterOptions,
    currentUserId
}) => {
    // ... formatTime ...
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (days < 7) {
            return date.toLocaleDateString([], { weekday: 'short' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    const getMessageIcon = (role: string) => {
        switch (role?.toLowerCase()) {
            case 'admin':
                return (
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                );
            case 'staff':
                return (
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                );
            case 'driver':
                return (
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                );
        }
    };

    // Helper logic to get valid user from localStorage if not passed
    const getUserId = () => {
        if (currentUserId) return currentUserId;
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                return user._id || user.id;
            }
        } catch (e) { console.error(e); }
        return null;
    }

    const myId = getUserId();

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header Section */}
            <div className="p-4 border-b border-[#f3e7d9]">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-[#5E372E]">Messages</h2>
                    {onCompose && (
                        <button
                            onClick={onCompose}
                            className="p-2 bg-[#5E372E] text-white rounded-full hover:bg-[#6b453f] transition-colors shadow-sm"
                            title="Compose New Message"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Tabs */}
                {/* ... (tabs code kept same) ... */}
                <div className="flex bg-gray-100 p-1 rounded-lg mb-3">
                    <button
                        onClick={() => onTabChange('inbox')}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'inbox'
                            ? 'bg-white text-[#5E372E] shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Inbox
                    </button>
                    <button
                        onClick={() => onTabChange('archived')}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'archived'
                            ? 'bg-white text-[#5E372E] shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Archived
                    </button>
                </div>

                {/* Filters (Optional) */}
                {filterOptions && onRoleFilterChange && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <button
                            onClick={() => onRoleFilterChange('all')}
                            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${roleFilter === 'all'
                                ? 'bg-[#5E372E] text-white border-[#5E372E]'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            All
                        </button>
                        {filterOptions.map(option => (
                            <button
                                key={option.value}
                                onClick={() => onRoleFilterChange(option.value)}
                                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${roleFilter === option.value
                                    ? 'bg-[#5E372E] text-white border-[#5E372E]'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5E372E]"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <svg className="w-12 h-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-sm">No messages found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {messages.map((message) => {
                            const isMe = message.from._id === myId;
                            // If I am the sender, show the recipient name. Otherwise show sender name.
                            // Ensure message.to exists before accessing properties.
                            const displayName = isMe ? (message.to?.name || 'Unknown Recipient') : message.from.name;
                            const displayRole = isMe ? (message.to?.role || 'User') : message.from.role;

                            return (
                                <div
                                    key={message._id}
                                    onClick={() => onSelect(message)}
                                    className={`p-4 cursor-pointer transition-all hover:bg-[#fffaf4] ${selectedId === message._id ? 'bg-[#fffaf4] border-l-4 border-l-[#5E372E]' : 'border-l-4 border-l-transparent'
                                        } ${!message.read ? 'bg-white' : 'bg-gray-50/50'}`}
                                >
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 mt-1">
                                            {getMessageIcon(displayRole)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className={`text-sm truncate mr-2 ${!message.read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                    {displayName}
                                                </h4>
                                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                                    {formatTime(message.createdAt)}
                                                </span>
                                            </div>
                                            <p className={`text-sm truncate mb-1 ${!message.read ? 'text-[#5E372E] font-semibold' : 'text-gray-600'}`}>
                                                {isMe && <span className="text-xs text-gray-400 mr-1">You:</span>}
                                                {message.message || message.body || message.subject}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 capitalize">
                                                    {displayRole}
                                                </span>
                                                {!message.read && !isMe && (
                                                    <span className="w-2 h-2 rounded-full bg-[#5E372E]"></span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
