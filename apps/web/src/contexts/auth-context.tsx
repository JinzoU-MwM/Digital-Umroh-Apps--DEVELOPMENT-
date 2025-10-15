'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'

interface User {
  id: string
  email: string
  name: string
  role: 'OWNER' | 'ADMIN' | 'FINANCE' | 'OPERATION' | 'SALES' | 'VIEWER'
  isActive: boolean
  tenantId: string
  tenantSlug: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true)
      return
    }

    if (session?.user) {
      setUser({
        id: session.user.id || '',
        email: session.user.email || '',
        name: session.user.name || '',
        role: session.user.role as User['role'] || 'VIEWER',
        isActive: session.user.isActive as boolean || true,
        tenantId: session.user.tenantId as string || '',
        tenantSlug: session.user.tenantSlug as string || '',
      })
    } else {
      setUser(null)
    }

    setIsLoading(false)
  }, [session, status])

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      setIsLoading(true)

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await signOut({ redirect: false })
      setUser(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed')
    }
  }

  const refreshUser = async () => {
    // In a real app, you'd fetch the latest user data from your API
    // For now, we'll rely on the session
    window.location.reload()
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      error,
      login,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Role-based permissions
export const ROLE_PERMISSIONS = {
  OWNER: ['read', 'write', 'delete', 'manage_users', 'manage_settings', 'manage_billing'],
  ADMIN: ['read', 'write', 'delete', 'manage_users'],
  FINANCE: ['read', 'write', 'manage_billing'],
  OPERATION: ['read', 'write', 'manage_operations'],
  SALES: ['read', 'write', 'manage_sales'],
  VIEWER: ['read'],
} as const

export function hasPermission(userRole: User['role'], permission: string): boolean {
  return ROLE_PERMISSIONS[userRole].includes(permission as any)
}

export function canAccessModule(userRole: User['role'], module: string): boolean {
  const modulePermissions: Record<string, User['role'][]> = {
    dashboard: ['OWNER', 'ADMIN', 'FINANCE', 'OPERATION', 'SALES', 'VIEWER'],
    packages: ['OWNER', 'ADMIN', 'OPERATION'],
    customers: ['OWNER', 'ADMIN', 'SALES', 'OPERATION'],
    bookings: ['OWNER', 'ADMIN', 'FINANCE', 'OPERATION', 'SALES'],
    pilgrims: ['OWNER', 'ADMIN', 'OPERATION'],
    invoices: ['OWNER', 'ADMIN', 'FINANCE'],
    reports: ['OWNER', 'ADMIN', 'FINANCE', 'OPERATION', 'SALES'],
    settings: ['OWNER', 'ADMIN'],
    users: ['OWNER', 'ADMIN'],
  }

  return modulePermissions[module]?.includes(userRole) || false
}