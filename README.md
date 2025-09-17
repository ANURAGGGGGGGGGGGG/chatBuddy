# ChatBuddy

A real‑time chat application built with Next.js App Router, NextAuth (credentials), MongoDB/Mongoose, and Socket.IO. It supports rooms, presence/typing indicators, reactions, file/image attachments, and an emoji picker.

## Features
- Authentication with credentials (signup/signin)
- Private/public rooms with membership checks
- Real‑time messaging via Socket.IO
- Optimistic send, read receipts, typing indicators, user presence
- Reactions and message updates (edit/delete flags)
- File and image attachments
- Emoji picker in the composer

## Tech Stack
- Next.js 15, React 19
- MongoDB + Mongoose
- NextAuth with MongoDB adapter
- Socket.IO (server & client)
- Tailwind CSS (v4) and Headless UI

## Prerequisites
- Node.js 18+ and npm
- A MongoDB connection string

## Getting Started
1) Install dependencies

   npm install

2) Create .env.local at the project root with:
- MONGODB_URI=your-mongodb-connection-string
- NEXTAUTH_SECRET=any-strong-random-string
- NEXTAUTH_URL=http://localhost:3000
- PORT=3000

Notes:
- Server reads .env.local (see server.js) and uses NEXTAUTH_SECRET to verify Socket.IO auth tokens.
- CORS origin for Socket.IO uses NEXTAUTH_URL.

3) Run the app in development

   npm run dev

Open http://localhost:3000/chat

4) Create an account and sign in
- Visit /auth/signup to register, then /auth/signin to log in.

## Build & Start (production)
- Build: npm run build
- Start: npm run start

Ensure NEXTAUTH_URL points to your deployed URL and the same NEXTAUTH_SECRET is set in the environment.

## Project Structure (high level)
- app/ – App Router pages and API routes (auth, messages, rooms)
- components/ – Chat UI (ChatWindow, ChatSidebar, MessageBubble, FileUploadDialog)
- contexts/ – SocketContext for realtime events
- models/ – Mongoose models (User, Room, Message)
- lib/mongodb.js – DB connection helper
- server.js – Next + Socket.IO server bootstrap

## Troubleshooting
- Stuck on “Reconnecting…”: confirm NEXTAUTH_URL is correct and matches the origin you open in the browser. Also ensure NEXTAUTH_SECRET in env matches the one used to sign JWTs.
- 401/403 on messages API: verify you are a room member and your session is valid.
- Mongo errors: check MONGODB_URI and that MongoDB is reachable.

## License
MIT (or your preferred license).
