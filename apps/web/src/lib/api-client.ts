import type { ScanRequest, ScanResponse, ScanResult } from '@repolens/shared'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path.startsWith('/') ? path : `/api${path}`}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API Request Failed: ${response.statusText} (${response.status})`)
    }

    if (response.status === 204) {
      return {} as T
    }

    return response.json()
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'GET' })
  }

  async post<T>(path: string, data: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' })
  }

  async createScan(data: ScanRequest): Promise<ScanResponse> {
    return this.post<ScanResponse>('/scan', data)
  }

  async getScanStatus(scanId: string): Promise<unknown> {
    return this.get<unknown>(`/scan/${scanId}`)
  }

  async getScanResults(scanId: string): Promise<ScanResult> {
    return this.get<ScanResult>(`/scan/${scanId}/results`)
  }

  async healthCheck(): Promise<unknown> {
    return this.get<unknown>('/health')
  }
}

export const apiClient = new ApiClient()