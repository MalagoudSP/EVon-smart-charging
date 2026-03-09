import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { successResponse, errorResponse, validateRequest, asyncHandler, checkRateLimit } from '@/lib/api-middleware'
import { requireAuth } from '@/lib/auth-utils'
import { createBookingSchema, updateBookingSchema } from '@/lib/validation-schemas'


interface BookingRequest {
  station_id: string
  charger_type: number
  start_time: string
  duration_minutes: number
  target_charge_percentage: number
}

interface Booking {
  id: string
  user_id: string
  station_id: string
  status: 'pending' | 'active' | 'completed' | 'cancelled'
  start_time: string
  end_time: string
  duration_minutes: number
  estimated_cost: number
  actual_cost?: number
  charger_type: number
  charging_progress: number
  created_at: string
}

// Mock bookings storage
const bookings: Map<string, Booking> = new Map()

/**
 * GET /api/bookings - Fetch user's bookings
 * Requires authentication, rate limited to 100 requests/minute
 */
export const GET = asyncHandler(async (request: NextRequest) => {
  // Rate limiting check
  const rateLimitError = checkRateLimit(request)
  if (rateLimitError) return rateLimitError

  // Authentication check
  const { session, error: authError } = await requireAuth(request)
  if (authError) return authError

  try {
    const userBookings = Array.from(bookings.values()).filter(
      (b) => b.user_id === session.user?.email
    )

    return successResponse(userBookings, 200)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return errorResponse(
      'Failed to fetch bookings',
      'FETCH_BOOKINGS_ERROR',
      500
    )
  }
})

/**
 * POST /api/bookings - Create new booking
 * Requires authentication, validates input against schema
 */
export const POST = asyncHandler(async (request: NextRequest) => {
  // Rate limiting check
  const rateLimitError = checkRateLimit(request, 50) // Stricter limit for creation
  if (rateLimitError) return rateLimitError

  // Authentication check
  const { session, error: authError } = await requireAuth(request)
  if (authError) return authError

  // Validate request body
  const { data: validatedData, error: validationError } = await validateRequest(
    request,
    createBookingSchema
  )
  if (validationError) return validationError

  try {
    // Verify station exists in database
    const station = await prisma.station.findUnique({
      where: { stationId: validatedData.stationId },
    })

    if (!station) {
      return errorResponse(
        'Station not found',
        'STATION_NOT_FOUND',
        404
      )
    }

    // Create booking with validated data
    const booking: Booking = {
      id: `BK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: session.user?.email || 'unknown',
      station_id: validatedData.stationId,
      status: 'pending',
      start_time: validatedData.date || new Date().toISOString(),
      end_time: new Date(
        new Date(validatedData.date || Date.now()).getTime() +
          ((validatedData.duration ?? 60) * 60000)
      ).toISOString(),
      duration_minutes: validatedData.duration || 60,
      estimated_cost: validatedData.cost || station.pricePerKwh * (validatedData.kWh || 20),
      charger_type: 2,
      charging_progress: 0,
      created_at: new Date().toISOString(),
    }

    bookings.set(booking.id, booking)

    return successResponse(booking, 201)
  } catch (error) {
    console.error('Error creating booking:', error)
    return errorResponse(
      'Failed to create booking',
      'CREATE_BOOKING_ERROR',
      500
    )
  }
})

/**
 * PUT /api/bookings - Update booking
 * Requires authentication, owner validation, schema validation
 */
export async function PUT(request: NextRequest) {
  // Rate limiting check
  const rateLimitError = checkRateLimit(request, 50)
  if (rateLimitError) return rateLimitError

  // Authentication check
  const { session, error: authError } = await requireAuth(request)
  if (authError) return authError

  try {
    const body = await request.json()
    const { id, status, charging_progress } = body

    // Validate input
    if (!id) {
      return errorResponse('Booking ID is required', 'MISSING_ID', 400)
    }

    const booking = bookings.get(id)
    if (!booking) {
      return errorResponse('Booking not found', 'BOOKING_NOT_FOUND', 404)
    }

    // Check ownership
    if (booking.user_id !== session.user?.email) {
      return errorResponse(
        'Unauthorized: You can only update your own bookings',
        'UNAUTHORIZED',
        403
      )
    }

    // Validate status enum
    if (
      status &&
      !['pending', 'active', 'completed', 'cancelled'].includes(status)
    ) {
      return errorResponse(
        'Invalid status value',
        'INVALID_STATUS',
        400
      )
    }

    // Update booking
    if (status) booking.status = status
    if (typeof charging_progress === 'number' && charging_progress >= 0 && charging_progress <= 100) {
      booking.charging_progress = charging_progress
    }

    bookings.set(id, booking)

    return successResponse(booking, 200)
  } catch (error) {
    console.error('Error updating booking:', error)
    return errorResponse(
      'Failed to update booking',
      'UPDATE_BOOKING_ERROR',
      500
    )
  }
}
