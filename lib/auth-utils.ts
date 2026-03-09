/**
 * Authentication & Security Utilities
 * Provides session validation and auth helpers
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { errorResponse } from './api-middleware'

/**
 * Validate that request has active session
 * Returns session or error response
 */
export async function requireAuth(request: NextRequest) {
  const session = await getServerSession()

  if (!session?.user) {
    return {
      session: null,
      error: errorResponse('Unauthorized: Please log in', 'UNAUTHORIZED', 401),
    }
  }

  return { session, error: null }
}

/**
 * Validate user owns the resource
 */
export function validateOwnership(
  userId: string,
  resourceOwnerId: string
): boolean {
  return userId === resourceOwnerId
}

/**
 * Validate request method
 */
export function validateMethod(
  request: NextRequest,
  allowedMethods: string[]
): NextResponse | null {
  if (!allowedMethods.includes(request.method)) {
    return errorResponse(
      `Method ${request.method} not allowed`,
      'METHOD_NOT_ALLOWED',
      405
    )
  }
  return null
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole)
}

/**
 * Safe session access with null checks
 */
export function getUserEmail(session: any): string | null {
  return session?.user?.email || null
}

export function getUserId(session: any): string | null {
  return session?.user?.id || null
}
