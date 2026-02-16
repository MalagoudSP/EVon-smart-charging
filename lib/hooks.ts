import React from 'react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useStations(latitude?: number, longitude?: number, radius?: number) {
  const params = new URLSearchParams()
  if (latitude) params.append('latitude', latitude.toString())
  if (longitude) params.append('longitude', longitude.toString())
  if (radius) params.append('radius', radius.toString())

  const { data, error, isLoading } = useSWR(
    `/api/stations?${params.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  )

  return {
    stations: data,
    isLoading,
    isError: !!error,
    error,
  }
}

export function useBookings() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/bookings',
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  return {
    bookings: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  }
}

export function usePrediction(type: string, params: Record<string, any>) {
  const { data, error, isLoading } = useSWR(
    () => `/api/predictions?type=${type}&${new URLSearchParams(params).toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  return {
    prediction: data,
    isLoading,
    isError: !!error,
    error,
  }
}

export function useGeolocation() {
  const [location, setLocation] = React.useState<{
    latitude: number
    longitude: number
  } | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const getLocation = React.useCallback(() => {
    setIsLoading(true)
    setError(null)

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setIsLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setIsLoading(false)
      },
      (error) => {
        setError(error.message)
        setIsLoading(false)
      }
    )
  }, [])

  return { location, error, isLoading, getLocation }
}
