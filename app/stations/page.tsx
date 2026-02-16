'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Zap, MapPin, Star, Filter, TrendingUp, Zap as BoltIcon } from 'lucide-react'

interface Station {
  id: string
  name: string
  location_address: string
  latitude: number
  longitude: number
  total_chargers: number
  available_chargers: number
  charger_types: string
  power_rating_kw: number
  pricing_per_kwh: number
  availability_status: string
  rating: number
  distance_km: number
  demand: string
  estimatedChargeTime: number
}

const mockStations: Station[] = [
  {
    id: '1',
    name: 'Downtown Charging Hub',
    location_address: '123 Main St, Downtown',
    latitude: 40.7128,
    longitude: -74.006,
    total_chargers: 16,
    available_chargers: 8,
    charger_types: 'DC Fast, Level 2',
    power_rating_kw: 150,
    pricing_per_kwh: 0.35,
    availability_status: 'Available',
    rating: 4.8,
    distance_km: 2.5,
    demand: 'High',
    estimatedChargeTime: 45,
  },
  {
    id: '2',
    name: 'Shopping Mall Station',
    location_address: '456 Mall Dr',
    latitude: 40.758,
    longitude: -73.9855,
    total_chargers: 20,
    available_chargers: 14,
    charger_types: 'Level 2',
    power_rating_kw: 7,
    pricing_per_kwh: 0.28,
    availability_status: 'Available',
    rating: 4.5,
    distance_km: 5.1,
    demand: 'Medium',
    estimatedChargeTime: 120,
  },
  {
    id: '3',
    name: 'Airport Charging Station',
    location_address: '789 Airport Rd',
    latitude: 40.6413,
    longitude: -73.7781,
    total_chargers: 32,
    available_chargers: 5,
    charger_types: 'DC Fast, Level 2',
    power_rating_kw: 120,
    pricing_per_kwh: 0.42,
    availability_status: 'Limited',
    rating: 4.2,
    distance_km: 15.2,
    demand: 'Low',
    estimatedChargeTime: 50,
  },
  {
    id: '4',
    name: 'Park Street Level 2',
    location_address: '321 Park Ave',
    latitude: 40.7489,
    longitude: -73.9680,
    total_chargers: 8,
    available_chargers: 8,
    charger_types: 'Level 2',
    power_rating_kw: 7,
    pricing_per_kwh: 0.25,
    availability_status: 'Available',
    rating: 4.7,
    distance_km: 3.8,
    demand: 'Low',
    estimatedChargeTime: 180,
  },
  {
    id: '5',
    name: 'Tech Park DC Fast',
    location_address: '999 Tech Ave',
    latitude: 40.7614,
    longitude: -73.9776,
    total_chargers: 12,
    available_chargers: 3,
    charger_types: 'DC Fast',
    power_rating_kw: 200,
    pricing_per_kwh: 0.48,
    availability_status: 'Limited',
    rating: 4.3,
    distance_km: 6.2,
    demand: 'High',
    estimatedChargeTime: 35,
  },
  {
    id: '6',
    name: 'Highway Rest Stop',
    location_address: 'Mile 45, Interstate 95',
    latitude: 40.7,
    longitude: -74.0,
    total_chargers: 10,
    available_chargers: 6,
    charger_types: 'DC Fast',
    power_rating_kw: 150,
    pricing_per_kwh: 0.38,
    availability_status: 'Available',
    rating: 4.4,
    distance_km: 12.3,
    demand: 'Medium',
    estimatedChargeTime: 40,
  },
]

export default function StationsPage() {
  const [filters, setFilters] = useState({
    distance: 50,
    minRating: 3,
    availableOnly: false,
    chargerType: 'all',
    sortBy: 'distance',
  })

  const filteredStations = useMemo(() => {
    let filtered = mockStations

    // Distance filter
    filtered = filtered.filter((s) => s.distance_km <= filters.distance)

    // Rating filter
    filtered = filtered.filter((s) => s.rating >= filters.minRating)

    // Available only
    if (filters.availableOnly) {
      filtered = filtered.filter((s) => s.available_chargers > 0)
    }

    // Charger type filter
    if (filters.chargerType !== 'all') {
      filtered = filtered.filter((s) =>
        s.charger_types.toLowerCase().includes(filters.chargerType.toLowerCase())
      )
    }

    // Sorting
    filtered.sort((a, b) => {
      if (filters.sortBy === 'distance') return a.distance_km - b.distance_km
      if (filters.sortBy === 'price') return a.pricing_per_kwh - b.pricing_per_kwh
      if (filters.sortBy === 'rating') return b.rating - a.rating
      if (filters.sortBy === 'available')
        return b.available_chargers - a.available_chargers
      return 0
    })

    return filtered
  }, [filters])

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container py-6">
          <div className="flex items-center justify-between mb-4">
            <Link href="/">
              <Button variant="ghost" className="gap-2">
                ← Back to Home
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Find Charging Stations</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Discover nearby EV charging stations with real-time availability and AI-powered predictions
          </p>
        </div>
      </header>

      <div className="container py-8">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 space-y-6 sticky top-8">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Filters</h2>
              </div>

              {/* Distance */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Distance: {filters.distance}km</label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="5"
                  value={filters.distance}
                  onChange={(e) =>
                    setFilters({ ...filters, distance: Number(e.target.value) })
                  }
                  className="w-full"
                />
              </div>

              {/* Min Rating */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Minimum Rating: {filters.minRating.toFixed(1)}</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={filters.minRating}
                  onChange={(e) =>
                    setFilters({ ...filters, minRating: Number(e.target.value) })
                  }
                  className="w-full"
                />
              </div>

              {/* Charger Type */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Charger Type</label>
                <select
                  value={filters.chargerType}
                  onChange={(e) =>
                    setFilters({ ...filters, chargerType: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded border border-border bg-background"
                >
                  <option value="all">All Types</option>
                  <option value="dc">DC Fast</option>
                  <option value="level">Level 2</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    setFilters({ ...filters, sortBy: e.target.value as any })
                  }
                  className="w-full px-3 py-2 rounded border border-border bg-background"
                >
                  <option value="distance">Distance</option>
                  <option value="price">Price</option>
                  <option value="rating">Rating</option>
                  <option value="available">Available Chargers</option>
                </select>
              </div>

              {/* Available Only */}
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <input
                  type="checkbox"
                  id="available-only"
                  checked={filters.availableOnly}
                  onChange={(e) =>
                    setFilters({ ...filters, availableOnly: e.target.checked })
                  }
                  className="rounded"
                />
                <label htmlFor="available-only" className="text-sm font-medium cursor-pointer">
                  Available Only
                </label>
              </div>
            </Card>
          </div>

          {/* Stations List */}
          <div className="lg:col-span-3 space-y-4">
            <p className="text-sm text-muted-foreground">
              Found {filteredStations.length} charging stations
            </p>

            {filteredStations.length === 0 ? (
              <Card className="p-8 text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  No stations found matching your criteria
                </p>
              </Card>
            ) : (
              filteredStations.map((station) => (
                <Card key={station.id} className="p-6 hover:border-primary transition-colors">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground">
                          {station.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <MapPin className="h-4 w-4" />
                          {station.location_address}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Star className="h-5 w-5 fill-accent text-accent" />
                          <span className="font-semibold">{station.rating}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {station.distance_km}km away
                        </p>
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Available</p>
                        <p className="text-lg font-semibold text-primary">
                          {station.available_chargers}/{station.total_chargers}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Power</p>
                        <p className="text-lg font-semibold">{station.power_rating_kw}kW</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Price</p>
                        <p className="text-lg font-semibold text-accent">
                          ${station.pricing_per_kwh}/kWh
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Type</p>
                        <p className="text-lg font-semibold">
                          {station.charger_types.split(',')[0].trim()}
                        </p>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex gap-2">
                      <Link href={`/booking/${station.id}`} className="flex-1">
                        <Button className="w-full gap-2">
                          <Zap className="h-4 w-4" />
                          Book Now
                        </Button>
                      </Link>
                      <Button variant="outline">View Details</Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
