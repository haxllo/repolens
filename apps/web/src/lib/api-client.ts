import type { ScanRequest, ScanResponse, ScanResult } from '@repolens/shared'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl
  }

  private async getAuthToken(): Promise<string | null> {
    // Get token from session if available
    if (typeof window !== 'undefined') {
      const session = await fetch('/api/auth/session').then(r => r.json())
      return session?.accessToken || null
    }
    return null
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = await this.getAuthToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    return fetch(url, {
      ...options,
      headers,
    })
  }

  async get<T>(path: string): Promise<T> {
    // Add userId=guest param for guest users
    const separator = path.includes('?') ? '&' : '?'
    const pathWithUserId = `${path}${separator}userId=guest`
    const response = await this.fetchWithAuth(`${this.baseUrl}/api${pathWithUserId}`)
    
    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`)
    }
    
    return response.json()
  }

  async post<T>(path: string, data: any): Promise<T> {
    const response = await this.fetchWithAuth(`${this.baseUrl}/api${path}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`)
    }
    
    return response.json()
  }

  async delete<T>(path: string): Promise<T> {
    const response = await this.fetchWithAuth(`${this.baseUrl}/api${path}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`)
    }
    
    return response.json()
  }

  async createScan(data: ScanRequest): Promise<ScanResponse> {
    return this.post<ScanResponse>('/scan', data)
  }

  async getScanStatus(scanId: string): Promise<any> {
    return this.get(`/scan/${scanId}`)
  }

  async getScanResults(scanId: string): Promise<ScanResult> {
    return this.get<ScanResult>(`/scan/${scanId}/results`)
  }

  async healthCheck(): Promise<any> {
    return this.get('/health')
  }
}

export const apiClient = new ApiClient()
