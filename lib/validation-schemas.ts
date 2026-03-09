/**
 * Validation Schemas - Centralized request validation for all API routes
 */

import { z } from 'zod'

// ========== Password Validation ==========
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

// ========== Authentication Schemas ==========
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  first_name: z.string().min(2).max(50),
  last_name: z.string().min(2).max(50).optional(),
  vehicle_type: z.string().optional(),
  battery_capacity_kwh: z.number().positive().optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// ========== Booking Schemas ==========
export const createBookingSchema = z.object({
  stationId: z.string().min(1, 'Station ID is required'),
  stationName: z.string().min(1, 'Station name is required'),
  date: z.string().datetime().optional(),
  duration: z.number().int().positive('Duration must be positive').optional(),
  kWh: z.number().positive('kWh must be positive').optional(),
  cost: z.number().nonnegative('Cost cannot be negative').optional(),
  status: z.enum(['Pending', 'Active', 'Completed', 'Cancelled']).optional(),
})

export const updateBookingSchema = createBookingSchema.partial()

// ========== Station Schemas ==========
export const stationQuerySchema = z.object({
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  radius: z.coerce.number().positive().optional(),
  sortBy: z.enum(['distance', 'price', 'rating', 'availability']).optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  offset: z.coerce.number().int().nonnegative().optional(),
})

// ========== Review Schemas ==========
export const createReviewSchema = z.object({
  stationId: z.string().min(1, 'Station ID is required'),
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().max(500, 'Comment must be less than 500 characters').optional(),
})

// ========== Payment Schemas ==========
export const processPaymentSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  amount: z.number().positive('Amount must be positive'),
  paymentMethod: z.enum(['card', 'wallet', 'bank_transfer']),
  currency: z.string().length(3).toUpperCase().default('USD'),
})

// ========== Notification Preferences ==========
export const updateNotificationPreferencesSchema = z.object({
  email_promotions: z.boolean().optional(),
  email_booking_updates: z.boolean().optional(),
  push_notifications: z.boolean().optional(),
  sms_alerts: z.boolean().optional(),
})

// Type exports for use in handlers
export type RegisterRequest = z.infer<typeof registerSchema>
export type LoginRequest = z.infer<typeof loginSchema>
export type CreateBookingRequest = z.infer<typeof createBookingSchema>
export type UpdateBookingRequest = z.infer<typeof updateBookingSchema>
export type StationQuery = z.infer<typeof stationQuerySchema>
export type CreateReviewRequest = z.infer<typeof createReviewSchema>
export type ProcessPaymentRequest = z.infer<typeof processPaymentSchema>
