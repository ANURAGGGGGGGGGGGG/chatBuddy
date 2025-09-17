'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Menu, 
  Phone, 
  Video, 
  MoreVertical,
  Users,
  Hash,
  ArrowDown
} from 'lucide-react';
import MessageBubble from './MessageBubble';
import FileUploadDialog from './FileUploadDialog';
import { useSocket } from '../contexts/SocketContext';

export default function ChatWindow({ user, selectedRoom, isSidebarOpen, onToggleSidebar }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFileDialog, setShowFileDialog] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const scrollContainerRef = useRef(null);
  // Emoji picker state
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  
  const { 
    isConnected, 
    joinRoom, 
    leaveRoom, 
    sendMessage, 
    onNewMessage, 
    startTyping, 
    stopTyping, 
    typingUsers,
    markMessagesAsRead
  } = useSocket();

  // Define fetchMessages BEFORE any effect that references it to avoid TDZ in production
  const fetchMessages = useCallback(async () => {
    if (!selectedRoom) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/messages?roomId=${selectedRoom._id}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedRoom]);

  useEffect(() => {
    if (selectedRoom) {
      fetchMessages();
      
      // Join the room for real-time updates
      if (isConnected) {
        joinRoom(selectedRoom._id);
      }
      
      // Cleanup: leave room when component unmounts or room changes
      return () => {
        if (isConnected && selectedRoom) {
          leaveRoom(selectedRoom._id);
        }
      };
    }
  }, [selectedRoom, isConnected, joinRoom, leaveRoom, fetchMessages]);
  
  // Listen for new messages
  useEffect(() => {
    if (!selectedRoom) return;
    
    const unsubscribe = onNewMessage((messageData) => {
      setMessages(prev => [...prev, messageData]);
      
      // Mark message as read if window is focused
      if (document.hasFocus()) {
        markMessagesAsRead(selectedRoom._id, [messageData._id]);
      }
    });
    
    return unsubscribe;
  }, [selectedRoom, onNewMessage, markMessagesAsRead]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const onScroll = () => {
      const threshold = 120;
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
      setShowScrollToBottom(!nearBottom);
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // Close emoji picker on outside click or Escape
  useEffect(() => {
    if (!showEmojiPicker) return;
    const handleClickOutside = (e) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target)
      ) {
        setShowEmojiPicker(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setShowEmojiPicker(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showEmojiPicker]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedRoom) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setShowEmojiPicker(false);
    
    // Stop typing indicator
    if (isTyping) {
      stopTyping(selectedRoom._id);
      setIsTyping(false);
    }

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: messageText,
          roomId: selectedRoom._id,
          type: 'text'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.message]);
        
        // Send real-time message to other users
        if (isConnected) {
          sendMessage(selectedRoom._id, data.message);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageText); // Restore message on error
    }
  };

  // Insert emoji at the current caret position in textarea
  const insertEmoji = (emoji) => {
    const textarea = inputRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart ?? newMessage.length;
    const end = textarea.selectionEnd ?? newMessage.length;
    const before = newMessage.slice(0, start);
    const after = newMessage.slice(end);
    const next = `${before}${emoji}${after}`;
    setNewMessage(next);
    // restore focus and caret position
    requestAnimationFrame(() => {
      textarea.focus();
      const pos = start + emoji.length;
      textarea.selectionStart = pos;
      textarea.selectionEnd = pos;
    });
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    // Handle typing indicators
    if (isConnected && selectedRoom) {
      if (!isTyping) {
        setIsTyping(true);
        startTyping(selectedRoom._id);
      }
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        stopTyping(selectedRoom._id);
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (!selectedRoom) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-slate-900/40 to-slate-900/0">
        <div className="text-center">
          <div className="bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-amber-400 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center ring-1 ring-white/30 shadow-lg shadow-fuchsia-900/20 backdrop-blur">
            <Hash className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Welcome to ChatBuddy</h3>
          <p className="text-slate-300">Select a room to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-gradient-to-b from-white/10 to-white/0 border-b border-white/10 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {!isSidebarOpen && (
              <button
                onClick={onToggleSidebar}
                className="p-1 hover:bg-white/10 rounded-md lg:hidden"
              >
                <Menu className="h-5 w-5 text-slate-300" />
              </button>
            )}
            <div className="flex items-center space-x-3">
              {/* Replace icon container with gradient brand block */}
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-amber-400 ring-1 ring-white/20" />
              <div>
                <h2 className="text-lg font-semibold text-white">{selectedRoom.name}</h2>
                <p className="text-sm text-slate-300">
                  {selectedRoom.members?.length || 0} members · {isConnected ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-white/10 rounded-md" title="Voice call">
              <Phone className="h-4 w-4 text-slate-300" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-md" title="Video call">
              <Video className="h-4 w-4 text-slate-300" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-md" title="More options">
              <MoreVertical className="h-4 w-4 text-slate-300" />
            </button>
          </div>
        </div>
        {/* Typing indicator */}
        {typingUsers?.[selectedRoom._id]?.length > 0 && (
          <div className="mt-2">
            <span className="inline-flex items-center gap-2 text-xs text-slate-300 bg-white/5 border border-white/10 px-2 py-1 rounded-full">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-.3s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:.3s]"></span>
              </span>
              {typingUsers[selectedRoom._id].length === 1 ? 'Someone is typing' : `${typingUsers[selectedRoom._id].length} people are typing`}
            </span>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 py-6 bg-gradient-to-b from-slate-900/20 via-slate-900/10 to-transparent">
        <div className="max-w-3xl mx-auto">
          {/* Empty state banner */}
          {messages.length === 0 && (
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                {isConnected ? 'Connected' : 'Reconnecting...'}
              </div>
            </div>
          )}

          {/* Message list */}
          <div className="space-y-4">
            {messages.map((msg) => (
              <MessageBubble
                key={msg._id}
                message={msg}
                isOwn={msg.sender?.email === user.email}
                showAvatar={true}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Scroll to bottom button */}
        {showScrollToBottom && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-28 right-6 p-2 rounded-full bg-white/10 border border-white/10 hover:bg-white/20 backdrop-blur-xl"
            title="Scroll to latest"
          >
            <ArrowDown className="h-5 w-5 text-slate-200" />
          </button>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-white/10 bg-white/5 backdrop-blur-xl">
        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <div className="bg-white/10 border border-white/10 rounded-xl px-4 py-2 focus-within:ring-2 focus-within:ring-sky-500/40">
                <textarea
                  ref={inputRef}
                  value={newMessage}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPress}
                  placeholder={`Message ${selectedRoom ? '#' + selectedRoom.name : ''}`}
                  rows={1}
                  className="w-full resize-none bg-transparent outline-none text-slate-100 placeholder:text-slate-400"
                />
              </div>
            </div>
            {/* Actions with Emoji Picker */}
            <div className="relative flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowEmojiPicker((v) => !v)}
                className="p-2 hover:bg-white/10 rounded-md"
                title="Insert emoji"
                aria-haspopup="dialog"
                aria-expanded={showEmojiPicker}
                aria-controls="emoji-popover"
              >
                <Smile className="h-5 w-5 text-slate-300" />
              </button>
              <button
                type="button"
                onClick={() => setShowFileDialog(true)}
                className="p-2 hover:bg-white/10 rounded-md"
                title="Attach file"
              >
                <Paperclip className="h-5 w-5 text-slate-300" />
              </button>
              <button type="submit" className="px-3 py-2 rounded-md bg-sky-600 text-white hover:bg-sky-500">
                <Send className="h-4 w-4" />
              </button>

              {showEmojiPicker && (
                <div
                  id="emoji-popover"
                  ref={emojiPickerRef}
                  role="dialog"
                  aria-label="Emoji picker"
                  className="absolute bottom-12 right-0 z-20 w-64 max-h-64 overflow-y-auto rounded-xl bg-slate-900/95 border border-white/10 p-2 shadow-xl backdrop-blur"
                >
                  <div className="px-2 pb-2 text-xs text-slate-300">Pick an emoji</div>
                  <div className="grid grid-cols-8 gap-1">
                    {['😀','😁','😂','🤣','😊','😍','😎','😅','😉','🙂','🙃','😇','🤩','😘','😗','😙','😚','🤗','🤔','🤨','😐','😑','😶','🙄','😏','😴','🤤','😪','😮','😯','😲','🥱','😳','😤','😡','😢','😭','😱','👍','👎','👌','🙏','👏','🙌','🤝','💪','🔥','✨','🎉','❤️','💙','💚','💛','💜','🧡','💖','😷','🤒','🤕','🤧','🤠','🥳','🥰','🤤','🫶','🤝','🤟','✌️'].map((emoji, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="h-8 w-8 flex items-center justify-center rounded hover:bg-white/10 text-lg"
                        onClick={() => {
                          insertEmoji(emoji);
                          // keep open for multiple selections; comment next line to keep open
                          setShowEmojiPicker(false);
                        }}
                        aria-label={`Insert ${emoji}`}
                        title={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* File Upload Dialog */}
      {showFileDialog && (
        <FileUploadDialog onClose={() => setShowFileDialog(false)} />
      )}
    </div>
  );
}