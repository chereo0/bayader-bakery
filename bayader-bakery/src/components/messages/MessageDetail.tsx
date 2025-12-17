import React from 'react';

// Similar interface definition
interface MessageFull {
    _id: string;
    from: {
        _id: string;
        name: string;
        role: string;
        email: string;
    };
    to?: {
        _id: string;
        name: string;
    };
    subject: string;
    message?: string; // Admin messages use 'message'
    body?: string;    // Driver messages use 'body'
    createdAt: string;
    read: boolean;
    type: string;
}

interface MessageDetailProps {
    message: MessageFull | null;
    onBack: () => void;
    onReply?: (message: MessageFull) => void; // Kept for backward compat if needed, or to open full modal
    onSendReply?: (text: string) => Promise<void>; // NEW: For inline reply
    onArchive: (message: MessageFull) => void;
    onRestore: (message: MessageFull) => void;
    isArchivedTab: boolean;
    currentUserId?: string; // NEW: To determine message alignment
    thread?: MessageFull[]; // NEW: Conversation thread
}

export const MessageDetail: React.FC<MessageDetailProps> = ({
    message,
    onBack,
    onReply,
    onSendReply,
    onArchive,
    onRestore,
    isArchivedTab,
    thread,
    currentUserId
}) => {
    const [replyText, setReplyText] = React.useState('');
    const [sending, setSending] = React.useState(false);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [message, thread]);

    if (!message) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-[#efeae2] text-gray-400 bg-opacity-50"
                style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundBlendMode: 'overlay' }}
            >
                <div className="w-24 h-24 bg-white/50 rounded-full flex items-center justify-center mb-6 shadow-sm backdrop-blur-sm">
                    <svg className="w-12 h-12 opacity-40 text-[#5E372E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </div>
                <p className="text-lg font-medium text-gray-500">Select a conversation</p>
            </div>
        );
    }

    const content = message.message || message.body || '';

    const handleSend = async () => {
        if (!replyText.trim() || !onSendReply) return;
        setSending(true);
        try {
            await onSendReply(replyText);
            setReplyText('');
        } catch (error) {
            console.error(error);
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#efeae2]" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")' }}>
            {/* Chat Header */}
            <div className="px-4 py-3 bg-white border-b border-gray-200 flex-shrink-0 shadow-sm z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Mobile Back */}
                    <button
                        onClick={onBack}
                        className="lg:hidden text-gray-500 hover:text-[#5E372E] transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>

                    {/* Avatar & Name */}
                    {(() => {
                        // Determine partner to display in header
                        // specific logic: if message.from._id is ME, then I am talking to message.to
                        // otherwise I am talking to message.from
                        const isMe = currentUserId ? message.from._id === currentUserId : false;
                        const partner = isMe ? message.to : message.from;
                        // Fallback if 'to' is missing for some reason or just simple 'from'
                        const displayName = partner?.name || 'Unknown User';
                        const displayRole = partner?.role || 'User';

                        return (
                            <>
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold overflow-hidden shadow-inner">
                                    {displayName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h1 className="text-base font-bold text-gray-900 leading-tight">{displayName}</h1>
                                    <p className="text-xs text-[#5E372E] font-medium uppercase tracking-wide opacity-80">{displayRole}</p>
                                </div>
                            </>
                        );
                    })()}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {!isArchivedTab ? (
                        <button
                            onClick={() => onArchive(message)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                            title="Archive"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                        </button>
                    ) : (
                        <button
                            onClick={() => onRestore(message)}
                            className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-full transition-all"
                            title="Restore"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Chat Body - Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Time Divider */}
                <div className="flex justify-center my-4">
                    <span className="bg-[#e1f3fb] text-[#5E372E] text-xs px-2 py-1 rounded-md shadow-sm opacity-80 font-medium">
                        {new Date(message.createdAt).toLocaleString()}
                    </span>
                </div>

                {thread && thread.length > 0 ? (
                    thread.map((msg, index) => {
                        // Determine if message is from 'me' using currentUserId
                        const isMe = currentUserId ? msg.from._id === currentUserId : false;
                        const isIncoming = !isMe;

                        const msgContent = msg.message || msg.body || '';

                        return (
                            <div key={msg._id} className={`flex ${!isIncoming ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] lg:max-w-[70%] rounded-lg shadow-sm p-3 relative text-sm leading-relaxed ${!isIncoming
                                    ? 'bg-[#daf8cb] text-gray-900 rounded-tr-none'
                                    : 'bg-white text-gray-800 rounded-tl-none'
                                    }`}>
                                    <div className={`font-semibold text-xs mb-1 ${!isIncoming ? 'text-[#d17842] text-right' : 'text-[#d17842]'}`}>
                                        {!isIncoming ? 'You' : msg.from.name}
                                    </div>
                                    <div className="whitespace-pre-wrap">{msgContent}</div>
                                    <div className="flex justify-end mt-1 gap-1 items-center">
                                        <span className="text-[10px] text-gray-500">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {!isIncoming && (
                                            <span className={msg.read ? 'text-blue-500' : 'text-gray-400'}>
                                                {/* Double tick for read, single for sent (simplified) */}
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 15"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033L5.525 7.245a.364.364 0 0 0-.499-.01l-.41.38a.283.283 0 0 0-.004.417l3.655 3.565c.128.125.334.123.46-.004l6.342-7.803a.286.286 0 0 0-.06-.474z" /></svg>
                                            </span>
                                        )}
                                    </div>

                                    {/* Triangle */}
                                    <div className={`absolute top-0 w-0 h-0 border-t-[10px] ${!isIncoming
                                        ? '-right-2 border-t-[#daf8cb] border-r-[10px] border-r-transparent transform rotate-180 flip-x'
                                        : '-left-2 border-t-white border-l-[10px] border-l-transparent'
                                        }`}></div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    // Fallback to single message view if no thread (assume incoming for simplicity or use currentUserId if avail)
                    <div className="flex justify-start">
                        <div className="max-w-[85%] lg:max-w-[70%] bg-white rounded-lg rounded-tl-none shadow-sm p-3 relative text-gray-800 text-sm leading-relaxed">
                            <div className="font-semibold text-[#d17842] text-xs mb-1">{message.from.name}</div>
                            <div className="whitespace-pre-wrap">{message.message || message.body || ''}</div>
                            <div className="flex justify-end mt-1">
                                <span className="text-[10px] text-gray-400">{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="absolute top-0 -left-2 w-0 h-0 border-t-[10px] border-t-white border-l-[10px] border-l-transparent transform rotate-0"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Footer / Input Area */}
            {onSendReply && !isArchivedTab && (
                <div className="p-3 bg-[#f0f2f5] flex-shrink-0 flex items-end gap-2 border-t border-gray-200">
                    <div className="flex-1 bg-white rounded-2xl flex items-center shadow-sm border border-transparent focus-within:border-[#5E372E] transition-colors relative">
                        <div className="px-2">
                            <svg className="w-6 h-6 text-gray-400 cursor-pointer hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            className="flex-1 max-h-32 min-h-[44px] py-3 px-2 focus:outline-none bg-transparent resize-none text-sm text-gray-800"
                            rows={1}
                            style={{ height: 'auto', overflow: 'hidden' }}
                        />
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={sending || !replyText.trim()}
                        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-sm flex-shrink-0 ${replyText.trim() ? 'bg-[#5E372E] text-white hover:bg-[#6b453f] transform hover:scale-105' : 'bg-gray-200 text-gray-400'
                            }`}
                    >
                        {sending ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <svg className="w-5 h-5 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};
