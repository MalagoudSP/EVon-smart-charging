import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    authorized({ auth, request: { pathname } }) {
      const isLoggedIn = !!auth?.user
      const isOnProtectedRoute = [
        '/dashboard',
        '/bookings',
        '/profile',
        '/stations',
      ].some((path) => pathname.startsWith(path))

      if (isOnProtectedRoute && !isLoggedIn) {
        return false
      }

      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const result = loginSchema.safeParse(credentials)

        if (!result.success) {
          return null
        }

        const { email, password } = result.data

        // TODO: Query user from database
        // For now, using mock implementation
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/login`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password }),
            }
          )

          if (!response.ok) {
            return null
          }

          const user = await response.json()
          return user
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
}
