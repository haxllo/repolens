import type { ScanRequest, ScanResponse, ScanResult } from '@repolens/shared'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl
  }

  async createScan(data: ScanRequest): Promise<ScanResponse> {
    const response = await fetch(`${this.baseUrl}/api/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to create scan: ${response.statusText}`)
    }

    return response.json()
  }

  async getScanStatus(scanId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/scan/${scanId}`)

    if (!response.ok) {
      throw new Error(`Failed to get scan status: ${response.statusText}`)
    }

    return response.json()
  }

  async getScanResults(scanId: string): Promise<ScanResult> {
    const response = await fetch(`${this.baseUrl}/api/scan/${scanId}/results`)

    if (!response.ok) {
      throw new Error(`Failed to get scan results: ${response.statusText}`)
    }

    return response.json()
  }

  async healthCheck(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/health`)
    return response.json()
  }
}

export const apiClient = new ApiClient()
