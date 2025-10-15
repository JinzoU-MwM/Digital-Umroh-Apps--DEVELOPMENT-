import { Calendar, MapPin, Users } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { formatDate } from '@/lib/utils'

interface UpcomingTripsProps {
  trips?: any[]
  isLoading: boolean
}

export function UpcomingTrips({ trips, isLoading }: UpcomingTripsProps) {
  if (isLoading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Upcoming Trips</h3>
        </div>
        <div className="card-content space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 border rounded-lg">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-28"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <h3 className="card-title">Upcoming Trips</h3>
        <button className="btn btn-ghost btn-sm">
          View All
        </button>
      </div>
      <div className="card-content">
        {trips && trips.length > 0 ? (
          <div className="space-y-4">
            {trips.map((trip) => (
              <div key={trip.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{trip.name}</h4>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(trip.departureDate)} - {formatDate(trip.returnDate)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <MapPin className="h-4 w-4" />
                        <span>{trip.destination}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Users className="h-4 w-4" />
                        <span>{trip.bookedCount}/{trip.quota} booked</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-emerald-600">
                      {Math.round((trip.bookedCount / trip.quota) * 100)}%
                    </div>
                    <div className="text-sm text-gray-500">filled</div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-emerald-600 h-2 rounded-full transition-all"
                      style={{ width: `${(trip.bookedCount / trip.quota) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500">No upcoming trips found</div>
            <button className="btn btn-primary btn-sm mt-4">
              Create New Trip
            </button>
          </div>
        )}
      </div>
    </div>
  )
}