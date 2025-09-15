'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { data: session, status } = useSession();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Map());

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      // Initialize socket connection
      const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin, {
        auth: {
          token: session.accessToken
        },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      // Connection event handlers
      socketInstance.on('connect', () => {
        console.log('Connected to Socket.IO server');
        setIsConnected(true);
      });

      socketInstance.on('disconnect', () => {
        console.log('Disconnected from Socket.IO server');
        setIsConnected(false);
        setOnlineUsers(new Set());
        setTypingUsers(new Map());
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      // User presence handlers
      socketInstance.on('user-online', (data) => {
        setOnlineUsers(prev => new Set([...prev, data.userId]));
      });

      socketInstance.on('user-offline', (data) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
        
        // Remove from typing users
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          newMap.delete(data.userId);
          return newMap;
        });
      });

      // Typing indicators
      socketInstance.on('user-typing', (data) => {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          if (data.isTyping) {
            newMap.set(data.userId, data.email);
          } else {
            newMap.delete(data.userId);
          }
          return newMap;
        });
      });

      setSocket(socketInstance);

      // Cleanup on unmount
      return () => {
        socketInstance.disconnect();
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers(new Set());
        setTypingUsers(new Map());
      };
    }
  }, [session, status]);

  // Socket utility functions
  const joinRoom = (roomId) => {
    if (socket && isConnected) {
      socket.emit('join-room', roomId);
    }
  };

  const leaveRoom = (roomId) => {
    if (socket && isConnected) {
      socket.emit('leave-room', roomId);
    }
  };

  const sendMessage = (roomId, message) => {
    if (socket && isConnected) {
      socket.emit('send-message', { roomId, message });
    }
  };

  const startTyping = (roomId) => {
    if (socket && isConnected) {
      socket.emit('typing-start', { roomId });
    }
  };

  const stopTyping = (roomId) => {
    if (socket && isConnected) {
      socket.emit('typing-stop', { roomId });
    }
  };

  const addReaction = (roomId, messageId, reaction) => {
    if (socket && isConnected) {
      socket.emit('message-reaction', {
        roomId,
        messageId,
        reaction,
        action: 'add'
      });
    }
  };

  const removeReaction = (roomId, messageId, reaction) => {
    if (socket && isConnected) {
      socket.emit('message-reaction', {
        roomId,
        messageId,
        reaction,
        action: 'remove'
      });
    }
  };

  const markMessagesAsRead = (roomId, messageIds) => {
    if (socket && isConnected) {
      socket.emit('message-read', { roomId, messageIds });
    }
  };

  // Subscribe to events
  const onNewMessage = (callback) => {
    if (socket) {
      socket.on('new-message', callback);
      return () => socket.off('new-message', callback);
    }
  };

  const onMessageReaction = (callback) => {
    if (socket) {
      socket.on('message-reaction-update', callback);
      return () => socket.off('message-reaction-update', callback);
    }
  };

  const onMessagesRead = (callback) => {
    if (socket) {
      socket.on('messages-read', callback);
      return () => socket.off('messages-read', callback);
    }
  };

  const value = {
    socket,
    isConnected,
    onlineUsers,
    typingUsers,
    // Room management
    joinRoom,
    leaveRoom,
    // Messaging
    sendMessage,
    onNewMessage,
    // Typing indicators
    startTyping,
    stopTyping,
    // Reactions
    addReaction,
    removeReaction,
    onMessageReaction,
    // Read receipts
    markMessagesAsRead,
    onMessagesRead
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;