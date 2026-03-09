# API Enhancement Guide

This document outlines the production-ready enhancements made to the EVon smart charging app's API infrastructure.

## Overview of Improvements

### 1. **Standardized API Response Format**

All API responses now follow a consistent structure for better client handling:

```json
{
  "success": true,
  "data": { /* response data */ },
  "meta": {
    "timestamp": "2024-03-09T...",
    "requestId": "req_1234567890_abc123"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "message": "User-friendly error message",
    "code": "ERROR_CODE",
    "details": { /* validation errors if applicable */ }
  },
  "meta": {
    "timestamp": "2024-03-09T...",
    "requestId": "req_1234567890_abc123"
  }
}
```

**Benefits:**
- Consistent error handling across all endpoints
- Request tracing via unique request IDs
- Detailed validation error information
- Timestamp for auditing and debugging

---

### 2. **Request Validation with Zod Schemas**

Located in `/lib/validation-schemas.ts`, all API endpoints now validate input with strict schemas:

```typescript
// Example: Register Schema
{
  email: z.string().email(),
  password: z.string()
    .min(8)
    .regex(/[A-Z]/)           // Must have uppercase
    .regex(/[a-z]/)           // Must have lowercase
    .regex(/[0-9]/)           // Must have number
    .regex(/[^A-Za-z0-9]/);   // Must have special char
  first_name: z.string().min(2).max(50),
  battery_capacity_kwh: z.number().positive().optional(),
}
```

**Available Schemas:**
- `registerSchema` - User registration validation
- `loginSchema` - Login credentials validation
- `createBookingSchema` - Booking creation validation
- `stationQuerySchema` - Station search filters
- `createReviewSchema` - Review submission validation
- `processPaymentSchema` - Payment processing validation

**Usage in API Routes:**
```typescript
const { data: validatedData, error } = await validateRequest(request, createBookingSchema)
if (error) return error
// Now safely use validatedData
```

---

### 3. **Rate Limiting**

All API endpoints are protected with rate limiting (in-memory, can be replaced with Redis for production):

**Default Limits:**
- **GET requests:** 100 requests/minute
- **POST requests (create):** 50 requests/minute
- **POST requests (registration):** 10 requests/minute
- **PUT requests:** 50 requests/minute

**Implementation:**
```typescript
const rateLimitError = checkRateLimit(request, maxRequests, windowMs)
if (rateLimitError) return rateLimitError
```

**For Production:**
Replace in-memory store in `lib/api-middleware.ts` with Redis:
```typescript
// Replace the Map-based store with Redis client
// import redis from 'redis'
// const redisClient = redis.createClient()
```

---

### 4. **Strengthened Password Requirements**

Passwords now require:
- ✅ Minimum 8 characters (↑ from 6)
- ✅ At least one uppercase letter (A-Z)
- ✅ At least one lowercase letter (a-z)
- ✅ At least one number (0-9)
- ✅ At least one special character (!@#$%^&*)
- ✅ Maximum 128 characters

---

### 5. **Enhanced Error Handling**

### API Middleware Functions (`lib/api-middleware.ts`)

```typescript
// Standardized success response
successResponse(data, 201)

// Standardized error response
errorResponse(message, code, status, details)

// Request body validation
const { data, error } = await validateRequest(request, schema)

// Rate limit checking
const error = checkRateLimit(request)

// Async error wrapper
const POST = asyncHandler(async (req) => {
  // Automatically catches and formats errors
})
```

---

### 6. **Authentication Utilities** (`lib/auth-utils.ts`)

```typescript
// Require authenticated session
const { session, error } = await requireAuth(request)
if (error) return error

// Check resource ownership
validateOwnership(userId, resourceOwnerId)

// Validate HTTP methods
const error = validateMethod(request, ['GET', 'POST'])

// Check user roles
hasRole(userRole, ['admin', 'moderator'])
```

---

## Updated API Endpoints

### Authentication

#### POST `/api/auth/register`
**Rate Limit:** 10 req/min

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "vehicle_type": "Tesla Model 3",
  "battery_capacity_kwh": 75
}
```

**Validation:** `registerSchema`

**Responses:**
- `201` - Registration successful
- `400` - Validation failed (details in error.details)
- `429` - Rate limit exceeded

---

### Bookings

#### GET `/api/bookings`
**Rate Limit:** 100 req/min
**Auth Required:** Yes

Returns user's bookings with pagination support

#### POST `/api/bookings`
**Rate Limit:** 50 req/min
**Auth Required:** Yes
**Validation:** `createBookingSchema`

**Request:**
```json
{
  "stationId": "STN_00001",
  "stationName": "Downtown Hub",
  "date": "2024-03-10T10:00:00Z",
  "duration": 120,
  "kWh": 50,
  "cost": 17.50,
  "status": "Pending"
}
```

#### PUT `/api/bookings`
**Rate Limit:** 50 req/min
**Auth Required:** Yes
**Ownership Check:** Yes

Update booking status or charging progress

---

### Stations

#### GET `/api/stations`
**Rate Limit:** 100 req/min

**Query Parameters:**
```
?limit=50&offset=0&sortBy=stationName
```

**Response Includes:**
```json
{
  "success": true,
  "data": {
    "data": [ /* stations array */ ],
    "pagination": {
      "total": 150,
      "limit": 50,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

#### POST `/api/stations`
**Rate Limit:** 50 req/min

Create new charging station (requires validation)

---

## Frontend Integration

### Using the New Hook

```typescript
import { useApiResponse, useFetchApi } from '@/hooks/use-api-response'

// For mutations (POST, PUT, DELETE)
export function BookingForm() {
  const { loading, execute } = useApiResponse<Booking>(
    '/api/bookings',
    { method: 'POST', showSuccessToast: true }
  )

  const handleSubmit = async (data) => {
    const booking = await execute(data)
    if (booking) {
      // Success!
    }
  }

  return <form onSubmit={handleSubmit}>{/* ... */}</form>
}

// For fetches (GET)
export function StationList() {
  const { data: stations, loading, error, refetch } = useFetchApi(
    '/api/stations?limit=50'
  )

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {stations?.data?.map(s => <StationCard key={s.id} {...s} />)}
    </div>
  )
}
```

---

## Error Handling Best Practices

### Server-Side
```typescript
export const POST = asyncHandler(async (request) => {
  const { data, error } = await validateRequest(request, schema)
  if (error) return error

  try {
    // Process request
    return successResponse(result, 201)
  } catch (err) {
    return errorResponse('Specific error message', 'ERROR_CODE', 500)
  }
})
```

### Client-Side
```typescript
const { data, error, execute } = useApiResponse(endpoint)

const result = await execute(payload)
// result is null if error occurred
// error is set with error message
// Toast notifications are automatic if enabled
```

---

## Debugging

### Using Request IDs
All responses include a `requestId` in metadata. Use this to trace requests:

```typescript
// Server logs will show this when referenced
console.log(`[${requestId}] Processing booking...`)

// Frontend can include in bug reports
const { meta } = response
console.log(`Issue request ID: ${meta.requestId}`)
```

### Error Details
Validation errors include detailed field information:

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": {
      "email": "Invalid email address",
      "password": "Password must contain at least one uppercase letter",
      "phoneNumber": "Required field"
    }
  }
}
```

---

## Migration Guide

### Converting Existing Endpoints

**Before:**
```typescript
export async function POST(req) {
  try {
    const body = await req.json()
    const created = await db.create(body)
    return new Response(JSON.stringify(created))
  } catch (err) {
    return new Response(JSON.stringify([]))
  }
}
```

**After:**
```typescript
import { asyncHandler, successResponse, errorResponse, validateRequest } from '@/lib/api-middleware'

export const POST = asyncHandler(async (request) => {
  const { data, error } = await validateRequest(request, mySchema)
  if (error) return error

  try {
    const created = await db.create(data)
    return successResponse(created, 201)
  } catch (err) {
    return errorResponse('Create failed', 'CREATE_ERROR', 500)
  }
})
```

---

## Performance Optimization

### Pagination Best Practices
```typescript
// Always paginate large result sets
const stations = await prisma.station.findMany({
  take: 50,
  skip: offset,
  orderBy: { createdAt: 'desc' }
})
```

### Database Query Optimization
```typescript
// Use selective field queries
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    firstName: true,
    // Don't select unnecessary fields
  },
  take: 50,
  skip: offset
})
```

---

## Security Checklist

- ✅ All passwords validated (8+ chars, mixed case, numbers, special chars)
- ✅ Rate limiting on all endpoints
- ✅ Authentication required on protected routes
- ✅ Ownership validation for resource updates
- ✅ Input validation with Zod schemas
- ✅ Consistent error messages (no data leakage)
- ✅ Request IDs for audit trail
- ✅ HTTPS recommended for production
- ⚠️ TODO: CSRF tokens for state-changing operations
- ⚠️ TODO: Replace in-memory rate limiting with Redis
- ⚠️ TODO: Add request signing/verification for API-to-API calls

---

## Support & Questions

For API-related questions or to report issues:
1. Check the validation schema for required fields
2. Review the error details in the response
3. Use the request ID to find server logs
4. Check this guide for endpoint documentation
