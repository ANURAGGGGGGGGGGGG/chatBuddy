'use client';

import { useState, useEffect, useRef } from 'react';
import { signOut } from 'next-auth/react';
import { 
  MessageCircle, 
  Plus, 
  Search, 
  Settings, 
  LogOut, 
  Users, 
  Hash,
  ChevronLeft,
  MoreVertical
} from 'lucide-react';

export default function ChatSidebar({ user, selectedRoom, onRoomSelect, onToggleSidebar }) {
  const [rooms, setRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [compactSidebar, setCompactSidebar] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const settingsCloseBtnRef = useRef(null);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [newRoomType, setNewRoomType] = useState('public');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [createRoomError, setCreateRoomError] = useState('');
  const createNameInputRef = useRef(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  // Load preferences
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('chatbuddy:prefs') || '{}');
      if (stored.compactSidebar !== undefined) setCompactSidebar(!!stored.compactSidebar);
      if (stored.highContrast !== undefined) setHighContrast(!!stored.highContrast);
    } catch {}
  }, []);

  // Persist preferences
  useEffect(() => {
    const prefs = { compactSidebar, highContrast };
    try {
      localStorage.setItem('chatbuddy:prefs', JSON.stringify(prefs));
    } catch {}
  }, [compactSidebar, highContrast]);

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms');
      if (response.ok) {
        const data = await response.json();
        setRooms(data.rooms || []);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' });
  };

  // Derived classes based on settings
  const containerBg = highContrast ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10';
  const itemPadding = compactSidebar ? 'p-2' : 'p-3';
  const iconSize = compactSidebar ? 'h-7 w-7' : 'h-8 w-8';
  const nameTextSize = compactSidebar ? 'text-[13px]' : 'text-sm';
  const metaTextSize = compactSidebar ? 'text-[11px]' : 'text-xs';

  // Focus first focusable in dialog when opened (Settings)
  useEffect(() => {
    if (showSettings) {
      const t = setTimeout(() => {
        settingsCloseBtnRef.current?.focus();
      }, 0);
      return () => clearTimeout(t);
    }
  }, [showSettings]);

  // Focus room name input when Create Room opens
  useEffect(() => {
    if (showCreateRoom) {
      const t = setTimeout(() => {
        createNameInputRef.current?.focus();
      }, 0);
      return () => clearTimeout(t);
    }
  }, [showCreateRoom]);

  const handleDialogKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSettings(false);
    }
  };

  const resetCreateRoomForm = () => {
    setNewRoomName('');
    setNewRoomDescription('');
    setNewRoomType('public');
    setCreateRoomError('');
  };

  const handleCreateRoom = async (e) => {
    e?.preventDefault?.();
    if (isCreatingRoom) return;

    const name = newRoomName.trim();
    const description = newRoomDescription.trim();

    if (!name) {
      setCreateRoomError('Room name is required');
      return;
    }

    setIsCreatingRoom(true);
    setCreateRoomError('');
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, type: newRoomType }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCreateRoomError(data?.error || 'Failed to create room');
        return;
      }

      const created = data.room;
      if (created) {
        setRooms((prev) => [created, ...prev]);
        onRoomSelect?.(created);
      }
      resetCreateRoomForm();
      setShowCreateRoom(false);
    } catch (err) {
      setCreateRoomError('Network error. Please try again.');
    } finally {
      setIsCreatingRoom(false);
    }
  };

  return (
    <div className={`h-full ${containerBg} text-slate-200 border-r backdrop-blur-xl flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {/* Gradient logo to match homepage */}
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-amber-400 ring-1 ring-white/20" />
            <h1 className="text-xl font-bold text-white">ChatBuddy</h1>
          </div>
          <button
            onClick={onToggleSidebar}
            className="p-1 hover:bg-white/10 rounded-md lg:hidden"
          >
            <ChevronLeft className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search rooms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/40"
          />
        </div>
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Rooms</h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowCreateRoom(true)}
                className="p-1 hover:bg-white/10 rounded-md"
                title="Create new room"
              >
                <Plus className="h-4 w-4 text-slate-300" />
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-white/10 border border-white/10 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">
                {searchTerm ? 'No rooms found' : 'No rooms yet'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowCreateRoom(true)}
                  className="mt-2 text-sm font-semibold bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-amber-400 bg-clip-text text-transparent hover:opacity-90"
                >
                  Create your first room
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredRooms.map((room) => (
                <button
                  key={room._id}
                  onClick={() => onRoomSelect(room)}
                  className={`w-full flex items-center space-x-3 ${itemPadding} rounded-lg text-left transition-colors border border-transparent hover:bg-white/5 hover:border-white/10 ${
                    selectedRoom?._id === room._id ? 'bg-sky-500/10 border-sky-500/30' : ''
                  }`}
                >
                  <div className="flex-shrink-0">
                    {room.type === 'direct' ? (
                      <div className={`bg-white/10 border border-white/10 rounded-full flex items-center justify-center ${iconSize}`}>
                        <Users className="h-4 w-4 text-slate-300" />
                      </div>
                    ) : (
                      <div className={`bg-sky-500/10 border border-sky-500/30 rounded-lg flex items-center justify-center ${iconSize}`}>
                        <Hash className="h-4 w-4 text-sky-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`${nameTextSize} font-medium text-slate-200 truncate`}>
                      {room.name}
                    </p>
                    <p className={`${metaTextSize} text-slate-400 truncate`}>
                      {room.members?.length || 0} members
                    </p>
                  </div>
                  {room.unreadCount > 0 && (
                    <div className="bg-sky-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {room.unreadCount}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-gradient-to-br from-sky-500 to-indigo-500 rounded-full flex items-center justify-center ring-2 ring-white/20">
            <span className="text-white text-sm font-medium">
              {user.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{user.name}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
          <div className="flex space-x-1">
            <button
              className="p-1 hover:bg-white/10 rounded-md"
              title="Settings"
              aria-haspopup="dialog"
              aria-controls="settings-dialog"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-4 w-4 text-slate-400" />
            </button>
            <button
              onClick={handleSignOut}
              className="p-1 hover:bg-white/10 rounded-md"
              title="Sign out"
            >
              <LogOut className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          onKeyDown={handleDialogKeyDown}
        >
          <div
            id="settings-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            aria-describedby="settings-desc"
            className="bg-white/10 border border-white/10 rounded-xl w-[440px] max-w-full mx-4 text-slate-200 shadow-2xl"
          >
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 id="settings-title" className="text-lg font-semibold">Settings</h3>
                <p id="settings-desc" className="text-sm text-slate-300">Personalize your sidebar experience</p>
              </div>
              <button
                ref={settingsCloseBtnRef}
                onClick={() => setShowSettings(false)}
                className="px-3 py-1.5 text-slate-300 hover:text-white rounded-md hover:bg-white/10"
                aria-label="Close settings"
              >
                Close
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Compact sidebar toggle */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-100">Compact sidebar</p>
                  <p className="text-sm text-slate-300">Smaller paddings and icons in the room list</p>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={compactSidebar}
                    onChange={(e) => setCompactSidebar(e.target.checked)}
                  />
                  <span className={`w-10 h-6 rounded-full transition-colors ${compactSidebar ? 'bg-sky-600' : 'bg-white/20'} relative`}>
                    <span className={`absolute top-1 left-1 h-4 w-4 bg-white rounded-full transition-transform ${compactSidebar ? 'translate-x-4' : ''}`}></span>
                  </span>
                </label>
              </div>

              {/* High contrast toggle */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-100">High contrast</p>
                  <p className="text-sm text-slate-300">Stronger borders and a brighter sidebar backdrop</p>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={highContrast}
                    onChange={(e) => setHighContrast(e.target.checked)}
                  />
                  <span className={`w-10 h-6 rounded-full transition-colors ${highContrast ? 'bg-sky-600' : 'bg-white/20'} relative`}>
                    <span className={`absolute top-1 left-1 h-4 w-4 bg-white rounded-full transition-transform ${highContrast ? 'translate-x-4' : ''}`}></span>
                  </span>
                </label>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-slate-300 hover:text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Room Modal */}
      {showCreateRoom && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-room-title"
            className="bg-white/10 border border-white/10 rounded-xl w-[520px] max-w-full mx-4 text-slate-200 shadow-2xl"
          >
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 id="create-room-title" className="text-lg font-semibold">Create New Room</h3>
                <p className="text-sm text-slate-300">Start a new conversation space</p>
              </div>
              <button
                onClick={() => { setShowCreateRoom(false); resetCreateRoomForm(); }}
                className="px-3 py-1.5 text-slate-300 hover:text-white rounded-md hover:bg-white/10"
                aria-label="Close create room"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="p-5 space-y-5">
              <div>
                <label htmlFor="room-name" className="block text-sm font-medium text-slate-200">Room name</label>
                <input
                  id="room-name"
                  ref={createNameInputRef}
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="e.g. general, design, team-frontend"
                  className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/40 px-3 py-2"
                  maxLength={100}
                  required
                />
                <p className="mt-1 text-xs text-slate-400">Max 100 characters</p>
              </div>

              <div>
                <label htmlFor="room-description" className="block text-sm font-medium text-slate-200">Description (optional)</label>
                <textarea
                  id="room-description"
                  value={newRoomDescription}
                  onChange={(e) => setNewRoomDescription(e.target.value)}
                  placeholder="What is this room about?"
                  className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/40 px-3 py-2"
                  rows={3}
                  maxLength={500}
                />
                <p className="mt-1 text-xs text-slate-400">Up to 500 characters</p>
              </div>

              <div>
                <p className="block text-sm font-medium text-slate-200 mb-2">Room type</p>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`rounded-lg border px-3 py-2 cursor-pointer ${newRoomType === 'public' ? 'border-sky-500/50 bg-sky-500/10' : 'border-white/10 bg-white/5'}`}>
                    <input
                      type="radio"
                      name="room-type"
                      value="public"
                      checked={newRoomType === 'public'}
                      onChange={() => setNewRoomType('public')}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">Public</span>
                    <p className="text-xs text-slate-400">Visible to members in your workspace</p>
                  </label>
                  <label className={`rounded-lg border px-3 py-2 cursor-pointer ${newRoomType === 'private' ? 'border-sky-500/50 bg-sky-500/10' : 'border-white/10 bg-white/5'}`}>
                    <input
                      type="radio"
                      name="room-type"
                      value="private"
                      checked={newRoomType === 'private'}
                      onChange={() => setNewRoomType('private')}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">Private</span>
                    <p className="text-xs text-slate-400">Only invited members can see and join</p>
                  </label>
                </div>
              </div>

              {createRoomError && (
                <div className="text-sm text-rose-400">
                  {createRoomError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowCreateRoom(false); resetCreateRoomForm(); }}
                  className="px-4 py-2 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingRoom || newRoomName.trim().length === 0}
                  className={`px-4 py-2 rounded-md text-white disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-amber-400 hover:opacity-90`}
                >
                  {isCreatingRoom ? 'Creating…' : 'Create room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}