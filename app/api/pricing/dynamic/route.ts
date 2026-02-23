import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/pricing/dynamic
 * Calculate dynamic pricing based on demand, availability, and time
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const stationId = searchParams.get('stationId')
    const duration = parseInt(searchParams.get('duration') || '60') // minutes

    if (!stationId) {
      return NextResponse.json(
        { error: 'stationId parameter is required' },
        { status: 400 }
      )
    }

    const station = await prisma.station.findUnique({
      where: { id: stationId },
      select: {
        pricePerKwh: true,
        availableChargers: true,
        totalChargers: true,
        demandLevel: true,
        powerRatingKw: true,
      },
    })

    if (!station) {
      return NextResponse.json(
        { error: 'Station not found' },
        { status: 404 }
      )
    }

    // Calculate dynamic price multiplier
    const pricing = calculateDynamicPrice(
      station.pricePerKwh,
      station.availableChargers || 0,
      station.totalChargers || 1,
      station.demandLevel,
      duration
    )

    // Get price history
    const priceHistory = await prisma.priceHistory.findMany({
      where: { stationId },
      orderBy: { timestamp: 'desc' },
      take: 24,
    })

    return NextResponse.json(
      {
        basePrice: station.pricePerKwh,
        dynamicPrice: pricing.finalPrice,
        multiplier: pricing.multiplier,
        factors: pricing.factors,
        estimatedCost: (pricing.finalPrice * duration * (station.powerRatingKw || 7)) / 60,
        priceHistory: priceHistory.map(h => ({
          timestamp: h.timestamp,
          basePrice: h.basePrice,
          dynamicPrice: h.dynamicPrice,
          reason: h.reasonForAdjustment,
        })),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Pricing error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate pricing' },
      { status: 500 }
    )
  }
}

/**
 * Calculate dynamic price based on multiple factors
 */
function calculateDynamicPrice(
  basePrice: number,
  availableChargers: number,
  totalChargers: number,
  demandLevel: string,
  durationMinutes: number
) {
  let multiplier = 1.0
  const factors: string[] = []
  const reasons: string[] = []

  // Factor 1: Availability (supply-side)
  const availabilityRatio = availableChargers / Math.max(totalChargers, 1)

  if (availabilityRatio < 0.2) {
    multiplier *= 1.5 // 50% premium when critically low
    factors.push('criticalAvailability')
    reasons.push('low_availability')
  } else if (availabilityRatio < 0.4) {
    multiplier *= 1.3 // 30% premium when scarce
    factors.push('lowAvailability')
    reasons.push('low_availability')
  } else if (availabilityRatio < 0.6) {
    multiplier *= 1.1 // 10% premium when moderate
    factors.push('moderateAvailability')
    reasons.push('moderate_availability')
  } else if (availabilityRatio > 0.8) {
    multiplier *= 0.85 // 15% discount when plenty available
    factors.push('highAvailability')
    reasons.push('high_availability')
  }

  // Factor 2: Demand level
  switch (demandLevel.toLowerCase()) {
    case 'high':
      multiplier *= 1.4
      factors.push('highDemand')
      reasons.push('high_demand')
      break
    case 'medium':
      multiplier *= 1.15
      factors.push('mediumDemand')
      reasons.push('medium_demand')
      break
    case 'low':
      multiplier *= 0.9
      factors.push('lowDemand')
      reasons.push('low_demand')
      break
  }

  // Factor 3: Time-based surge pricing
  const now = new Date()
  const hour = now.getHours()
  const dayOfWeek = now.getDay()

  // Peak hours: 7-9am, 5-7pm (weekdays), 12-1pm
  let isPeakTime = false
  if (dayOfWeek !== 0 && dayOfWeek !== 6) {
    // Weekday
    if ((hour >= 7 && hour < 9) || (hour >= 17 && hour < 19) || (hour >= 12 && hour < 13)) {
      multiplier *= 1.25
      factors.push('peakHours')
      reasons.push('peak_hours')
      isPeakTime = true
    }
  } else {
    // Weekend - different peak times
    if ((hour >= 10 && hour < 12) || (hour >= 15 && hour < 17)) {
      multiplier *= 1.15
      factors.push('weekendPeak')
      reasons.push('weekend_demand')
      isPeakTime = true
    }
  }

  // Off-peak discount
  if (hour >= 23 || hour < 5) {
    multiplier *= 0.8
    factors.push('offPeakDiscount')
    reasons.push('off_peak')
  }

  // Factor 4: Duration-based loyalty discount
  if (durationMinutes >= 240) {
    // 4+ hours
    multiplier *= 0.95
    factors.push('longDurationDiscount')
    reasons.push('long_duration_discount')
  } else if (durationMinutes >= 480) {
    // 8+ hours
    multiplier *= 0.9
    factors.push('veryLongDurationDiscount')
    reasons.push('very_long_duration_discount')
  }

  // Cap multiplier between 0.7x and 2.5x
  multiplier = Math.max(0.7, Math.min(2.5, multiplier))

  return {
    finalPrice: parseFloat((basePrice * multiplier).toFixed(4)),
    multiplier: parseFloat(multiplier.toFixed(3)),
    factors,
    reasons: [...new Set(reasons)],
  }
}

/**
 * POST /api/pricing/dynamic
 * Record pricing decision for analytics and ML feedback
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { stationId, basePrice, dynamicPrice, demandLevel, reason } = data

    // Record price history
    await prisma.priceHistory.create({
      data: {
        stationId,
        basePrice,
        dynamicPrice,
        demandLevel,
        reasonForAdjustment: reason,
      },
    })

    return NextResponse.json(
      { success: true, message: 'Price recorded' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Price recording error:', error)
    return NextResponse.json(
      { error: 'Failed to record price' },
      { status: 500 }
    )
  }
}
