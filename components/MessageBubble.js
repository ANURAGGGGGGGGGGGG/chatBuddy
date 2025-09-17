'use client';

import { useState } from 'react';
import { MoreVertical, Reply, Smile, Copy, Trash2 } from 'lucide-react';
import Image from 'next/image';

export default function MessageBubble({ message, isOwn, showAvatar }) {
  const [showActions, setShowActions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
    setShowMenu(false);
  };

  const handleReply = () => {
    // Handle reply functionality
    console.log('Reply to message:', message._id);
    setShowMenu(false);
  };

  const handleDelete = () => {
    // Handle delete functionality
    console.log('Delete message:', message._id);
    setShowMenu(false);
  };

  const handleReaction = (emoji) => {
    // Handle reaction functionality
    console.log('Add reaction:', emoji, 'to message:', message._id);
  };

  return (
    <div 
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowMenu(false);
      }}
    >
      <div className={`flex max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
        {/* Avatar */}
        {!isOwn && (
          <div className="flex-shrink-0">
            {showAvatar ? (
              <div className="h-8 w-8 bg-white/10 border border-white/10 rounded-full flex items-center justify-center text-slate-300">
                <span className="text-xs font-medium">
                  {message.sender?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            ) : (
              <div className="h-8 w-8"></div>
            )}
          </div>
        )}

        {/* Message Content */}
        <div className={`relative ${isOwn ? 'mr-2' : 'ml-2'}`}>
          {/* Sender name (for group chats) */}
          {!isOwn && showAvatar && (
            <p className="text-xs text-slate-400 mb-1 px-3">
              {message.sender?.name || 'Unknown User'}
            </p>
          )}

          {/* Message bubble */}
          <div
            className={`relative px-4 py-2 rounded-2xl shadow-sm ${
              isOwn
                ? 'bg-sky-600/90 text-white rounded-br-md'
                : 'bg-white/10 text-slate-100 border border-white/10 rounded-bl-md backdrop-blur'
            }`}
          >
            {/* Reply indicator */}
            {message.replyTo && (
              <div className={`text-xs mb-2 p-2 rounded border-l-2 ${
                isOwn 
                  ? 'bg-sky-500/60 border-sky-300 text-sky-50'
                  : 'bg-white/5 border-white/20 text-slate-300'
              }`}>
                <p className="font-medium">Replying to {message.replyTo.sender?.name}</p>
                <p className="truncate">{message.replyTo.content}</p>
              </div>
            )}

            {/* Message content */}
            <div className="break-words">
              {message.type === 'text' ? (
                <p className="whitespace-pre-wrap">{message.content}</p>
              ) : message.type === 'image' ? (
                <div>
                  {message.attachment?.url ? (
                    <Image
                      src={message.attachment.url}
                      alt={message.attachment?.originalName || 'Shared image'}
                      width={800}
                      height={600}
                      sizes="(max-width: 768px) 100vw, 600px"
                      className="max-w-full h-auto rounded-lg mb-2 border border-white/10"
                      unoptimized
                    />
                  ) : null}
                  {message.content && <p>{message.content}</p>}
                </div>
              ) : message.type === 'file' ? (
                <div className="flex items-center space-x-2">
                  <div className="bg-white/5 p-2 rounded border border-white/10">
                    <span className="text-sm font-medium text-slate-100">{message.attachment?.originalName}</span>
                  </div>
                  {message.content && <p>{message.content}</p>}
                </div>
              ) : (
                <p className="italic text-slate-300">{message.content}</p>
              )}
            </div>

            {/* Reactions */}
            {message.reactions && message.reactions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {message.reactions.reduce((acc, reaction) => {
                  const existing = acc.find(r => r.emoji === reaction.emoji);
                  if (existing) {
                    existing.count++;
                    existing.users.push(reaction.user);
                  } else {
                    acc.push({
                      emoji: reaction.emoji,
                      count: 1,
                      users: [reaction.user]
                    });
                  }
                  return acc;
                }, []).map((reaction, index) => (
                  <button
                    key={index}
                    onClick={() => handleReaction(reaction.emoji)}
                    className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                      isOwn
                        ? 'bg-sky-500/70 border-sky-400 text-white hover:bg-sky-500'
                        : 'bg-white/10 border-white/10 text-slate-200 hover:bg-white/20'
                    }`}
                  >
                    {reaction.emoji} {reaction.count}
                  </button>
                ))}
              </div>
            )}

            {/* Timestamp */}
            <p className={`text-[10px] mt-1 ${
              isOwn ? 'text-sky-100/90' : 'text-slate-300'
            }`}>
              {formatTime(message.createdAt)}
              {message.isEdited && ' (edited)'}
            </p>
          </div>

          {/* Message Actions */}
          {showActions && (
            <div className={`absolute top-0 ${isOwn ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} flex items-center space-x-1 bg-white/10 border border-white/10 rounded-lg shadow-lg px-2 py-1 backdrop-blur`}> 
              <button
                onClick={() => handleReaction('👍')}
                className="p-1 hover:bg-white/10 rounded text-slate-300 hover:text-white"
                title="Like"
              >
                <span className="text-sm">👍</span>
              </button>
              <button
                onClick={handleReply}
                className="p-1 hover:bg-white/10 rounded text-slate-300 hover:text-white"
                title="Reply"
              >
                <Reply className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-white/10 rounded text-slate-300 hover:text-white"
                title="More options"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Context Menu */}
          {showMenu && (
            <div className={`absolute top-8 ${isOwn ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} bg-white/10 border border-white/10 rounded-lg shadow-lg py-1 z-10 min-w-[140px] backdrop-blur`}> 
              <button
                onClick={handleCopyMessage}
                className="w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/10 flex items-center space-x-2"
              >
                <Copy className="h-4 w-4" />
                <span>Copy</span>
              </button>
              <button
                onClick={handleReply}
                className="w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/10 flex items-center space-x-2"
              >
                <Reply className="h-4 w-4" />
                <span>Reply</span>
              </button>
              {isOwn && (
                <button
                  onClick={handleDelete}
                  className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}