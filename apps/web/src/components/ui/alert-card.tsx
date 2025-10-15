import { AlertCircle, CheckCircle, Info, X } from 'lucide-react'
import { useState } from 'react'

interface AlertCardProps {
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  dismissible?: boolean
  className?: string
}

export function AlertCard({ type, title, message, dismissible = false, className = '' }: AlertCardProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  const typeConfig = {
    info: {
      icon: Info,
      containerClass: 'bg-blue-50 border-blue-200',
      iconClass: 'text-blue-600',
      titleClass: 'text-blue-900',
      messageClass: 'text-blue-800',
    },
    success: {
      icon: CheckCircle,
      containerClass: 'bg-emerald-50 border-emerald-200',
      iconClass: 'text-emerald-600',
      titleClass: 'text-emerald-900',
      messageClass: 'text-emerald-800',
    },
    warning: {
      icon: AlertCircle,
      containerClass: 'bg-yellow-50 border-yellow-200',
      iconClass: 'text-yellow-600',
      titleClass: 'text-yellow-900',
      messageClass: 'text-yellow-800',
    },
    error: {
      icon: AlertCircle,
      containerClass: 'bg-red-50 border-red-200',
      iconClass: 'text-red-600',
      titleClass: 'text-red-900',
      messageClass: 'text-red-800',
    },
  }

  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <div className={`border rounded-lg p-4 ${config.containerClass} ${className}`}>
      <div className="flex items-start">
        <Icon className={`h-5 w-5 mt-0.5 ${config.iconClass}`} />
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${config.titleClass}`}>{title}</h3>
          <p className={`text-sm mt-1 ${config.messageClass}`}>{message}</p>
        </div>
        {dismissible && (
          <button
            onClick={() => setIsVisible(false)}
            className={`ml-4 inline-flex ${config.iconClass} hover:opacity-75 transition-opacity`}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}