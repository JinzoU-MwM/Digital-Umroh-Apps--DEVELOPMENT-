'use client'

import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Home,
  Users,
  Calendar,
  CreditCard,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Building,
  MapPin,
  BarChart3,
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { canAccessModule } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { data: session } = useSession()
  const { user } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/auth/login')
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      current: true,
      roles: ['OWNER', 'ADMIN', 'FINANCE', 'OPERATION', 'SALES', 'VIEWER'],
    },
    {
      name: 'Packages',
      href: '/packages',
      icon: Calendar,
      current: false,
      roles: ['OWNER', 'ADMIN', 'OPERATION'],
    },
    {
      name: 'Customers',
      href: '/customers',
      icon: Users,
      current: false,
      roles: ['OWNER', 'ADMIN', 'SALES', 'OPERATION'],
    },
    {
      name: 'Bookings',
      href: '/bookings',
      icon: FileText,
      current: false,
      roles: ['OWNER', 'ADMIN', 'FINANCE', 'OPERATION', 'SALES'],
    },
    {
      name: 'Pilgrims',
      href: '/pilgrims',
      icon: User,
      current: false,
      roles: ['OWNER', 'ADMIN', 'OPERATION'],
    },
    {
      name: 'Invoices',
      href: '/invoices',
      icon: CreditCard,
      current: false,
      roles: ['OWNER', 'ADMIN', 'FINANCE'],
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: BarChart3,
      current: false,
      roles: ['OWNER', 'ADMIN', 'FINANCE', 'OPERATION', 'SALES'],
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      current: false,
      roles: ['OWNER', 'ADMIN'],
    },
  ].filter(item => user && canAccessModule(user.role, item.name.toLowerCase()))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200">
          <button
            type="button"
            className="lg:hidden px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <h2 className="text-lg font-semibold text-gray-900">Digital Umroh</h2>
            </div>
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              {/* User menu */}
              <div className="relative">
                <div className="flex items-center space-x-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                    <div className="text-xs text-gray-500">{user?.role}</div>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}

function Sidebar() {
  const { user } = useAuth()

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      current: true,
      roles: ['OWNER', 'ADMIN', 'FINANCE', 'OPERATION', 'SALES', 'VIEWER'],
    },
    {
      name: 'Packages',
      href: '/packages',
      icon: Calendar,
      current: false,
      roles: ['OWNER', 'ADMIN', 'OPERATION'],
    },
    {
      name: 'Customers',
      href: '/customers',
      icon: Users,
      current: false,
      roles: ['OWNER', 'ADMIN', 'SALES', 'OPERATION'],
    },
    {
      name: 'Bookings',
      href: '/bookings',
      icon: FileText,
      current: false,
      roles: ['OWNER', 'ADMIN', 'FINANCE', 'OPERATION', 'SALES'],
    },
    {
      name: 'Pilgrims',
      href: '/pilgrims',
      icon: User,
      current: false,
      roles: ['OWNER', 'ADMIN', 'OPERATION'],
    },
    {
      name: 'Invoices',
      href: '/invoices',
      icon: CreditCard,
      current: false,
      roles: ['OWNER', 'ADMIN', 'FINANCE'],
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: BarChart3,
      current: false,
      roles: ['OWNER', 'ADMIN', 'FINANCE', 'OPERATION', 'SALES'],
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      current: false,
      roles: ['OWNER', 'ADMIN'],
    },
  ].filter(item => user && canAccessModule(user.role, item.name.toLowerCase()))

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <Building className="h-8 w-8 text-emerald-600" />
          <span className="ml-2 text-xl font-bold text-gray-900">Digital Umroh</span>
        </div>
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                item.current
                  ? 'bg-emerald-100 text-emerald-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 ${
                  item.current ? 'text-emerald-500' : 'text-gray-400 group-hover:text-gray-500'
                }`}
              />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  )
}