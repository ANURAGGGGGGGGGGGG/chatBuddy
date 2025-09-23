import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import { MongoClient } from 'mongodb';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
import jwt from 'jsonwebtoken';

const client = new MongoClient(process.env.MONGODB_URI);
const clientPromise = client.connect();

const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password');
        }

        try {
          await connectDB();
          
          // Find user with password field included
          const user = await User.findOne({ 
            email: credentials.email 
          }).select('+password');

          if (!user) {
            throw new Error('No user found with this email');
          }

          const isPasswordValid = await user.comparePassword(credentials.password);

          if (!isPasswordValid) {
            throw new Error('Invalid password');
          }

          // Update user online status
          await User.findByIdAndUpdate(user._id, { 
            isOnline: true,
            lastSeen: new Date()
          });

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            avatar: user.avatar
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw new Error(error.message || 'Authentication failed');
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.avatar = user.avatar;
        token.email = user.email;
      }
      // Issue a short-lived access token for Socket.IO auth
      try {
        if (token?.id && token?.email) {
          token.accessToken = jwt.sign(
            { sub: token.id, email: token.email },
            process.env.NEXTAUTH_SECRET,
            { expiresIn: '7d' }
          );
        }
      } catch (e) {
        console.error('JWT sign error:', e);
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.avatar = token.avatar;
        session.accessToken = token.accessToken;
      }
      return session;
    },
    async signIn({ user }) {
      try {
        await connectDB();
        await User.findByIdAndUpdate(user.id, { 
          isOnline: true,
          lastSeen: new Date()
        });
        return true;
      } catch (error) {
        console.error('SignIn callback error:', error);
        return true; // Still allow sign in even if status update fails
      }
    },
    async signOut({ token }) {
      try {
        await connectDB();
        await User.findByIdAndUpdate(token.id, { 
          isOnline: false,
          lastSeen: new Date()
        });
      } catch (error) {
        console.error('SignOut callback error:', error);
      }
    }
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup'
  },
  secret: process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
export { authOptions };