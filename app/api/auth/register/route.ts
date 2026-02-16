import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Call FastAPI backend to register user
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
        first_name: body.first_name,
        last_name: body.last_name,
        vehicle_type: body.vehicle_type,
        battery_capacity_kwh: body.battery_capacity_kwh,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { detail: error.detail || 'Registration failed' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { detail: 'An error occurred during registration' },
      { status: 500 }
    )
  }
}
