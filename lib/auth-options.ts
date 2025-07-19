import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyPassword } from './auth-utils';
import { mockUsers } from './mock-data';
import { User } from '@/types/auth';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Find user in mock database
        const user = mockUsers.find(
          (u) => u.email.toLowerCase() === credentials.email.toLowerCase()
        );

        if (!user) {
          return null;
        }

        // Verify password
        const isValidPassword = await verifyPassword(credentials.password, user.password);
        
        if (!isValidPassword) {
          return null;
        }

        // Return user object for session
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      // Include user ID and role in JWT token
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Include user ID and role in session
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'user' | 'admin';
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    newUser: '/register',
  },
  secret: process.env.NEXTAUTH_SECRET,
};