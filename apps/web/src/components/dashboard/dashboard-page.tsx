'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/auth-context'
import { useTenant } from '@/contexts/tenant-context'
import { canAccessModule } from '@/contexts/auth-context'
import { DashboardLayout } from './dashboard-layout'
import { StatsOverview } from './stats-overview'
import { RecentBookings } from './recent-bookings'
import { UpcomingTrips } from './upcoming-trips'
import { QuickActions } from './quick-actions'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { AlertCard } from '@/components/ui/alert-card'

export function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { tenant, isLoading: tenantLoading } = useTenant()

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await Promise.all([
        fetch('/api/bookings/stats/overview'),
        fetch('/api/customers/stats/overview'),
        fetch('/api/packages/stats/overview'),
      ])

      if (response.some(r => !r.ok)) {
        throw new Error('Failed to fetch dashboard stats')
      }

      const [bookingsStats, customersStats, packagesStats] = await Promise.all(
        response.map(r => r.json())
      )

      return {
        bookings: bookingsStats.data,
        customers: customersStats.data,
        packages: packagesStats.data,
      }
    },
    enabled: !!user && !!tenant,
  })

  const {
    data: recentBookings,
    isLoading: bookingsLoading,
  } = useQuery({
    queryKey: ['recent-bookings'],
    queryFn: async () => {
      const response = await fetch('/api/bookings?limit=5&sort=createdAt:desc')
      if (!response.ok) throw new Error('Failed to fetch recent bookings')
      return response.json()
    },
    enabled: !!user && !!tenant,
  })

  const {
    data: upcomingTrips,
    isLoading: tripsLoading,
  } = useQuery({
    queryKey: ['upcoming-trips'],
    queryFn: async () => {
      const response = await fetch('/api/packages?status=published&limit=3')
      if (!response.ok) throw new Error('Failed to fetch upcoming trips')
      return response.json()
    },
    enabled: !!user && !!tenant && canAccessModule(user.role, 'packages'),
  })

  if (authLoading || tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user || !tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AlertCard
          type="error"
          title="Authentication Required"
          message="Please login to access the dashboard."
        />
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user.name}!
            </h1>
            <p className="text-gray-600 mt-1">
              Here's what's happening with {tenant.name} today.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Tenant:</span>
            <span className="text-sm font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
              {tenant.slug}
            </span>
          </div>
        </div>

        {/* Alerts */}
        {statsError && (
          <AlertCard
            type="warning"
            title="Data Loading Issue"
            message="Some dashboard data may not be current. Please refresh the page."
          />
        )}

        {/* Stats Overview */}
        <StatsOverview
          stats={stats}
          isLoading={statsLoading}
          userRole={user.role}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Bookings - Always visible */}
          <div className="lg:col-span-2">
            <RecentBookings
              bookings={recentBookings?.data}
              isLoading={bookingsLoading}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <QuickActions userRole={user.role} />

            {/* Upcoming Trips - Only for users with package access */}
            {canAccessModule(user.role, 'packages') && (
              <UpcomingTrips
                trips={upcomingTrips?.data}
                isLoading={tripsLoading}
              />
            )}
          </div>
        </div>

        {/* Additional Sections Based on Role */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Financial Summary - Only for finance and above */}
          {canAccessModule(user.role, 'invoices') && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Financial Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Revenue (MTD)</span>
                  <span className="text-xl font-bold text-emerald-600">
                    Rp {stats?.bookings?.revenue || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pending Payments</span>
                  <span className="text-xl font-bold text-orange-600">
                    Rp {stats?.bookings?.pendingPayments || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Paid Bookings</span>
                  <span className="text-xl font-bold text-blue-600">
                    {stats?.bookings?.paidCount || 0}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Task Reminders */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Task Reminders
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  {stats?.bookings?.pendingDocuments || 0} pending documents
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  {stats?.bookings?.pendingPaymentsCount || 0} pending payments
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  {stats?.bookings?.upcomingTrips || 0} trips this month
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}