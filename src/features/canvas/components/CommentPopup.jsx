import React, { useState, useRef, useEffect } from 'react';
import { Send, X, User, MessageCircle, Clock } from 'lucide-react';

const CommentPopup = ({
    element,
    currentUser,
    onClose,
    onSendComment,
    position
}) => {
    const [commentText, setCommentText] = useState('');
    const scrollRef = useRef(null);

    // Auto-scroll to bottom when comments change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [element.comments]);

    const handleSend = () => {
        if (commentText.trim()) {
            onSendComment(element.id, {
                id: Date.now().toString(),
                text: commentText,
                user: currentUser?.email || 'User',
                timestamp: new Date().toISOString()
            });
            setCommentText('');
        }
    };

    if (!element) return null;

    const comments = element.comments || [];

    return (
        <div
            className="fixed bg-white rounded-xl shadow-2xl border border-gray-100 w-80 overflow-hidden animate-slideUp flex flex-col"
            style={{
                left: position.left,
                top: position.top,
                zIndex: 3000,
                transform: 'translate(-50%, -100%) translateY(-20px)',
                maxHeight: '400px'
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                        <MessageCircle size={14} className="text-purple-600" />
                    </div>
                    <span className="text-xs font-semibold text-gray-700">Comments</span>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
                    <X size={16} />
                </button>
            </div>

            {/* Comments List */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 max-h-60 custom-scrollbar"
            >
                {comments.length === 0 ? (
                    <div className="text-center py-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2">
                            <MessageCircle size={20} className="text-gray-300" />
                        </div>
                        <p className="text-xs text-gray-400">No comments yet. Start a discussion!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-600 text-[10px] uppercase font-bold border border-blue-200">
                                {(comment.user || 'U').charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                    <span className="text-xs font-bold text-gray-900 truncate pr-2">
                                        {comment.user?.split('@')[0]}
                                    </span>
                                    <span className="text-[10px] text-gray-400 flex items-center gap-1 flex-shrink-0">
                                        <Clock size={10} />
                                        {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-2 border border-gray-100/50">
                                    <p className="text-xs text-gray-700 leading-relaxed break-words">{comment.text}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input area */}
            <div className="p-3 border-t border-gray-100 bg-white">
                <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex-shrink-0 flex items-center justify-center text-white text-[10px] uppercase font-bold shadow-sm">
                        {(currentUser?.email || 'U').charAt(0)}
                    </div>
                    <div className="flex-1 relative">
                        <textarea
                            autoFocus
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Write a reply..."
                            className="w-full text-sm border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-purple-200 focus:border-purple-400 outline-none resize-none transition-all pr-10"
                            rows="2"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!commentText.trim()}
                            className="absolute right-2 bottom-2 text-purple-600 hover:text-purple-700 disabled:text-gray-300 transition-colors"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommentPopup;
