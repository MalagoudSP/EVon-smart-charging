/**
 * Utility functions for EV Station data processing and calculations
 */

export interface Station {
  id: string
  name: string
  latitude: number
  longitude: number
  available_chargers: number
  total_chargers: number
  price_per_kwh: number
  distance?: number
  availability_status: string
  charger_types: {
    level1: number
    level2: number
    dc_fast: number
  }
  average_rating: number
  reviews_count: number
}

/**
 * Calculate distance between two geographic points using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Calculate availability percentage
 */
export function getAvailabilityPercentage(station: Station): number {
  return Math.round((station.available_chargers / station.total_chargers) * 100)
}

/**
 * Get availability status with color
 */
export function getAvailabilityStatus(
  station: Station
): { status: string; color: string } {
  const percentage = getAvailabilityPercentage(station)

  if (percentage >= 75) {
    return { status: 'Available', color: 'bg-green-100 text-green-800' }
  } else if (percentage >= 40) {
    return { status: 'Moderate', color: 'bg-yellow-100 text-yellow-800' }
  } else {
    return { status: 'Busy', color: 'bg-red-100 text-red-800' }
  }
}

/**
 * Estimate charging cost
 */
export function estimateChargingCost(
  station: Station,
  batterySize: number,
  currentCharge: number,
  targetCharge: number
): number {
  const requiredKwh = (batterySize * (targetCharge - currentCharge)) / 100
  return requiredKwh * station.price_per_kwh
}

/**
 * Estimate charging time based on charger type
 */
export function estimateChargingTime(
  batterySize: number,
  currentCharge: number,
  targetCharge: number,
  chargerType: number
): number {
  const requiredKwh = (batterySize * (targetCharge - currentCharge)) / 100

  // Charger power output (kW)
  let chargerPower = 1.4 // Level 1
  if (chargerType === 2) chargerPower = 7.7 // Level 2
  if (chargerType === 3) chargerPower = 50 // DC Fast

  // Efficiency factor
  const efficiency = 0.9

  // Time in minutes
  return (requiredKwh / (chargerPower * efficiency)) * 60
}

/**
 * Format station name with city
 */
export function formatStationName(station: Station): string {
  return station.name
}

/**
 * Get charger type label
 */
export function getChargerTypeLabel(type: number): string {
  switch (type) {
    case 1:
      return 'Level 1 (120V, 1.4kW)'
    case 2:
      return 'Level 2 (240V, 7.7kW)'
    case 3:
      return 'DC Fast Charging (50kW+)'
    default:
      return 'Unknown'
  }
}

/**
 * Sort stations by criteria
 */
export function sortStations(
  stations: Station[],
  sortBy: 'distance' | 'price' | 'rating' | 'availability'
): Station[] {
  const sorted = [...stations]

  switch (sortBy) {
    case 'distance':
      return sorted.sort((a, b) => (a.distance || 0) - (b.distance || 0))

    case 'price':
      return sorted.sort((a, b) => a.price_per_kwh - b.price_per_kwh)

    case 'rating':
      return sorted.sort((a, b) => b.average_rating - a.average_rating)

    case 'availability':
      return sorted.sort(
        (a, b) =>
          (b.available_chargers / b.total_chargers) -
          (a.available_chargers / a.total_chargers)
      )

    default:
      return sorted
  }
}

/**
 * Filter stations by criteria
 */
export function filterStations(
  stations: Station[],
  criteria: {
    maxDistance?: number
    maxPrice?: number
    minRating?: number
    chargerType?: number
    minAvailable?: number
  }
): Station[] {
  return stations.filter(station => {
    if (criteria.maxDistance && (station.distance || 0) > criteria.maxDistance) {
      return false
    }

    if (criteria.maxPrice && station.price_per_kwh > criteria.maxPrice) {
      return false
    }

    if (criteria.minRating && station.average_rating < criteria.minRating) {
      return false
    }

    if (
      criteria.minAvailable &&
      station.available_chargers < criteria.minAvailable
    ) {
      return false
    }

    if (criteria.chargerType) {
      const hasChargerType =
        (criteria.chargerType === 1 && station.charger_types.level1 > 0) ||
        (criteria.chargerType === 2 && station.charger_types.level2 > 0) ||
        (criteria.chargerType === 3 && station.charger_types.dc_fast > 0)

      if (!hasChargerType) {
        return false
      }
    }

    return true
  })
}

/**
 * Calculate rating stars
 */
export function getRatingStars(rating: number): number {
  return Math.round(rating * 2) / 2
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}/kWh`
}

/**
 * Format distance for display
 */
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`
  }
  return `${distance.toFixed(1)}km`
}

/**
 * Format time duration
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours === 0) {
    return `${mins}m`
  }
  if (mins === 0) {
    return `${hours}h`
  }

  return `${hours}h ${mins}m`
}

/**
 * Calculate total chargers count
 */
export function getTotalChargers(station: Station): number {
  return (
    station.charger_types.level1 +
    station.charger_types.level2 +
    station.charger_types.dc_fast
  )
}

/**
 * Calculate savings compared to home charging
 */
export function calculateSavings(
  publicStationPrice: number,
  homeChargePrice: number,
  batterySize: number,
  chargePercentage: number
): number {
  const energyNeeded = (batterySize * chargePercentage) / 100
  const publicCost = energyNeeded * publicStationPrice
  const homeCost = energyNeeded * homeChargePrice

  return homeCost - publicCost
}

/**
 * Get time until station availability improves
 */
export function getTimeUntilBetter(currentDemand: number): number {
  // Mock calculation - in reality would use prediction model
  const hoursUntilBetter = 24 / (100 - currentDemand)
  return Math.ceil(hoursUntilBetter * 60) // Return as minutes
}

/**
 * Validate booking parameters
 */
export function validateBooking(params: {
  startTime: Date
  duration: number
  batterySize: number
  currentCharge: number
  targetCharge: number
}): { valid: boolean; error?: string } {
  if (params.duration < 15) {
    return { valid: false, error: 'Minimum booking duration is 15 minutes' }
  }

  if (params.duration > 480) {
    return { valid: false, error: 'Maximum booking duration is 8 hours' }
  }

  if (params.currentCharge >= params.targetCharge) {
    return { valid: false, error: 'Target charge must be higher than current' }
  }

  if (params.batterySize <= 0 || params.batterySize > 200) {
    return { valid: false, error: 'Invalid battery size' }
  }

  return { valid: true }
}
