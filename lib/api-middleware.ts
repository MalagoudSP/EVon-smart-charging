/**
 * API Middleware Utilities - Request validation, error handling, and response formatting
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

interface ApiError {
  message: string
  code: string
  details?: Record<string, unknown>
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: {
    timestamp: string
    requestId: string
  }
}

/**
 * Create a standardized success response
 */
export function successResponse<T>(
  data: T,
  status: number = 200,
  requestId?: string
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: requestId || generateRequestId(),
      },
    },
    { status }
  )
}

/**
 * Create a standardized error response
 */
export function errorResponse(
  message: string,
  code: string = 'INTERNAL_ERROR',
  status: number = 500,
  details?: Record<string, unknown>,
  requestId?: string
): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code,
        ...(details && { details }),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: requestId || generateRequestId(),
      },
    },
    { status }
  )
}

/**
 * Validate request body against a Zod schema
 */
export async function validateRequest<T>(
  request: NextRequest,
  schema: z.ZodSchema
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  try {
    const body = await request.json()
    const validated = schema.parse(body)
    return { data: validated as T, error: null }
  } catch (err) {
    if (err instanceof z.ZodError) {
      const fieldErrors = err.errors.reduce(
        (acc, error) => {
          const path = error.path.join('.')
          acc[path] = error.message
          return acc
        },
        {} as Record<string, string>
      )

      return {
        data: null,
        error: errorResponse(
          'Validation failed',
          'VALIDATION_ERROR',
          400,
          fieldErrors
        ),
      }
    }

    return {
      data: null,
      error: errorResponse(
        'Invalid request format',
        'INVALID_REQUEST',
        400
      ),
    }
  }
}

/**
 * Rate limiting implementation using in-memory store
 * For production, use Redis or similar
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(
  key: string,
  maxRequests: number = 100,
  windowMs: number = 60 * 1000 // 1 minute
): { allowed: boolean; remaining: number; retryAfter: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1, retryAfter: 0 }
  }

  if (entry.count < maxRequests) {
    entry.count++
    return {
      allowed: true,
      remaining: maxRequests - entry.count,
      retryAfter: 0,
    }
  }

  const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
  return { allowed: false, remaining: 0, retryAfter }
}

/**
 * Helper to check rate limit and return error if exceeded
 */
export function checkRateLimit(
  request: NextRequest,
  maxRequests: number = 100,
  windowMs: number = 60 * 1000
): NextResponse | null {
  const identifier = request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown'

  const { allowed, retryAfter } = rateLimit(identifier, maxRequests, windowMs)

  if (!allowed) {
    return errorResponse(
      'Too many requests. Please try again later.',
      'RATE_LIMIT_EXCEEDED',
      429
    )
  }

  return null
}

/**
 * Generate unique request ID for tracing
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Async error wrapper for route handlers
 */
export function asyncHandler(
  handler: (
    req: NextRequest,
    context?: any
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any) => {
    try {
      return await handler(request, context)
    } catch (error) {
      console.error('Route handler error:', error)
      return errorResponse(
        'An unexpected error occurred',
        'INTERNAL_ERROR',
        500
      )
    }
  }
}
