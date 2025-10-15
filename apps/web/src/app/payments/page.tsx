'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CreditCard,
  DollarSign,
  ExternalLink,
  RefreshCw,
  Copy,
  Eye,
  Download,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { getApiUrl } from '@/lib/api'
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils'

interface Payment {
  id: string
  customer: {
    name: string
    email?: string
    phone?: string
  }
  invoice?: {
    invoice_number: string
    total_amount: number
    due_date: string
  }
  booking?: {
    booking_code: string
    package: {
      name: string
    }
  }
  amount: number
  method: string
  provider: string
  status: string
  description?: string
  created_at: string
  paid_at?: string
  metadata?: {
    payment_url?: string
    expires_at?: string
    provider_data?: any
  }
}

interface PaymentStats {
  total: number
  completed: number
  pending: number
  failed: number
  refunded: number
  totalAmount: number
  byMethod: Array<{
    method: string
    count: number
    totalAmount: number
  }>
  byProvider: Array<{
    provider: string
    count: number
    totalAmount: number
  }>
  recentCount: number
}

export default function PaymentsPage() {
  const { user, hasPermission } = useAuth()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [provider, setProvider] = useState('')
  const [method, setMethod] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [showPaymentLinkDialog, setShowPaymentLinkDialog] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ['payments', search, status, provider, method, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(status && { status }),
        ...(provider && { provider }),
        ...(method && { method }),
      })

      const response = await fetch(`${getApiUrl()}/payments?${params}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'X-Tenant-Id': user?.tenantSlug || 'demo',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch payments')
      }

      return response.json()
    },
    enabled: !!user?.token,
  })

  const { data: statsData } = useQuery({
    queryKey: ['payment-stats'],
    queryFn: async () => {
      const response = await fetch(`${getApiUrl()}/payments/stats/overview`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'X-Tenant-Id': user?.tenantSlug || 'demo',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch payment stats')
      }

      return response.json()
    },
    enabled: !!user?.token,
  })

  const cancelPaymentMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      const response = await fetch(`${getApiUrl()}/payments/${paymentId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'X-Tenant-Id': user?.tenantSlug || 'demo',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to cancel payment')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['payment-stats'] })
    },
  })

  const retryPaymentMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      const response = await fetch(`${getApiUrl()}/payments/${paymentId}/retry`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'X-Tenant-Id': user?.tenantSlug || 'demo',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to retry payment')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['payment-stats'] })
    },
  })

  const handleCancelPayment = (paymentId: string) => {
    if (confirm('Are you sure you want to cancel this payment?')) {
      cancelPaymentMutation.mutate(paymentId)
    }
  }

  const handleRetryPayment = (paymentId: string) => {
    retryPaymentMutation.mutate(paymentId)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'FAILED':
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  if (!hasPermission('read')) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">You don't have permission to view payments</p>
      </div>
    )
  }

  const stats = statsData?.data as PaymentStats
  const payments = paymentsData?.data?.payments as Payment[] || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Management</h1>
          <p className="text-gray-500">Manage payment transactions and payment links</p>
        </div>
        {hasPermission('write') && (
          <Dialog open={showPaymentLinkDialog} onOpenChange={setShowPaymentLinkDialog}>
            <DialogTrigger asChild>
              <Button>
                <CreditCard className="h-4 w-4 mr-2" />
                Create Payment Link
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Payment Link</DialogTitle>
              </DialogHeader>
              <div className="text-center py-8">
                <p className="text-gray-500">Payment link creation will be available in the invoice management section.</p>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
              <div className="text-sm text-gray-500">{stats.total} transactions</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-500">Successful payments</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-500">Awaiting payment</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <XCircle className="h-4 w-4 mr-2" />
                Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-sm text-gray-500">Failed payments</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="payments" className="space-y-6">
        <TabsList>
          <TabsTrigger value="payments">Payments ({payments.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Input
                  placeholder="Search payments..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Providers</SelectItem>
                    <SelectItem value="XENDIT">Xendit</SelectItem>
                    <SelectItem value="MIDTRANS">Midtrans</SelectItem>
                    <SelectItem value="MANUAL">Manual</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Methods</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="VIRTUAL_ACCOUNT">Virtual Account</SelectItem>
                    <SelectItem value="E_WALLET">E-Wallet</SelectItem>
                    <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                    <SelectItem value="CASH">Cash</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => {
                  setSearch('')
                  setStatus('')
                  setProvider('')
                  setMethod('')
                }}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payments Table */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{formatDate(payment.created_at)}</div>
                              {payment.paid_at && (
                                <div className="text-sm text-gray-500">
                                  Paid: {formatDate(payment.paid_at)}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{payment.customer.name}</div>
                              <div className="text-sm text-gray-500">
                                {payment.customer.email || payment.customer.phone}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {payment.invoice ? (
                              <div>
                                <div className="font-medium">{payment.invoice.invoice_number}</div>
                                <div className="text-sm text-gray-500">
                                  Due: {formatDate(payment.invoice.due_date)}
                                </div>
                              </div>
                            ) : payment.booking ? (
                              <div>
                                <div className="font-medium">{payment.booking.booking_code}</div>
                                <div className="text-sm text-gray-500">
                                  {payment.booking.package.name}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(payment.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{payment.method}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{payment.provider}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(payment.status)}
                              <Badge className={getStatusColor(payment.status)}>
                                {payment.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {payment.metadata?.payment_url && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(payment.metadata.payment_url, '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              )}
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {(payment.status === 'FAILED' || payment.status === 'CANCELLED') && hasPermission('write') && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRetryPayment(payment.id)}
                                  disabled={retryPaymentMutation.isPending}
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              )}
                              {(payment.status === 'PENDING') && hasPermission('write') && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCancelPayment(payment.id)}
                                  disabled={cancelPaymentMutation.isPending}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {paymentsData?.data?.pagination && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-gray-500">
                        Showing {((paymentsData.data.pagination.page - 1) * paymentsData.data.pagination.limit) + 1} to{' '}
                        {Math.min(paymentsData.data.pagination.page * paymentsData.data.pagination.limit, paymentsData.data.total)} of{' '}
                        {paymentsData.data.total} payments
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(page - 1)}
                          disabled={!paymentsData.data.pagination.hasPrev}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(page + 1)}
                          disabled={!paymentsData.data.pagination.hasNext}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.byMethod?.map((method) => (
                  <div key={method.method} className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">{method.method}</Badge>
                      <span className="text-sm text-gray-500">{method.count} transactions</span>
                    </div>
                    <div className="font-medium">{formatCurrency(method.totalAmount)}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Payment Providers */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Providers</CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.byProvider?.map((provider) => (
                  <div key={provider.provider} className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">{provider.provider}</Badge>
                      <span className="text-sm text-gray-500">{provider.count} transactions</span>
                    </div>
                    <div className="font-medium">{formatCurrency(provider.totalAmount)}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}