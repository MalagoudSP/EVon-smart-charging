/**
 * useApiResponse Hook - Type-safe wrapper for API calls with standardized responses
 * Handles the new standardized API response format with success/error handling
 */

import { useCallback, useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

interface ApiErrorResponse {
  success: false
  error: {
    message: string
    code: string
    details?: Record<string, unknown>
  }
  meta: {
    timestamp: string
    requestId: string
  }
}

interface ApiSuccessResponse<T> {
  success: true
  data: T
  meta: {
    timestamp: string
    requestId: string
  }
}

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

interface UseApiResponseOptions {
  showErrorToast?: boolean
  showSuccessToast?: boolean
  successMessage?: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
}

/**
 * Hook for making API calls with standardized error/success handling
 */
export function useApiResponse<T = any>(
  url: string,
  options: UseApiResponseOptions = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const {
    showErrorToast = true,
    showSuccessToast = false,
    successMessage = 'Success',
    method = 'GET',
  } = options

  const execute = useCallback(
    async (body?: any) => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: body ? JSON.stringify(body) : undefined,
        })

        const result: ApiResponse<T> = await response.json()

        if (!result.success) {
          const errorMessage =
            result.error?.message || 'An error occurred'
          setError(errorMessage)

          if (showErrorToast) {
            toast({
              title: 'Error',
              description: errorMessage,
              variant: 'destructive',
            })
          }

          // Log detailed error for debugging
          console.error(`API Error [${result.error?.code}]:`, {
            message: result.error?.message,
            code: result.error?.code,
            details: result.error?.details,
            requestId: result.meta?.requestId,
          })

          return null
        }

        setData(result.data)

        if (showSuccessToast) {
          toast({
            title: 'Success',
            description: successMessage,
          })
        }

        return result.data
      } catch (err) {
        const errorMessage = err instanceof Error
          ? err.message
          : 'An unexpected error occurred'

        setError(errorMessage)

        if (showErrorToast) {
          toast({
            title: 'Error',
            description: errorMessage,
            variant: 'destructive',
          })
        }

        console.error('Request failed:', err)
        return null
      } finally {
        setLoading(false)
      }
    },
    [url, method, showErrorToast, showSuccessToast, successMessage, toast]
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    data,
    error,
    loading,
    execute,
    reset,
  }
}

/**
 * Hook for fetching data on mount with caching
 */
export function useFetchApi<T = any>(
  url: string,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const { toast } = useToast()

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(url)
      const result: ApiResponse<T> = await response.json()

      if (!result.success) {
        const errorMessage = result.error?.message || 'Failed to fetch'
        setError(errorMessage)
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        })
        return
      }

      setData(result.data)
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'An unexpected error occurred'

      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [url, toast])

  // Fetch on mount
  useEffect(() => {
    refetch()
  }, dependencies)

  return { data, error, loading, refetch }
}
