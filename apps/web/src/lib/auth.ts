import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { JWT } from 'next-auth/jwt'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          // Get tenant from headers (will be set by middleware)
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // Note: In production, tenant header should be set by middleware
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          if (!response.ok) {
            return null
          }

          const data = await response.json()

          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
            isActive: data.user.isActive,
            tenantId: data.user.tenantId,
            tenantSlug: data.user.tenantSlug,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.accessToken = user.accessToken
        token.refreshToken = user.refreshToken
        token.id = user.id
        token.role = user.role
        token.isActive = user.isActive
        token.tenantId = user.tenantId
        token.tenantSlug = user.tenantSlug
      }
      return token
    },
    async session({ session, token }: { session: any; token: JWT }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.isActive = token.isActive as boolean
        session.user.tenantId = token.tenantId as string
        session.user.tenantSlug = token.tenantSlug as string
        session.accessToken = token.accessToken as string
        session.refreshToken = token.refreshToken as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
}

export default NextAuth(authOptions)