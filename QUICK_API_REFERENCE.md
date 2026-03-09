# Quick Reference - API Enhancements

## 🚀 What Was Added?

This project now has **production-ready** error handling, validation, and security features.

---

## 📁 New Files to Know About

| File | Purpose | Usage |
|------|---------|-------|
| `lib/api-middleware.ts` | Error handling & response formatting | Import in API routes |
| `lib/validation-schemas.ts` | Request validation schemas | Import schemas needed |
| `lib/auth-utils.ts` | Authentication utilities | Check auth before processing |
| `lib/environment-config.ts` | Environment variable validation | Load at app startup |
| `hooks/use-api-response.ts` | Frontend API calls | Use in React components |
| `API_ENHANCEMENTS.md` | Complete documentation | Read for details |

---

## 🎯 Using in API Routes

### Template for New Endpoints

```typescript
import { NextRequest } from 'next/server'
import { successResponse, errorResponse, validateRequest, asyncHandler, checkRateLimit } from '@/lib/api-middleware'
import { requireAuth } from '@/lib/auth-utils'
import { yourSchema } from '@/lib/validation-schemas'

export const GET = asyncHandler(async (request: NextRequest) => {
  // 1. Rate limit check
  const rateLimitError = checkRateLimit(request)
  if (rateLimitError) return rateLimitError

  // 2. Auth check (if needed)
  const { session, error: authError } = await requireAuth(request)
  if (authError) return authError

  try {
    // 3. Your logic here
    const data = await fetchData()
    
    // 4. Return success
    return successResponse(data, 200)
  } catch (error) {
    return errorResponse('Your error message', 'ERROR_CODE', 500)
  }
})

export const POST = asyncHandler(async (request: NextRequest) => {
  // 1. Rate limit
  const rateLimitError = checkRateLimit(request, 50)
  if (rateLimitError) return rateLimitError

  // 2. Auth check
  const { session, error: authError } = await requireAuth(request)
  if (authError) return authError

  // 3. Validate input
  const { data, error } = await validateRequest(request, yourSchema)
  if (error) return error

  try {
    // 4. Process
    const result = await createData(data)
    return successResponse(result, 201)
  } catch (error) {
    return errorResponse('Failed to create', 'CREATE_ERROR', 500)
  }
})
```

---

## 💻 Using in React Components

### Simple Data Fetch

```typescript
import { useFetchApi } from '@/hooks/use-api-response'

export function MyComponent() {
  const { data: items, loading, error, refetch } = useFetchApi('/api/items')

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {items?.data?.map(item => <Item key={item.id} {...item} />)}
    </div>
  )
}
```

### Form Submission

```typescript
import { useApiResponse } from '@/hooks/use-api-response'

export function BookingForm() {
  const { loading, execute, error } = useApiResponse('/api/bookings', {
    method: 'POST',
    showSuccessToast: true,
    successMessage: 'Booking created!'
  })

  const handleSubmit = async (formData) => {
    const booking = await execute(formData)
    if (booking) {
      // Success - booking was created
      resetForm()
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button disabled={loading}>
        {loading ? 'Submitting...' : 'Book Now'}
      </button>
    </form>
  )
}
```

---

## 🔐 Authentication Pattern

Always check authentication on protected endpoints:

```typescript
export const GET = asyncHandler(async (request) => {
  const { session, error } = await requireAuth(request)
  if (error) return error // Returns 401 if not authenticated

  const userId = session.user?.id
  // Now safely use userId
})
```

---

## ✅ Validation Pattern

Always validate input on POST/PUT:

```typescript
export const POST = asyncHandler(async (request) => {
  const { data, error } = await validateRequest(request, createBookingSchema)
  if (error) return error // Returns 400 with validation details

  // Now data is validated and typed
  const booking = await createBooking(data.stationId, data.duration)
})
```

---

## 📊 Response Format

All API responses follow this format:

### Success (GET /api/stations)
```json
{
  "success": true,
  "data": {
    "data": [{...station...}],
    "pagination": {"total": 150, "limit": 50, ...}
  },
  "meta": {
    "timestamp": "2024-03-09T10:00:00Z",
    "requestId": "req_1234567890_abc123"
  }
}
```

### Error (POST /api/bookings with invalid data)
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": {
      "stationId": "Station ID is required",
      "duration": "Duration must be positive"
    }
  },
  "meta": {
    "timestamp": "2024-03-09T10:00:00Z",
    "requestId": "req_1234567890_abc123"
  }
}
```

---

## 🔒 Rate Limits (Per IP)

- **GET requests:** 100/minute
- **POST/PUT requests:** 50/minute  
- **Registration:** 10/minute

**Response when limit exceeded:**
```json
{
  "success": false,
  "error": {
    "message": "Too many requests. Please try again later.",
    "code": "RATE_LIMIT_EXCEEDED"
  }
}
```

---

## 🔑 Password Requirements

✅ 8+ characters
✅ 1 uppercase letter
✅ 1 lowercase letter
✅ 1 number
✅ 1 special character (!@#$%^&*)

Example: `SecurePass123!`

---

## 🐛 Debugging Tips

**Use request IDs to trace errors:**
```typescript
// In frontend, when you see an error:
const response = await fetch('/api/bookings', { method: 'POST', body })
const result = await response.json()

if (!result.success) {
  // Use this to find server logs
  console.log(`Issue ID: ${result.meta.requestId}`)
}
```

**Check validation details:**
```typescript
// Server returns detailed field errors
// Use these to show user-friendly messages
if (result.error?.details) {
  Object.entries(result.error.details).forEach(([field, message]) => {
    showFieldError(field, message)
  })
}
```

---

## 📝 Adding New Endpoints Checklist

- [ ] Define validation schema in `lib/validation-schemas.ts`
- [ ] Create API route with `asyncHandler`
- [ ] Add rate limiting with `checkRateLimit()`
- [ ] Add auth check with `requireAuth()` if protected
- [ ] Validate input with `validateRequest()`
- [ ] Return responses with `successResponse()` / `errorResponse()`
- [ ] Add JSDoc comments
- [ ] Update `API_ENHANCEMENTS.md` with endpoint docs

---

## 🚀 Common Tasks

### Create booking endpoint
See: `app/api/bookings/route.ts` (POST handler)

### Fetch stations with frontend
See: `hooks/use-api-response.ts` example + `app/api/stations/route.ts`

### Validate user input
See: `lib/validation-schemas.ts` for schema patterns

### Check authentication
See: `lib/auth-utils.ts` `requireAuth()` function

### Return standardized error
See: `lib/api-middleware.ts` `errorResponse()` function

---

## 📚 Full Documentation

For complete details, read: **`API_ENHANCEMENTS.md`**

For summary of all changes: **`ENHANCEMENTS_SUMMARY.md`**

---

**Pro Tip:** Copy the API route template above when creating new endpoints!
