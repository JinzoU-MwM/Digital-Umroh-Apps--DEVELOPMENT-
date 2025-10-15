import { Calendar, User, CreditCard } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { formatCurrency, formatDate } from '@/lib/utils'

interface RecentBookingsProps {
  bookings?: any[]
  isLoading: boolean
}

export function RecentBookings({ bookings, isLoading }: RecentBookingsProps) {
  if (isLoading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Bookings</h3>
        </div>
        <div className="card-content space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
              <LoadingSpinner size="sm" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <h3 className="card-title">Recent Bookings</h3>
        <button className="btn btn-ghost btn-sm">
          View All
        </button>
      </div>
      <div className="card-content">
        {bookings && bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="font-medium text-gray-900">{booking.customerName}</div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(booking.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{booking.pilgrimsCount} pilgrims</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    {formatCurrency(booking.totalPrice)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {booking.packageName}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500">No recent bookings found</div>
            <button className="btn btn-primary btn-sm mt-4">
              Create First Booking
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function getStatusColor(status: string): string {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}