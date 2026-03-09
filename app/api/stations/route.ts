import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { successResponse, errorResponse, asyncHandler, checkRateLimit } from '@/lib/api-middleware'
/**
 * GET /api/stations - Fetch all EV charging stations
 * Optionally filter and sort by various parameters
 * Rate limited to 100 requests/minute
 */
export const GET = asyncHandler(async (request: NextRequest) => {
  // Rate limiting
  const rateLimitError = checkRateLimit(request)
  if (rateLimitError) return rateLimitError

  try {
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const sortBy = searchParams.get('sortBy') || 'stationName'

    // Build query with pagination
    const stations = await prisma.station.findMany({
      orderBy: { [sortBy]: 'asc' },
      take: limit,
      skip: offset,
    })

    // Get total count for pagination
    const total = await prisma.station.count()

    return successResponse(
      {
        data: stations,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
      200
    )
  } catch (error) {
    console.error('Error fetching stations:', error)
    return errorResponse(
      'Failed to fetch stations',
      'FETCH_STATIONS_ERROR',
      500
    )
  }
})

/**
 * POST /api/stations - Create new charging station (admin only)
 */
export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitError = checkRateLimit(request, 50)
  if (rateLimitError) return rateLimitError

  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ['stationId', 'stationName', 'address', 'lat', 'lng']
    const missingFields = requiredFields.filter(field => !body[field])

    if (missingFields.length > 0) {
      return errorResponse(
        `Missing required fields: ${missingFields.join(', ')}`,
        'MISSING_FIELDS',
        400
      )
    }

    // Validate coordinates
    if (isNaN(body.lat) || isNaN(body.lng) || body.lat < -90 || body.lat > 90) {
      return errorResponse(
        'Invalid latitude/longitude coordinates',
        'INVALID_COORDINATES',
        400
      )
    }

    const station = await prisma.station.create({
      data: {
        stationId: body.stationId,
        stationName: body.stationName,
        address: body.address,
        lat: body.lat,
        lng: body.lng,
        totalChargers: body.totalChargers || 0,
        availableChargers: body.availableChargers || 0,
        powerRatingKw: body.powerRatingKw || 0,
        pricePerKwh: body.pricePerKwh || 0.35,
        accessType: body.accessType || 'public',
      },
    })

    return successResponse(station, 201)
  } catch (error: any) {
    console.error('Error creating station:', error)

    if (error.code === 'P2002') {
      return errorResponse(
        'Station ID already exists',
        'DUPLICATE_STATION',
        409
      )
    }

    return errorResponse(
      'Failed to create station',
      'CREATE_STATION_ERROR',
      500
    )
  }
}
