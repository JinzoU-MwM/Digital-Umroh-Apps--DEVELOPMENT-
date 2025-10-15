import { Users, Calendar, CreditCard, TrendingUp } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface StatsOverviewProps {
  stats?: any
  isLoading: boolean
  userRole: string
}

export function StatsOverview({ stats, isLoading, userRole }: StatsOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
              <LoadingSpinner size="md" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Customers',
      value: stats?.customers?.total || 0,
      change: stats?.customers?.growth || '+0%',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      accessibleFor: ['OWNER', 'ADMIN', 'SALES', 'OPERATION'],
    },
    {
      title: 'Active Bookings',
      value: stats?.bookings?.active || 0,
      change: stats?.bookings?.growth || '+0%',
      icon: Calendar,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      accessibleFor: ['OWNER', 'ADMIN', 'FINANCE', 'OPERATION', 'SALES'],
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats?.bookings?.revenue || 0),
      change: stats?.bookings?.revenueGrowth || '+0%',
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      accessibleFor: ['OWNER', 'ADMIN', 'FINANCE'],
    },
    {
      title: 'Conversion Rate',
      value: `${stats?.bookings?.conversionRate || 0}%`,
      change: stats?.bookings?.conversionGrowth || '+0%',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      accessibleFor: ['OWNER', 'ADMIN', 'SALES'],
    },
  ].filter(card => card.accessibleFor.includes(userRole))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card, index) => (
        <div key={index} className="card p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span className="text-sm text-emerald-600">{card.change}</span>
                <span className="text-sm text-gray-500">from last month</span>
              </div>
            </div>
            <div className={`p-3 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}