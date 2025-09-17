'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, MessageCircle } from 'lucide-react';

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      });

      if (result?.error) {
        setError(result.error);
      } else {
        const session = await getSession();
        if (session) {
          router.push('/chat');
        }
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-slate-50 dark:from-[#0a0a0a] dark:via-[#0a0a0a] dark:to-black text-slate-900 dark:text-slate-100">
      {/* Navbar */}
      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/40 bg-white/70 dark:bg-black/30 border-b border-black/5 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-amber-400" />
            <span className="text-lg font-semibold tracking-tight">ChatBuddy</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/auth/signup" className="text-sm px-3 py-2 rounded-md border border-slate-200 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/10 transition">Sign up</Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-12 md:py-20 grid lg:grid-cols-2 gap-12 items-center">
          {/* Intro blurb */}
          <div className="hidden lg:block">
            <div className="inline-flex items-center gap-2 text-xs text-slate-500 bg-slate-100 dark:bg-white/10 rounded-full px-3 py-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Real‑time messaging • Typing indicators • Beautiful UI
            </div>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight">
              Welcome back to
              <span className="ml-2 bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 via-violet-500 to-sky-400">ChatBuddy</span>
            </h1>
            <p className="mt-3 text-slate-600 dark:text-slate-300 max-w-xl">
              Sign in to continue your conversations. Your rooms, messages, and media are synced in real time across devices.
            </p>
          </div>

          {/* Auth card */}
          <div className="max-w-md w-full mx-auto">
            <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-black p-8 shadow-sm">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-amber-400">
                    <MessageCircle className="h-7 w-7 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold">Sign in</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Use your email and password to continue</p>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                {error && (
                  <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-md border border-black/5 dark:border-white/10 bg-white dark:bg-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-3 py-2 pr-10 rounded-md border border-black/5 dark:border-white/10 bg-white dark:bg-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium bg-slate-900 text-white dark:bg-white dark:text-black hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Signing in…' : 'Sign in'}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
                <span>Don&apos;t have an account? </span>
                <Link href="/auth/signup" className="font-medium hover:underline">
                  Sign up
                </Link>
              </div>

              <div className="mt-4 text-center">
                <Link href="/" className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Back to home</Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-10 border-t border-black/5 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} ChatBuddy. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/chat" className="hover:text-slate-700 dark:hover:text-slate-300">Open Chat</Link>
            <Link href="/auth/signin" className="hover:text-slate-700 dark:hover=text-slate-300">Sign in</Link>
            <Link href="/auth/signup" className="hover:text-slate-700 dark:hover:text-slate-300">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}