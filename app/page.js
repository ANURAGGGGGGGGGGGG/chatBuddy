import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";

export default async function Home() {
  const session = await getServerSession(authOptions);

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
            {!session && (
              <>
                <Link href="/chat" className="hidden sm:inline-flex text-sm px-3 py-2 rounded-md border border-slate-200 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/10 transition">Open Chat</Link>
                <Link href="/auth/signin" className="text-sm px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-white/10 transition">Sign in</Link>
                <Link href="/auth/signup" className="text-sm px-3 py-2 rounded-md bg-slate-900 text-white dark:bg-white dark:text-black hover:opacity-90 transition">Get started</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 [mask-image:radial-gradient(80%_50%_at_50%_0%,black,transparent)]">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-64 w-[110vw] bg-gradient-to-r from-fuchsia-500/20 via-violet-500/20 to-sky-400/20 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 items-center gap-12 md:gap-16">
            <div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
                Chat that feels
                <span className="ml-2 inline-block bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 via-violet-500 to-sky-400">instant</span>
                , personal, and fun.
              </h1>
              <p className="mt-5 text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
                ChatBuddy is a modern, Instagram‑inspired messenger. Real‑time conversations, typing indicators, read receipts, file sharing, and a beautiful, responsive UI — all powered by Next.js, Socket.IO, and MongoDB.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/auth/signup" className="inline-flex items-center gap-2 px-5 py-3 rounded-md text-sm font-medium bg-slate-900 text-white dark:bg-white dark:text-black hover:opacity-90 transition">
                  Create your account
                </Link>
                <Link href="/auth/signin" className="inline-flex items-center gap-2 px-5 py-3 rounded-md text-sm font-medium border border-slate-200 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/10 transition">
                  Sign in
                </Link>
                <Link href="/chat" className="inline-flex items-center gap-2 px-5 py-3 rounded-md text-sm font-medium border border-slate-200 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/10 transition">
                  Try the demo
                </Link>
              </div>

              <div className="mt-10 flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span>Real‑time updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-sky-500" />
                  <span>Media & files</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-violet-500" />
                  <span>Beautiful UI</span>
                </div>
              </div>
            </div>

            {/* Mocked chat preview */}
            <div className="relative">
              <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-tr from-fuchsia-500/15 via-violet-500/15 to-sky-400/15 blur-2xl" />
              <div className="rounded-3xl border border-black/5 dark:border-white/10 bg-white dark:bg-black shadow-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-black/5 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <p className="text-sm font-medium">Design Team</p>
                  </div>
                  <p className="text-xs text-slate-500">12 members</p>
                </div>
                <div className="p-4 space-y-3 max-h-[340px] overflow-y-auto">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-fuchsia-500 to-violet-500" />
                    <div>
                      <p className="text-xs text-slate-500">alex • 2m</p>
                      <div className="mt-1 rounded-2xl rounded-tl-sm bg-slate-100 dark:bg-white/10 px-3 py-2 text-sm">Hey team! Let’s plan the launch 🎉</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 justify-end">
                    <div>
                      <p className="text-right text-xs text-slate-500">you • 1m</p>
                      <div className="mt-1 rounded-2xl rounded-tr-sm bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white px-3 py-2 text-sm">I’ll share the assets in a moment.</div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-500 to-sky-500" />
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500" />
                    <div>
                      <p className="text-xs text-slate-500">sam • just now</p>
                      <div className="mt-1 rounded-2xl rounded-tl-sm bg-slate-100 dark:bg:white/10 px-3 py-2 text-sm text-black
                      ">Typing…</div>
                    </div>
                  </div>
                </div>
                <div className="p-3 border-t border-black/5 dark:border-white/10 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Send a message"
                    aria-label="Message input"
                    className="flex-1 rounded-xl bg-slate-100 dark:bg-white/10 h-9 px-3 text-black dark:text-white placeholder-slate-500 dark:placeholder-slate-300 outline-none border border-black/5 dark:border-white/10"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What we offer */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">What we offer</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300 max-w-2xl">Everything you need to communicate with your friends, community, or team — fast, secure, and delightful.</p>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard emoji="⚡" title="Real‑time messaging" desc="Powered by Socket.IO for instant delivery, presence, and typing indicators." />
            <FeatureCard emoji="🔒" title="Auth & sessions" desc="Sign up and sign in with secure session management using NextAuth.js." />
            <FeatureCard emoji="👥" title="Rooms & groups" desc="Create and join rooms for focused, organized conversations." />
            <FeatureCard emoji="📎" title="Share files" desc="Send images and documents to keep conversations productive." />
            <FeatureCard emoji="👀" title="Read receipts" desc="Know when your messages have been viewed by others." />
            <FeatureCard emoji="🌓" title="Beautiful UI" desc="Responsive, modern interface with dark mode out of the box." />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 md:py-16 border-t border-black/5 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">How it works</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <StepCard step={1} title="Create an account" desc="Sign up in seconds and set your display name and avatar." />
            <StepCard step={2} title="Join or create rooms" desc="Find your friends or start a new conversation for your group." />
            <StepCard step={3} title="Start chatting" desc="Send messages, share files, and see who’s online in real time." />
          </div>
          <div className="mt-10">
            <Link href="/auth/signup" className="inline-flex items-center gap-2 px-5 py-3 rounded-md text-sm font-medium bg-slate-900 text-white dark:bg:white dark:text-black hover:opacity-90 transition">
              Get started free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-black/5 dark:border-white/10">
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

function FeatureCard({ emoji, title, desc }) {
  return (
    <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-black p-5 shadow-sm hover:shadow-md transition">
      <div className="h-9 w-9 rounded-xl grid place-items-center text-lg bg-slate-100 dark:bg-white/10 mb-3">
        <span>{emoji}</span>
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{desc}</p>
    </div>
  );
}

function StepCard({ step, title, desc }) {
  return (
    <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-black p-5">
      <div className="text-xs font-semibold text-slate-500">Step {step}</div>
      <h3 className="mt-1 text-base font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{desc}</p>
    </div>
  );
}
