import { NextRequest, NextResponse } from 'next/server'
import { successResponse, errorResponse, validateRequest, asyncHandler, checkRateLimit } from '@/lib/api-middleware'
import { registerSchema } from '@/lib/validation-schemas'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * POST /api/auth/register - Register new user
 * Validates input with strict password requirements
 * Rate limited to 10 requests/minute for security
 */
export const POST = asyncHandler(async (request: NextRequest) => {
  // Strict rate limiting for registration (prevent brute force)
  const rateLimitError = checkRateLimit(request, 10, 60 * 1000)
  if (rateLimitError) return rateLimitError

  // Validate request body against schema
  const { data: validatedData, error: validationError } = await validateRequest(
    request,
    registerSchema
  )
  if (validationError) return validationError

  try {
    // Call FastAPI backend to register user
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: validatedData.email,
        password: validatedData.password,
        first_name: validatedData.first_name,
        last_name: validatedData.last_name,
        vehicle_type: validatedData.vehicle_type,
        battery_capacity_kwh: validatedData.battery_capacity_kwh,
      }),
    })

    if (!response.ok) {
      let error_message = 'Registration failed'
      let error_code = 'REGISTRATION_ERROR'

      try {
        const error = await response.json()
        error_message = error.detail || error.message || error_message
        error_code = error.code || error_code
      } catch {
        // Use default error messages
      }

      return errorResponse(
        error_message,
        error_code,
        response.status || 500
      )
    }

    const data = await response.json()
    return successResponse(data, 201)
  } catch (error) {
    console.error('Registration error:', error)
    return errorResponse(
      'An error occurred during registration',
      'REGISTRATION_ERROR',
      500
    )
  }
})
