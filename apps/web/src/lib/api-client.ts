import type { ScanRequest, ScanResponse, ScanResult } from '@repolens/shared'
import { authClient } from '@/lib/auth-client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl
  }

  private async getAuthToken(): Promise<string | null> {
    // Get token from session if available
    if (typeof window !== 'undefined') {
      const session = await authClient.getSession();
      return session.data?.session.token || null;
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

  private async getUserId(): Promise<string> {
    if (typeof window !== 'undefined') {
      const session = await authClient.getSession();
      return session.data?.user.id || 'guest';
    }
    return 'guest';
  }

  private addUserIdToPath(path: string, userId: string): string {
    const separator = path.includes('?') ? '&' : '?'
    return `${path}${separator}userId=${userId}`
  }

  async get<T>(path: string): Promise<T> {
    const userId = await this.getUserId()
    const finalPath = this.addUserIdToPath(path, userId)
    const response = await this.fetchWithAuth(`${this.baseUrl}/api${finalPath}`)
    
    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`)
    }
    
    return response.json()
  }

  async post<T>(path: string, data: any): Promise<T> {
    const userId = await this.getUserId()
    const finalPath = this.addUserIdToPath(path, userId)
    const response = await this.fetchWithAuth(`${this.baseUrl}/api${finalPath}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`)
    }
    
    return response.json()
  }

  async delete<T>(path: string): Promise<T> {
    const userId = await this.getUserId()
    const finalPath = this.addUserIdToPath(path, userId)
    const response = await this.fetchWithAuth(`${this.baseUrl}/api${finalPath}`, {
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
