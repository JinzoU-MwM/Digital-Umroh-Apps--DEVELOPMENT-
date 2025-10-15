'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Bed,
  MapPin,
  Building,
  Users,
  Edit,
  Trash2,
  UserPlus,
  DoorOpen,
  Info
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { getApiUrl } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { useParams } from 'next/navigation'

interface Pilgrim {
  id: string
  name: string
  gender: string
  birth_date: string
  room_number?: string
  building?: string
  floor?: number
  booking?: {
    booking_code: string
    package: {
      name: string
    }
    customer: {
      name: string
    }
  }
}

interface Room {
  id: string
  number: string
  building: string
  floor: number
  capacity: number
  current_occupancy: number
  gender: 'MALE' | 'FEMALE' | 'MIXED'
  type: 'QUAD' | 'TRIPLE' | 'DOUBLE' | 'SINGLE'
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE'
  pilgrims: Array<{
    pilgrim_id: string
    name: string
    bed_number: number
    assigned_at: string
  }>
}

interface RoomOccupancy {
  rooms: Room[]
  summary: {
    total_rooms: number
    occupied_rooms: number
    total_pilgrims_assigned: number
  }
}

const BUILDINGS = [
  { value: 'MAKKAH_TOWER_A', label: 'Makkah Tower A' },
  { value: 'MAKKAH_TOWER_B', label: 'Makkah Tower B' },
  { value: 'MADINAH_HOTEL', label: 'Madinah Hotel' },
  { value: 'JEDDAH_TRANSIT', label: 'Jeddah Transit Hotel' },
]

const FLOORS = Array.from({ length: 20 }, (_, i) => ({
  value: i + 1,
  label: `Floor ${i + 1}`,
}))

export default function PilgrimRoomPage() {
  const { user, hasPermission } = useAuth()
  const params = useParams()
  const pilgrimId = params.id as string
  const queryClient = useQueryClient()

  const [isAssigning, setIsAssigning] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState({
    room_number: '',
    building: '',
    floor: 1,
    notes: '',
  })

  const { data: pilgrimData, isLoading: pilgrimLoading } = useQuery({
    queryKey: ['pilgrim', pilgrimId],
    queryFn: async () => {
      const response = await fetch(`${getApiUrl()}/pilgrims/${pilgrimId}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'X-Tenant-Id': user?.tenantSlug || 'demo',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch pilgrim')
      }

      return response.json()
    },
    enabled: !!user?.token && !!pilgrimId,
  })

  const { data: occupancyData, isLoading: occupancyLoading } = useQuery({
    queryKey: ['room-occupancy'],
    queryFn: async () => {
      const response = await fetch(`${getApiUrl()}/rooming/occupancy`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'X-Tenant-Id': user?.tenantSlug || 'demo',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch room occupancy')
      }

      return response.json()
    },
    enabled: !!user?.token,
  })

  const assignRoomMutation = useMutation({
    mutationFn: async (roomData: typeof selectedRoom) => {
      const response = await fetch(`${getApiUrl()}/rooming/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
          'X-Tenant-Id': user?.tenantSlug || 'demo',
        },
        body: JSON.stringify({
          pilgrim_id: pilgrimId,
          ...roomData,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to assign room')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilgrim', pilgrimId] })
      queryClient.invalidateQueries({ queryKey: ['room-occupancy'] })
      setShowAssignDialog(false)
      setSelectedRoom({ room_number: '', building: '', floor: 1, notes: '' })
      setIsAssigning(false)
    },
    onError: () => {
      setIsAssigning(false)
    },
  })

  const reassignRoomMutation = useMutation({
    mutationFn: async (roomData: typeof selectedRoom) => {
      const response = await fetch(`${getApiUrl()}/rooming/reassign/${pilgrimId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
          'X-Tenant-Id': user?.tenantSlug || 'demo',
        },
        body: JSON.stringify(roomData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to reassign room')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilgrim', pilgrimId] })
      queryClient.invalidateQueries({ queryKey: ['room-occupancy'] })
      setShowAssignDialog(false)
      setSelectedRoom({ room_number: '', building: '', floor: 1, notes: '' })
    },
  })

  const removeFromRoomMutation = useMutation({
    mutationFn: async (reason?: string) => {
      const response = await fetch(`${getApiUrl()}/rooming/remove/${pilgrimId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
          'X-Tenant-Id': user?.tenantSlug || 'demo',
        },
        body: JSON.stringify({ reason }),
      })

      if (!response.ok) {
        throw new Error('Failed to remove from room')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilgrim', pilgrimId] })
      queryClient.invalidateQueries({ queryKey: ['room-occupancy'] })
    },
  })

  const handleAssignRoom = () => {
    if (!selectedRoom.room_number || !selectedRoom.building) return

    setIsAssigning(true)

    if (pilgrim?.room_number) {
      reassignRoomMutation.mutate(selectedRoom)
    } else {
      assignRoomMutation.mutate(selectedRoom)
    }
  }

  const handleRemoveFromRoom = () => {
    const reason = prompt('Reason for removing from room (optional):')
    removeFromRoomMutation.mutate(reason || undefined)
  }

  const getAvailableRooms = () => {
    if (!occupancyData?.rooms) return []

    return occupancyData.rooms.filter((room: Room) => {
      const isFull = room.current_occupancy >= room.capacity
      const genderMatch = !room.gender || room.gender === 'MIXED' || room.gender === pilgrim?.gender
      const isMaintenance = room.status === 'MAINTENANCE'
      const isSameRoom = room.number === pilgrim?.room_number &&
                         room.building === pilgrim?.building &&
                         room.floor === pilgrim?.floor

      return !isFull && genderMatch && !isMaintenance && !isSameRoom
    })
  }

  if (pilgrimLoading || occupancyLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const pilgrim = pilgrimData?.pilgrim as Pilgrim
  const occupancy = occupancyData?.data as RoomOccupancy

  if (!pilgrim) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Pilgrim not found</p>
      </div>
    )
  }

  const availableRooms = getAvailableRooms()
  const hasRoom = !!pilgrim.room_number

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Room Assignment</h1>
          <p className="text-gray-500">
            {pilgrim.name} - {pilgrim.gender} - {pilgrim.booking?.booking_code}
          </p>
        </div>
        {hasPermission('write') && (
          <div className="flex space-x-2">
            <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
              <DialogTrigger asChild>
                <Button>
                  {hasRoom ? (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Reassign Room
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Assign Room
                    </>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {hasRoom ? 'Reassign Room' : 'Assign New Room'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="building">Building</Label>
                    <Select
                      value={selectedRoom.building}
                      onValueChange={(value) => setSelectedRoom(prev => ({ ...prev, building: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select building" />
                      </SelectTrigger>
                      <SelectContent>
                        {BUILDINGS.map((building) => (
                          <SelectItem key={building.value} value={building.value}>
                            {building.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="floor">Floor</Label>
                    <Select
                      value={selectedRoom.floor.toString()}
                      onValueChange={(value) => setSelectedRoom(prev => ({ ...prev, floor: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select floor" />
                      </SelectTrigger>
                      <SelectContent>
                        {FLOORS.map((floor) => (
                          <SelectItem key={floor.value} value={floor.value.toString()}>
                            {floor.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="room_number">Room Number</Label>
                    <Input
                      id="room_number"
                      placeholder="e.g., 101, 205, 301"
                      value={selectedRoom.room_number}
                      onChange={(e) => setSelectedRoom(prev => ({ ...prev, room_number: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Input
                      id="notes"
                      placeholder="Any special requests or notes"
                      value={selectedRoom.notes}
                      onChange={(e) => setSelectedRoom(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={handleAssignRoom}
                      disabled={!selectedRoom.room_number || !selectedRoom.building || isAssigning}
                      className="flex-1"
                    >
                      {isAssigning ? (
                        <LoadingSpinner size="sm" className="mr-2" />
                      ) : null}
                      {hasRoom ? 'Reassign Room' : 'Assign Room'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {hasRoom && hasPermission('write') && (
              <Button variant="destructive" onClick={handleRemoveFromRoom}>
                <DoorOpen className="h-4 w-4 mr-2" />
                Remove from Room
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Current Room Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bed className="h-5 w-5 mr-2" />
            Current Assignment
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasRoom ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Building</p>
                    <p className="font-medium">{pilgrim.building}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Room</p>
                    <p className="font-medium">Floor {pilgrim.floor} - Room {pilgrim.room_number}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Roommates</p>
                    <p className="font-medium">
                      {occupancy?.rooms
                        .find(r => r.number === pilgrim.room_number && r.building === pilgrim.building && r.floor === pilgrim.floor)
                        ?.pilgrims?.length || 1} people
                    </p>
                  </div>
                </div>
              </div>

              {/* Roommates */}
              {occupancy?.rooms
                .find(r => r.number === pilgrim.room_number && r.building === pilgrim.building && r.floor === pilgrim.floor)
                ?.pilgrims && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Roommates</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {occupancy.rooms
                      .find(r => r.number === pilgrim.room_number && r.building === pilgrim.building && r.floor === pilgrim.floor)
                      ?.pilgrims
                      .filter(p => p.pilgrim_id !== pilgrim.id)
                      .map((roommate) => (
                        <div key={roommate.pilgrim_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{roommate.name}</p>
                            <p className="text-sm text-gray-500">Bed {roommate.bed_number}</p>
                          </div>
                          <Badge variant="outline">
                            {formatDate(roommate.assigned_at)}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <DoorOpen className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 mb-4">No room assigned yet</p>
              {hasPermission('write') && (
                <Button onClick={() => setShowAssignDialog(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign Room
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Rooms */}
      {hasPermission('write') && (
        <Card>
          <CardHeader>
            <CardTitle>Available Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            {availableRooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableRooms.map((room: Room) => (
                  <div key={room.id} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Floor {room.floor} - Room {room.number}</h4>
                      <Badge variant="outline">{room.type}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{room.building}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span>Occupancy: {room.current_occupancy}/{room.capacity}</span>
                      <span className="text-green-600">Available</span>
                    </div>
                    {room.pilgrims.length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        Current: {room.pilgrims.map(p => p.name).join(', ')}
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => {
                        setSelectedRoom({
                          room_number: room.number,
                          building: room.building,
                          floor: room.floor,
                          notes: '',
                        })
                        setShowAssignDialog(true)
                      }}
                    >
                      Assign to this room
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  No available rooms found for this pilgrim's gender. All rooms may be full or under maintenance.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Room Occupancy Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Building Occupancy Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {BUILDINGS.map((building) => {
              const buildingRooms = occupancy?.rooms?.filter(r => r.building === building.value) || []
              const occupiedRooms = buildingRooms.filter(r => r.current_occupancy > 0)
              const totalOccupancy = buildingRooms.reduce((sum, r) => sum + r.current_occupancy, 0)
              const totalCapacity = buildingRooms.reduce((sum, r) => sum + r.capacity, 0)

              return (
                <div key={building.value} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">{building.label}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Rooms:</span>
                      <span>{occupiedRooms.length}/{buildingRooms.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Occupancy:</span>
                      <span>{totalOccupancy}/{totalCapacity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Fill Rate:</span>
                      <span>{totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0}%</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}