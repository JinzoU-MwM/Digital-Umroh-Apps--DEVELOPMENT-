import { Plus, Users, Calendar, FileText, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { canAccessModule } from '@/contexts/auth-context'

interface QuickActionsProps {
  userRole: string
}

export function QuickActions({ userRole }: QuickActionsProps) {
  const actions = [
    {
      title: 'New Booking',
      description: 'Create a new booking',
      icon: Plus,
      href: '/bookings/new',
      color: 'bg-emerald-500',
      accessibleFor: ['OWNER', 'ADMIN', 'FINANCE', 'OPERATION', 'SALES'],
    },
    {
      title: 'Add Customer',
      description: 'Register new customer',
      icon: Users,
      href: '/customers/new',
      color: 'bg-blue-500',
      accessibleFor: ['OWNER', 'ADMIN', 'SALES', 'OPERATION'],
    },
    {
      title: 'Create Package',
      description: 'Create new package',
      icon: Calendar,
      href: '/packages/new',
      color: 'bg-purple-500',
      accessibleFor: ['OWNER', 'ADMIN', 'OPERATION'],
    },
    {
      title: 'Generate Invoice',
      description: 'Create new invoice',
      icon: FileText,
      href: '/invoices/new',
      color: 'bg-orange-500',
      accessibleFor: ['OWNER', 'ADMIN', 'FINANCE'],
    },
  ].filter(action => action.accessibleFor.includes(userRole))

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Quick Actions</h3>
      </div>
      <div className="card-content">
        <div className="grid grid-cols-1 gap-3">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant="outline"
              className="h-auto p-4 justify-start"
              onClick={() => {
                // Navigate to action href
                window.location.href = action.href
              }}
            >
              <div className={`p-2 rounded-lg ${action.color} text-white mr-3`}>
                <action.icon className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">{action.title}</div>
                <div className="text-sm text-gray-500">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}