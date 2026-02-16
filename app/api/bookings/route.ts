import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userBookings = Array.from(bookings.values()).filter(
      b => b.user_id === session.user?.email
    )

    return NextResponse.json(userBookings, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: BookingRequest = await request.json()

    // Validate input
    if (!body.station_id || !body.start_time || !body.duration_minutes) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate estimated cost
    const pricePerKwh = 0.35 // Mock price
    const estimatedChargingKwh = 20 // Mock estimate
    const estimatedCost = pricePerKwh * estimatedChargingKwh

    const booking: Booking = {
      id: `BK_${Date.now()}`,
      user_id: session.user?.email || 'unknown',
      station_id: body.station_id,
      status: 'pending',
      start_time: body.start_time,
      end_time: new Date(
        new Date(body.start_time).getTime() + body.duration_minutes * 60000
      ).toISOString(),
      duration_minutes: body.duration_minutes,
      estimated_cost: estimatedCost,
      charger_type: body.charger_type,
      charging_progress: 0,
      created_at: new Date().toISOString()
    }

    bookings.set(booking.id, booking)

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, status, charging_progress } = body

    const booking = bookings.get(id)
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.user_id !== session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (status) booking.status = status
    if (typeof charging_progress === 'number') {
      booking.charging_progress = charging_progress
    }

    bookings.set(id, booking)

    return NextResponse.json(booking, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}
