'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Upload,
  Download,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  Trash2
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { getApiUrl } from '@/lib/api'
import { formatDate, getStatusColor } from '@/lib/utils'
import { useParams } from 'next/navigation'

interface PilgrimDocument {
  id: string
  type: string
  name: string
  url: string
  uploaded_at: string
  verified_at?: string
  verification_status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NEEDS_REVISION'
  verification_notes?: string
  verified_by?: string
  file_size: number
  mime_type: string
}

interface Pilgrim {
  id: string
  name: string
  document_completion: number
  booking?: {
    booking_code: string
    package: {
      name: string
    }
  }
}

const REQUIRED_DOCUMENTS = [
  { type: 'PASSPORT_COPY', name: 'Passport Copy', required: true },
  { type: 'ID_CARD', name: 'ID Card (KTP)', required: true },
  { type: 'BIRTH_CERTIFICATE', name: 'Birth Certificate', required: true },
  { type: 'MARRIAGE_CERTIFICATE', name: 'Marriage Certificate', required: false },
  { type: 'PHOTO_4X6', name: '4x6 Photo', required: true },
  { type: 'VACCINATION_CERTIFICATE', name: 'Vaccination Certificate', required: true },
  { type: 'FAMILY_CARD', name: 'Family Card', required: false },
  { type: 'VISA', name: 'Visa', required: false },
]

export default function PilgrimDocumentsPage() {
  const { user, hasPermission } = useAuth()
  const params = useParams()
  const pilgrimId = params.id as string
  const queryClient = useQueryClient()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState('')
  const [isUploading, setIsUploading] = useState(false)

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

  const { data: documentsData, isLoading: documentsLoading } = useQuery({
    queryKey: ['pilgrim-documents', pilgrimId],
    queryFn: async () => {
      const response = await fetch(`${getApiUrl()}/pilgrim-documents/pilgrim/${pilgrimId}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'X-Tenant-Id': user?.tenantSlug || 'demo',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch documents')
      }

      return response.json()
    },
    enabled: !!user?.token && !!pilgrimId,
  })

  const uploadDocumentMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch(`${getApiUrl()}/pilgrim-documents/upload`, {
        method: 'POST',
        body: data,
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'X-Tenant-Id': user?.tenantSlug || 'demo',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to upload document')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilgrim-documents', pilgrimId] })
      queryClient.invalidateQueries({ queryKey: ['pilgrim', pilgrimId] })
      setSelectedFile(null)
      setDocumentType('')
      setIsUploading(false)
    },
    onError: () => {
      setIsUploading(false)
    },
  })

  const verifyDocumentMutation = useMutation({
    mutationFn: async ({ documentId, status, notes }: {
      documentId: string
      status: 'VERIFIED' | 'REJECTED' | 'NEEDS_REVISION'
      notes?: string
    }) => {
      const response = await fetch(`${getApiUrl()}/pilgrim-documents/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
          'X-Tenant-Id': user?.tenantSlug || 'demo',
        },
        body: JSON.stringify({
          document_id: documentId,
          status,
          notes,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to verify document')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilgrim-documents', pilgrimId] })
      queryClient.invalidateQueries({ queryKey: ['pilgrim', pilgrimId] })
    },
  })

  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const response = await fetch(`${getApiUrl()}/pilgrim-documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'X-Tenant-Id': user?.tenantSlug || 'demo',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete document')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilgrim-documents', pilgrimId] })
      queryClient.invalidateQueries({ queryKey: ['pilgrim', pilgrimId] })
    },
  })

  const handleFileUpload = () => {
    if (!selectedFile || !documentType || isUploading) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('pilgrim_id', pilgrimId)
    formData.append('document_type', documentType)

    uploadDocumentMutation.mutate(formData)
  }

  const handleVerifyDocument = (documentId: string, status: 'VERIFIED' | 'REJECTED' | 'NEEDS_REVISION', notes?: string) => {
    verifyDocumentMutation.mutate({ documentId, status, notes })
  }

  const handleDeleteDocument = (documentId: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      deleteDocumentMutation.mutate(documentId)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'NEEDS_REVISION':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (pilgrimLoading || documentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const pilgrim = pilgrimData?.pilgrim as Pilgrim
  const documents = documentsData?.documents as PilgrimDocument[] || []

  if (!pilgrim) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Pilgrim not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Document Management</h1>
          <p className="text-gray-500">
            {pilgrim.name} - {pilgrim.booking?.booking_code} - {pilgrim.booking?.package?.name}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-2xl font-bold">{pilgrim.document_completion}%</div>
            <div className="text-sm text-gray-500">Complete</div>
          </div>
          <div className="w-32">
            <Progress value={pilgrim.document_completion} className="h-2" />
          </div>
        </div>
      </div>

      <Tabs defaultValue="documents" className="space-y-6">
        <TabsList>
          <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
          <TabsTrigger value="upload">Upload Document</TabsTrigger>
          {hasPermission('verify') && (
            <TabsTrigger value="pending">Pending Verification</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="documents" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((document) => (
              <Card key={document.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{document.type}</CardTitle>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(document.verification_status)}
                      <Badge className={getStatusColor(document.verification_status)}>
                        {document.verification_status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate">{document.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(document.file_size)} • {formatDate(document.uploaded_at)}
                    </p>
                  </div>

                  {document.verification_notes && (
                    <div className="p-2 bg-gray-50 rounded text-sm">
                      <p className="font-medium text-gray-700">Notes:</p>
                      <p className="text-gray-600">{document.verification_notes}</p>
                    </div>
                  )}

                  {document.verified_at && (
                    <div className="text-xs text-gray-500">
                      Verified on {formatDate(document.verified_at)}
                      {document.verified_by && ` by ${document.verified_by}`}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(document.url, '_blank')}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const a = document.createElement('a')
                          a.href = document.url
                          a.download = document.name
                          a.click()
                        }}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>

                    {hasPermission('write') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDocument(document.id)}
                        disabled={deleteDocumentMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>

                  {hasPermission('verify') && document.verification_status === 'PENDING' && (
                    <div className="flex items-center space-x-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerifyDocument(document.id, 'VERIFIED')}
                        disabled={verifyDocumentMutation.isPending}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Verify
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const notes = prompt('Rejection reason (optional):')
                          if (notes !== null) {
                            handleVerifyDocument(document.id, 'REJECTED', notes)
                          }
                        }}
                        disabled={verifyDocumentMutation.isPending}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {documents.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No documents uploaded yet</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          {hasPermission('write') ? (
            <Card>
              <CardHeader>
                <CardTitle>Upload New Document</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Type
                  </label>
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      {REQUIRED_DOCUMENTS.map((doc) => (
                        <SelectItem key={doc.type} value={doc.type}>
                          {doc.name} {doc.required && '*'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select File
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                  {selectedFile && (
                    <p className="text-xs text-gray-500 mt-1">
                      Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleFileUpload}
                  disabled={!selectedFile || !documentType || isUploading}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Upload Document'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-gray-500">You don't have permission to upload documents</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {hasPermission('verify') && (
          <TabsContent value="pending" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents
                .filter(doc => doc.verification_status === 'PENDING')
                .map((document) => (
                  <Card key={document.id} className="border-yellow-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">{document.type}</CardTitle>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          Pending
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate">{document.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(document.file_size)} • {formatDate(document.uploaded_at)}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(document.url, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerifyDocument(document.id, 'VERIFIED')}
                          disabled={verifyDocumentMutation.isPending}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Verify
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const notes = prompt('Rejection reason (optional):')
                            if (notes !== null) {
                              handleVerifyDocument(document.id, 'REJECTED', notes)
                            }
                          }}
                          disabled={verifyDocumentMutation.isPending}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

              {documents.filter(doc => doc.verification_status === 'PENDING').length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-2" />
                      <p className="text-gray-500">No pending documents</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}