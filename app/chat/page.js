'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ChatSidebar from '../../components/ChatSidebar';
import ChatWindow from '../../components/ChatWindow';
import LoadingSpinner from '../../components/LoadingSpinner';
import Link from 'next/link';

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-white to-slate-50 dark:from-[#0a0a0a] dark:via-[#0a0a0a] dark:to-black text-slate-900 dark:text-slate-100">
        <LoadingSpinner />
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-slate-50 dark:from-[#0a0a0a] dark:via-[#0a0a0a] dark:to-black text-slate-900 dark:text-slate-100 flex flex-col">

      {/* Main Chat Layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className={`${isSidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden border-r border-black/5 dark:border-white/10`}>
          <ChatSidebar 
            user={session.user}
            selectedRoom={selectedRoom}
            onRoomSelect={setSelectedRoom}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <ChatWindow 
            user={session.user}
            selectedRoom={selectedRoom}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        </div>
      </main>

      {/* Footer (same as Home) */}
      <footer className="py-6 border-t border-black/5 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} ChatBuddy. All rights reserved.</p>
          {!session && (
            <div className="flex items-center gap-4">
              <Link href="/chat" className="hover:text-slate-700 dark:hover:text-slate-300">Open Chat</Link>
              <Link href="/auth/signin" className="hover:text-slate-700 dark:hover:text-slate-300">Sign in</Link>
              <Link href="/auth/signup" className="hover:text-slate-700 dark:hover:text-slate-300">Sign up</Link>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}