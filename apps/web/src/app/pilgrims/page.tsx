'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Plus, Search, Download, Upload, Eye, Edit, Users, FileText, MapPin } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { getApiUrl } from '@/lib/api'
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils'
import Link from 'next/link'

interface Pilgrim {
  id: string
  name: string
  birth_date: string
  gender: string
  id_number: string
  passport_number?: string
  phone?: string
  email?: string
  room_number?: string
  building?: string
  floor?: number
  document_completion: number
  status: string
  booking?: {
    id: string
    booking_code: string
    package: {
      name: string
    }
    customer: {
      name: string
    }
  }
  created_at: string
}

export default function PilgrimsPage() {
  const { user, hasPermission } = useAuth()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [gender, setGender] = useState('')
  const [bookingId, setBookingId] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(20)

  const { data: pilgrimsData, isLoading } = useQuery({
    queryKey: ['pilgrims', search, gender, bookingId, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(gender && { gender }),
        ...(bookingId && { booking_id: bookingId }),
      })

      const response = await fetch(`${getApiUrl()}/pilgrims?${params}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'X-Tenant-Id': user?.tenantSlug || 'demo',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch pilgrims')
      }

      return response.json()
    },
    enabled: !!user?.token,
  })

  const deletePilgrimMutation = useMutation({
    mutationFn: async (pilgrimId: string) => {
      const response = await fetch(`${getApiUrl()}/pilgrims/${pilgrimId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'X-Tenant-Id': user?.tenantSlug || 'demo',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete pilgrim')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilgrims'] })
    },
  })

  const handleDeletePilgrim = (pilgrimId: string) => {
    if (confirm('Are you sure you want to delete this pilgrim?')) {
      deletePilgrimMutation.mutate(pilgrimId)
    }
  }

  const exportToExcel = async () => {
    try {
      const params = new URLSearchParams({
        ...(search && { search }),
        ...(gender && { gender }),
        ...(bookingId && { booking_id: bookingId }),
        limit: '10000',
      })

      const response = await fetch(`${getApiUrl()}/pilgrims/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'X-Tenant-Id': user?.tenantSlug || 'demo',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to export pilgrims')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pilgrims-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  if (!hasPermission('read')) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">You don't have permission to view pilgrims</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pilgrims Management</h1>
          <p className="text-gray-500">Manage pilgrim information, documents, and room assignments</p>
        </div>
        <div className="flex space-x-2">
          {hasPermission('write') && (
            <Link href="/pilgrims/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Pilgrim
              </Button>
            </Link>
          )}
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Pilgrims</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pilgrimsData?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">With Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pilgrimsData?.pilgrims?.filter((p: Pilgrim) => p.room_number).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Documents Complete</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pilgrimsData?.pilgrims?.filter((p: Pilgrim) => p.document_completion === 100).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Document Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pilgrimsData?.pilgrims?.length
                ? Math.round(
                    pilgrimsData.pilgrims.reduce((sum: number, p: Pilgrim) => sum + p.document_completion, 0) /
                    pilgrimsData.pilgrims.length
                  )
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search pilgrims..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Genders</SelectItem>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Booking ID"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
            />
            <Button variant="outline" onClick={() => {
              setSearch('')
              setGender('')
              setBookingId('')
            }}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pilgrims Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pilgrims ({pilgrimsData?.total || 0})</CardTitle>
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
                    <TableHead>Name</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>ID Number</TableHead>
                    <TableHead>Booking</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pilgrimsData?.pilgrims?.map((pilgrim: Pilgrim) => (
                    <TableRow key={pilgrim.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{pilgrim.name}</div>
                          <div className="text-sm text-gray-500">{formatDate(pilgrim.birth_date)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{pilgrim.gender}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{pilgrim.id_number}</div>
                          {pilgrim.passport_number && (
                            <div className="text-gray-500">Passport: {pilgrim.passport_number}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {pilgrim.booking ? (
                          <div className="text-sm">
                            <div className="font-medium">{pilgrim.booking.booking_code}</div>
                            <div className="text-gray-500">{pilgrim.booking.package.name}</div>
                            <div className="text-gray-500">{pilgrim.booking.customer.name}</div>
                          </div>
                        ) : (
                          <span className="text-gray-500">No booking</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {pilgrim.room_number ? (
                          <div className="text-sm">
                            <div className="font-medium">{pilgrim.room_number}</div>
                            <div className="text-gray-500">{pilgrim.building} - Floor {pilgrim.floor}</div>
                          </div>
                        ) : (
                          <Badge variant="outline">Unassigned</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="text-sm font-medium">{pilgrim.document_completion}%</div>
                          <div className="w-12 h-2 bg-gray-200 rounded-full">
                            <div
                              className={`h-2 rounded-full ${
                                pilgrim.document_completion === 100
                                  ? 'bg-green-500'
                                  : pilgrim.document_completion >= 50
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${pilgrim.document_completion}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(pilgrim.status)}>
                          {pilgrim.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Link href={`/pilgrims/${pilgrim.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {hasPermission('write') && (
                            <Link href={`/pilgrims/${pilgrim.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                          <Link href={`/pilgrims/${pilgrim.id}/documents`}>
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/pilgrims/${pilgrim.id}/room`}>
                            <Button variant="ghost" size="sm">
                              <MapPin className="h-4 w-4" />
                            </Button>
                          </Link>
                          {hasPermission('delete') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePilgrim(pilgrim.id)}
                              disabled={deletePilgrimMutation.isPending}
                            >
                              <Users className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pilgrimsData?.pagination && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Showing {((pilgrimsData.pagination.page - 1) * pilgrimsData.pagination.limit) + 1} to{' '}
                    {Math.min(pilgrimsData.pagination.page * pilgrimsData.pagination.limit, pilgrimsData.total)} of{' '}
                    {pilgrimsData.total} pilgrims
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={!pilgrimsData.pagination.hasPrev}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={!pilgrimsData.pagination.hasNext}
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
    </div>
  )
}