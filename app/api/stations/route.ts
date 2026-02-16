import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const stations = await prisma.station.findMany({ orderBy: { stationName: 'asc' } })
    return new Response(JSON.stringify(stations), { headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } })
  }
}
import { NextRequest, NextResponse } from 'next/server'

interface Station {
  id: string
  name: string
  latitude: number
  longitude: number
  available_chargers: number
  total_chargers: number
  price_per_kwh: number
  distance: number
  availability_status: string
  charger_types: {
    level1: number
    level2: number
    dc_fast: number
  }
  average_rating: number
  reviews_count: number
}

// Mock data - In production, this would call the FastAPI backend
const mockStations: Station[] = [
  {
    id: 'STN_00001',
    name: 'Downtown Charging Hub',
    latitude: 40.7128,
    longitude: -74.0060,
    available_chargers: 8,
    total_chargers: 12,
    price_per_kwh: 0.35,
    distance: 2.5,
    availability_status: 'available',
    charger_types: { level1: 2, level2: 6, dc_fast: 4 },
    average_rating: 4.7,
    reviews_count: 156
  },
  {
    id: 'STN_00002',
    name: 'Airport Station',
    latitude: 40.7614,
    longitude: -73.9776,
    available_chargers: 15,
    total_chargers: 20,
    price_per_kwh: 0.42,
    distance: 5.2,
    availability_status: 'available',
    charger_types: { level1: 3, level2: 10, dc_fast: 7 },
    average_rating: 4.5,
    reviews_count: 203
  },
  {
    id: 'STN_00003',
    name: 'Midtown Fast Charging',
    latitude: 40.7489,
    longitude: -73.9680,
    available_chargers: 3,
    total_chargers: 10,
    price_per_kwh: 0.50,
    distance: 1.8,
    availability_status: 'moderate',
    charger_types: { level1: 1, level2: 3, dc_fast: 6 },
    average_rating: 4.6,
    reviews_count: 89
  },
  {
    id: 'STN_00004',
    name: 'Brooklyn Community Charger',
    latitude: 40.6782,
    longitude: -73.9442,
    available_chargers: 5,
    total_chargers: 8,
    price_per_kwh: 0.28,
    distance: 8.3,
    availability_status: 'available',
    charger_types: { level1: 2, level2: 4, dc_fast: 2 },
    average_rating: 4.4,
    reviews_count: 67
  },
  {
    id: 'STN_00005',
    name: 'Queens Shopping Center',
    latitude: 40.7282,
    longitude: -73.7949,
    available_chargers: 12,
    total_chargers: 16,
    price_per_kwh: 0.32,
    distance: 12.5,
    availability_status: 'available',
    charger_types: { level1: 3, level2: 8, dc_fast: 5 },
    average_rating: 4.3,
    reviews_count: 142
  }
]

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const latitude = searchParams.get('latitude')
    const longitude = searchParams.get('longitude')
    const radius = searchParams.get('radius') || '50'
    const sortBy = searchParams.get('sortBy') || 'distance'

    // In production, call FastAPI backend
    // const response = await fetch(`${process.env.BACKEND_URL}/api/stations/search`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ latitude, longitude, radius, sortBy })
    // })

    let results = [...mockStations]

    // Filter by distance if coordinates provided
    if (latitude && longitude) {
      const userLat = parseFloat(latitude)
      const userLng = parseFloat(longitude)
      const radiusKm = parseFloat(radius)

      results = results.filter(station => {
        const distance = Math.sqrt(
          Math.pow(station.latitude - userLat, 2) +
          Math.pow(station.longitude - userLng, 2)
        ) * 111 // Convert degrees to km
        station.distance = parseFloat(distance.toFixed(2))
        return distance <= radiusKm
      })
    }

    // Sort results
    if (sortBy === 'price') {
      results.sort((a, b) => a.price_per_kwh - b.price_per_kwh)
    } else if (sortBy === 'rating') {
      results.sort((a, b) => b.average_rating - a.average_rating)
    } else {
      results.sort((a, b) => a.distance - b.distance)
    }

    return NextResponse.json(results, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stations' },
      { status: 500 }
    )
  }
}
