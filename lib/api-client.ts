/**
 * EVon API Client - Handles all communication between frontend and backend
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

interface APIError {
  message: string
  code: string
  status: number
}

class EVonAPIClient {
  private baseUrl: string
  private headers: Record<string, string>

  constructor(baseUrl: string = BACKEND_URL) {
    this.baseUrl = baseUrl
    this.headers = {
      'Content-Type': 'application/json',
    }
  }

  /**
   * Generic fetch wrapper with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers,
        },
      })

      if (!response.ok) {
        const error: APIError = {
          message: `API Error: ${response.statusText}`,
          code: `HTTP_${response.status}`,
          status: response.status,
        }

        try {
          const data = await response.json()
          error.message = data.message || error.message
          error.code = data.code || error.code
        } catch {
          // Use default error if response isn't JSON
        }

        throw error
      }

      return (await response.json()) as T
    } catch (error) {
      if (error instanceof APIError) throw error

      throw {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'NETWORK_ERROR',
        status: 0,
      } as APIError
    }
  }

  // ========== Stations ==========

  /**
   * Search for nearby EV charging stations
   */
  async searchStations(params: {
    latitude?: number
    longitude?: number
    radius?: number
    sortBy?: 'distance' | 'price' | 'rating' | 'availability'
  }) {
    const queryParams = new URLSearchParams()
    if (params.latitude) queryParams.append('latitude', params.latitude.toString())
    if (params.longitude) queryParams.append('longitude', params.longitude.toString())
    if (params.radius) queryParams.append('radius', params.radius.toString())
    if (params.sortBy) queryParams.append('sortBy', params.sortBy)

    return this.request(`/api/stations?${queryParams.toString()}`)
  }

  /**
   * Get details for a specific station
   */
  async getStationDetails(stationId: string) {
    return this.request(`/api/stations/${stationId}`)
  }

  /**
   * Get station availability history
   */
  async getStationHistory(stationId: string) {
    return this.request(`/api/stations/${stationId}/history`)
  }

  // ========== Predictions ==========

  /**
   * Get demand prediction for a station
   */
  async predictDemand(params: {
    station_id: string
    hour?: number
    day_of_week?: number
    month?: number
    temperature?: number
  }) {
    return this.request('/api/predictions', {
      method: 'POST',
      body: JSON.stringify({
        type: 'demand',
        ...params,
      }),
    })
  }

  /**
   * Get load forecast
   */
  async forecastLoad(params: {
    hour?: number
    day_of_week?: number
    month?: number
    available_capacity?: number
  }) {
    return this.request('/api/predictions', {
      method: 'POST',
      body: JSON.stringify({
        type: 'load',
        ...params,
      }),
    })
  }

  /**
   * Predict charging time
   */
  async predictChargingTime(params: {
    battery_size: number
    charger_type: number
    current_charge: number
    target_charge: number
  }) {
    return this.request('/api/predictions', {
      method: 'POST',
      body: JSON.stringify({
        type: 'charging_time',
        ...params,
      }),
    })
  }

  /**
   * Get station recommendations
   */
  async getRecommendations(params: {
    latitude: number
    longitude: number
    radius?: number
    preferences?: {
      maxPrice?: number
      minRating?: number
      chargerType?: number
    }
  }) {
    return this.request('/api/predictions', {
      method: 'POST',
      body: JSON.stringify({
        type: 'recommendation',
        ...params,
      }),
    })
  }

  // ========== Bookings ==========

  /**
   * Get user's bookings
   */
  async getBookings() {
    return this.request('/api/bookings')
  }

  /**
   * Get booking details
   */
  async getBookingDetails(bookingId: string) {
    return this.request(`/api/bookings/${bookingId}`)
  }

  /**
   * Create a new booking
   */
  async createBooking(params: {
    station_id: string
    charger_type: number
    start_time: string
    duration_minutes: number
    target_charge_percentage: number
  }) {
    return this.request('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  /**
   * Update a booking
   */
  async updateBooking(
    bookingId: string,
    updates: {
      status?: 'pending' | 'active' | 'completed' | 'cancelled'
      charging_progress?: number
    }
  ) {
    return this.request(`/api/bookings/${bookingId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId: string) {
    return this.request(`/api/bookings/${bookingId}`, {
      method: 'DELETE',
    })
  }

  /**
   * Get booking history
   */
  async getBookingHistory(params?: { limit?: number; offset?: number }) {
    const queryParams = new URLSearchParams()
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.offset) queryParams.append('offset', params.offset.toString())

    return this.request(`/api/bookings/history?${queryParams.toString()}`)
  }

  // ========== User ==========

  /**
   * Get current user profile
   */
  async getUserProfile() {
    return this.request('/api/user/profile')
  }

  /**
   * Update user profile
   */
  async updateUserProfile(data: Record<string, any>) {
    return this.request('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  /**
   * Get user statistics
   */
  async getUserStats() {
    return this.request('/api/user/statistics')
  }

  /**
   * Get favorite stations
   */
  async getFavoriteStations() {
    return this.request('/api/user/favorites')
  }

  /**
   * Add station to favorites
   */
  async addToFavorites(stationId: string) {
    return this.request('/api/user/favorites', {
      method: 'POST',
      body: JSON.stringify({ station_id: stationId }),
    })
  }

  /**
   * Remove station from favorites
   */
  async removeFromFavorites(stationId: string) {
    return this.request(`/api/user/favorites/${stationId}`, {
      method: 'DELETE',
    })
  }

  // ========== Analytics ==========

  /**
   * Get charging analytics
   */
  async getAnalytics(params?: {
    startDate?: string
    endDate?: string
    groupBy?: 'day' | 'week' | 'month'
  }) {
    const queryParams = new URLSearchParams()
    if (params?.startDate) queryParams.append('startDate', params.startDate)
    if (params?.endDate) queryParams.append('endDate', params.endDate)
    if (params?.groupBy) queryParams.append('groupBy', params.groupBy)

    return this.request(`/api/analytics?${queryParams.toString()}`)
  }

  /**
   * Get cost analysis
   */
  async getCostAnalysis() {
    return this.request('/api/analytics/costs')
  }

  /**
   * Get emissions data
   */
  async getEmissionsData() {
    return this.request('/api/analytics/emissions')
  }

  // ========== Health ==========

  /**
   * Check API health
   */
  async healthCheck() {
    try {
      return await this.request('/health')
    } catch {
      return { status: 'unhealthy' }
    }
  }

  /**
   * Get API version
   */
  async getVersion() {
    return this.request('/api/version')
  }
}

// Create singleton instance
export const apiClient = new EVonAPIClient()

export type { APIError }
