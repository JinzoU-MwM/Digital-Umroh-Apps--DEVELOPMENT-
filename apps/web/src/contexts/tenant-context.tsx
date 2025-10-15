'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface Tenant {
  id: string
  slug: string
  name: string
  domain: string
  settings?: Record<string, any>
}

interface TenantContextType {
  tenant: Tenant | null
  isLoading: boolean
  error: string | null
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

interface TenantProviderProps {
  children: ReactNode
}

export function TenantProvider({ children }: TenantProviderProps) {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const resolveTenant = async () => {
      try {
        // Get tenant from subdomain or header
        const hostname = window.location.hostname
        const subdomain = hostname.split('.')[0]

        // Handle localhost development
        let tenantSlug = subdomain
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          // For local development, use 'demo' as default tenant
          tenantSlug = 'demo'
        }

        if (tenantSlug === 'www' || tenantSlug === 'app') {
          tenantSlug = 'default'
        }

        // In a real app, you'd validate the tenant with your API
        // For now, we'll create a basic tenant object
        const tenantData: Tenant = {
          id: `tenant-${tenantSlug}`,
          slug: tenantSlug,
          name: tenantSlug.charAt(0).toUpperCase() + tenantSlug.slice(1),
          domain: hostname,
        }

        setTenant(tenantData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to resolve tenant')
      } finally {
        setIsLoading(false)
      }
    }

    resolveTenant()
  }, [])

  return (
    <TenantContext.Provider value={{ tenant, isLoading, error }}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const context = useContext(TenantContext)
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}

// Helper to get tenant header for API requests
export function getTenantHeader(): Record<string, string> {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
  let tenantSlug = hostname.split('.')[0]

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    tenantSlug = 'demo'
  }

  if (tenantSlug === 'www' || tenantSlug === 'app') {
    tenantSlug = 'default'
  }

  return {
    'X-Tenant-Id': tenantSlug,
  }
}