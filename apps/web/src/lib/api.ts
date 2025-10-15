import axios, { AxiosResponse } from 'axios'
import { getTenantHeader } from '@/contexts/tenant-context'

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add tenant header
api.interceptors.request.use(
  (config) => {
    const tenantHeader = getTenantHeader()
    config.headers = {
      ...config.headers,
      ...tenantHeader,
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Refresh token logic
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            { refreshToken },
            { headers: getTenantHeader() }
          )

          const { accessToken, refreshToken: newRefreshToken } = response.data
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', newRefreshToken)

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/auth/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// API response wrapper
interface ApiResponse<T = any> {
  data: T
  message: string
  success: boolean
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

// Generic API methods
export const apiClient = {
  get: <T>(url: string, config?: any): Promise<AxiosResponse<ApiResponse<T>>> =>
    api.get(url, config),

  post: <T>(url: string, data?: any, config?: any): Promise<AxiosResponse<ApiResponse<T>>> =>
    api.post(url, data, config),

  put: <T>(url: string, data?: any, config?: any): Promise<AxiosResponse<ApiResponse<T>>> =>
    api.put(url, data, config),

  patch: <T>(url: string, data?: any, config?: any): Promise<AxiosResponse<ApiResponse<T>>> =>
    api.patch(url, data, config),

  delete: <T>(url: string, config?: any): Promise<AxiosResponse<ApiResponse<T>>> =>
    api.delete(url, config),
}

// Specific API endpoints
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiClient.post('/auth/login', credentials),

  logout: () =>
    apiClient.post('/auth/logout'),

  refresh: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refreshToken }),

  me: () =>
    apiClient.get('/auth/me'),

  requestOtp: (email: string) =>
    apiClient.post('/auth/otp/request', { email }),

  verifyOtp: (email: string, otp: string) =>
    apiClient.post('/auth/otp/verify', { email, otp }),

  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),
}

export const usersApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get('/users', { params }),

  getMe: () =>
    apiClient.get('/users/me'),

  getById: (id: string) =>
    apiClient.get(`/users/${id}`),

  create: (data: any) =>
    apiClient.post('/users', data),

  update: (id: string, data: any) =>
    apiClient.put(`/users/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/users/${id}`),

  activate: (id: string) =>
    apiClient.post(`/users/${id}/activate`),

  deactivate: (id: string) =>
    apiClient.post(`/users/${id}/deactivate`),

  resetPassword: (id: string, newPassword: string) =>
    apiClient.post(`/users/${id}/reset-password`, { newPassword }),
}

export const packagesApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; status?: string }) =>
    apiClient.get('/packages', { params }),

  getPublished: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get('/packages/published', { params }),

  getById: (id: string) =>
    apiClient.get(`/packages/${id}`),

  create: (data: any) =>
    apiClient.post('/packages', data),

  update: (id: string, data: any) =>
    apiClient.put(`/packages/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/packages/${id}`),

  publish: (id: string) =>
    apiClient.post(`/packages/${id}/publish`),

  duplicate: (id: string) =>
    apiClient.post(`/packages/${id}/duplicate`),
}

export const customersApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get('/customers', { params }),

  search: (query: string) =>
    apiClient.get('/customers/search', { params: { q: query } }),

  getById: (id: string) =>
    apiClient.get(`/customers/${id}`),

  getBookings: (id: string) =>
    apiClient.get(`/customers/${id}/bookings`),

  create: (data: any) =>
    apiClient.post('/customers', data),

  update: (id: string, data: any) =>
    apiClient.put(`/customers/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/customers/${id}`),

  import: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post('/customers/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  exportExcel: (params?: any) =>
    apiClient.get('/customers/export/excel', {
      params,
      responseType: 'blob'
    }),

  getStats: () =>
    apiClient.get('/customers/stats/overview'),
}

export const bookingsApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; status?: string }) =>
    apiClient.get('/bookings', { params }),

  search: (query: string) =>
    apiClient.get('/bookings/search', { params: { q: query } }),

  getById: (id: string) =>
    apiClient.get(`/bookings/${id}`),

  getPilgrims: (id: string) =>
    apiClient.get(`/bookings/${id}/pilgrims`),

  create: (data: any) =>
    apiClient.post('/bookings', data),

  update: (id: string, data: any) =>
    apiClient.put(`/bookings/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/bookings/${id}`),

  confirm: (id: string) =>
    apiClient.post(`/bookings/${id}/confirm`),

  cancel: (id: string, reason?: string) =>
    apiClient.post(`/bookings/${id}/cancel`, { reason }),

  addPilgrims: (id: string, pilgrims: any[]) =>
    apiClient.post(`/bookings/${id}/add-pilgrims`, { pilgrims }),

  getStats: () =>
    apiClient.get('/bookings/stats/overview'),
}

export default api