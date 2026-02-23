'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Zap,
  MapPin,
  Star,
  Filter,
  TrendingUp,
  AlertTriangle,
  Clock,
  DollarSign,
  Navigation,
  ChevronDown,
  ChevronUp,
  Loader,
} from 'lucide-react'
import GoogleMapsStations from '@/components/ui/google-maps-stations'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface Station {
  id: string
  stationName: string
  address: string
  lat: number
  lng: number
  totalChargers?: number
  availableChargers: number
  chargerTypes: string
  powerRatingKw?: number
  pricePerKwh: number
  dynamicPrice?: number
  averageRating: number
  reviewCount: number
  demandLevel: string
  waitingTimeMinutes: number
  amenities?: string
  distance?: number
  estimatedChargeTime?: number
}

interface AnalyticsData {
  totalBookingsToday: number
  totalEnergyDispenedKwh: number
  averageOccupancy: string
  totalRevenueUsd: number
}

export default function EnhancedStationsPage() {
  const [stations, setStations] = useState<Station[]>([])
  const [filteredStations, setFilteredStations] = useState<Station[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [predictions, setPredictions] = useState<any>(null)
  const [isLoadingMap, setIsLoadingMap] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [view, setView] = useState<'map' | 'list'>('map')

  const [filters, setFilters] = useState({
    distance: 50,
    minRating: 3,
    availableOnly: false,
    chargerType: 'all',
    sortBy: 'distance',
    maxPrice: 1.0,
    demandLevel: 'all',
  })

  const [expandedStationId, setExpandedStationId] = useState<string | null>(null)

  // Get user location
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords
          setUserLocation({ lat: latitude, lng: longitude })
        },
        error => {
          console.log('Geolocation error:', error)
          // Use default NYC location
          setUserLocation({ lat: 40.7128, lng: -74.006 })
        }
      )
    }
  }, [])

  // Fetch stations
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setIsLoadingMap(true)
        const params = new URLSearchParams()
        if (userLocation) {
          params.append('latitude', userLocation.lat.toString())
          params.append('longitude', userLocation.lng.toString())
          params.append('radius', filters.distance.toString())
        }
        params.append('sortBy', filters.sortBy)

        const response = await fetch(`/api/stations?${params}`)
        if (response.ok) {
          const data = await response.json()
          setStations(data)
        }
      } catch (error) {
        console.error('Error fetching stations:', error)
        toast.error('Failed to load stations')
      } finally {
        setIsLoadingMap(false)
      }
    }

    if (userLocation) {
      fetchStations()
    }
  }, [userLocation, filters.distance, filters.sortBy])

  // Fetch analytics
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics/stations')
        if (response.ok) {
          const data = await response.json()
          setAnalytics(data.summary)
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
      }
    }

    fetchAnalytics()
  }, [])

  // Apply filters
  useEffect(() => {
    let results = [...stations]

    // Filter by rating
    results = results.filter(s => s.averageRating >= filters.minRating)

    // Filter by availability
    if (filters.availableOnly) {
      results = results.filter(s => s.availableChargers > 0)
    }

    // Filter by charger type
    if (filters.chargerType !== 'all') {
      results = results.filter(s => {
        const types = s.chargerTypes || ''
        return types.toLowerCase().includes(filters.chargerType.toLowerCase())
      })
    }

    // Filter by price
    const maxPrice = filters.maxPrice
    results = results.filter(
      s => (s.dynamicPrice || s.pricePerKwh) <= maxPrice
    )

    // Filter by demand level
    if (filters.demandLevel !== 'all') {
      results = results.filter(s => s.demandLevel.toLowerCase() === filters.demandLevel)
    }

    // Sort
    switch (filters.sortBy) {
      case 'price':
        results.sort((a, b) => (a.dynamicPrice || a.pricePerKwh) - (b.dynamicPrice || b.pricePerKwh))
        break
      case 'rating':
        results.sort((a, b) => b.averageRating - a.averageRating)
        break
      case 'availability':
        results.sort((a, b) => b.availableChargers - a.availableChargers)
        break
      case 'waitTime':
        results.sort((a, b) => a.waitingTimeMinutes - b.waitingTimeMinutes)
        break
      default: // distance
        results.sort((a, b) => (a.distance || 999) - (b.distance || 999))
    }

    setFilteredStations(results)
  }, [stations, filters])

  const handleStationSelect = useCallback(async (station: Station) => {
    setSelectedStation(station)

    // Fetch predictions for selected station
    try {
      const response = await fetch(
        `/api/predictions/demand?stationId=${station.id}&hoursAhead=4`
      )
      if (response.ok) {
        const data = await response.json()
        setPredictions(data)
      }
    } catch (error) {
      console.error('Error fetching predictions:', error)
    }
  }, [])

  const getDemandColor = (demandLevel: string) => {
    switch (demandLevel?.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-50'
      case 'medium':
        return 'text-amber-600 bg-amber-50'
      case 'low':
        return 'text-green-600 bg-green-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getPriceColor = (price: number) => {
    if (price < 0.3) return 'text-green-600'
    if (price < 0.45) return 'text-amber-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Zap className="text-blue-600" />
            EV Charging Stations
          </h1>
          <p className="text-gray-600">
            Find nearby charging stations with real-time availability and dynamic pricing
          </p>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Bookings Today</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">
                    {analytics.totalBookingsToday}
                  </p>
                </div>
                <Zap className="text-blue-600 opacity-20" size={32} />
              </div>
            </Card>

            <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Energy (kWh)</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {analytics.totalEnergyDispenedKwh.toFixed(0)}
                  </p>
                </div>
                <TrendingUp className="text-green-600 opacity-20" size={32} />
              </div>
            </Card>

            <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Avg Occupancy</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">
                    {analytics.averageOccupancy}%
                  </p>
                </div>
                <Filter className="text-purple-600 opacity-20" size={32} />
              </div>
            </Card>

            <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Revenue Today</p>
                  <p className="text-3xl font-bold text-amber-600 mt-1">
                    ${analytics.totalRevenueUsd.toFixed(0)}
                  </p>
                </div>
                <DollarSign className="text-amber-600 opacity-20" size={32} />
              </div>
            </Card>
          </div>
        )}

        {/* View Toggle */}
        <div className="flex gap-2">
          <Button
            variant={view === 'map' ? 'default' : 'outline'}
            onClick={() => setView('map')}
          >
            Map View
          </Button>
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            onClick={() => setView('list')}
          >
            List View
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  {showFilters ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </Button>
              </div>

              {(showFilters || true) && (
                <div className="space-y-6">
                  {/* Distance Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Distance: {filters.distance} km
                    </label>
                    <Slider
                      value={[filters.distance]}
                      onValueChange={value =>
                        setFilters({ ...filters, distance: value[0] })
                      }
                      max={100}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Minimum Rating
                    </label>
                    <Select
                      value={filters.minRating.toString()}
                      onValueChange={value =>
                        setFilters({ ...filters, minRating: parseFloat(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1+ Stars</SelectItem>
                        <SelectItem value="2">2+ Stars</SelectItem>
                        <SelectItem value="3">3+ Stars</SelectItem>
                        <SelectItem value="4">4+ Stars</SelectItem>
                        <SelectItem value="5">5 Stars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Max Price: ${filters.maxPrice.toFixed(2)}/kWh
                    </label>
                    <Slider
                      value={[filters.maxPrice]}
                      onValueChange={value =>
                        setFilters({ ...filters, maxPrice: value[0] })
                      }
                      max={1.0}
                      min={0.1}
                      step={0.05}
                      className="w-full"
                    />
                  </div>

                  {/* Demand Level Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Demand Level
                    </label>
                    <Select
                      value={filters.demandLevel}
                      onValueChange={value =>
                        setFilters({ ...filters, demandLevel: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Availability Filter */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="available"
                      checked={filters.availableOnly}
                      onCheckedChange={checked =>
                        setFilters({ ...filters, availableOnly: checked as boolean })
                      }
                    />
                    <label
                      htmlFor="available"
                      className="text-sm font-medium text-gray-700"
                    >
                      Available Only
                    </label>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Sort By
                    </label>
                    <Select
                      value={filters.sortBy}
                      onValueChange={value =>
                        setFilters({ ...filters, sortBy: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="distance">Distance</SelectItem>
                        <SelectItem value="price">Price</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="availability">Availability</SelectItem>
                        <SelectItem value="waitTime">Wait Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() =>
                      setFilters({
                        distance: 50,
                        minRating: 3,
                        availableOnly: false,
                        chargerType: 'all',
                        sortBy: 'distance',
                        maxPrice: 1.0,
                        demandLevel: 'all',
                      })
                    }
                  >
                    Reset Filters
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {view === 'map' && userLocation ? (
              <Card className="p-4 bg-white shadow-lg">
                {isLoadingMap ? (
                  <div className="h-96 flex items-center justify-center">
                    <Loader className="animate-spin" size={32} />
                  </div>
                ) : (
                  <GoogleMapsStations
                    stations={filteredStations}
                    userLocation={userLocation}
                    onStationSelect={handleStationSelect}
                    selectedStation={selectedStation}
                    searchRadius={filters.distance}
                  />
                )}
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredStations.length === 0 ? (
                  <Card className="p-12 text-center">
                    <AlertTriangle className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-semibold text-gray-700">No stations found</h3>
                    <p className="text-gray-500">Try adjusting your filters</p>
                  </Card>
                ) : (
                  filteredStations.map(station => (
                    <Card
                      key={station.id}
                      className="p-6 bg-white shadow hover:shadow-lg transition cursor-pointer"
                      onClick={() => handleStationSelect(station)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">
                              {station.stationName}
                            </h3>
                            <Badge variant="secondary">
                              {station.availableChargers}/{station.totalChargers || 10}
                            </Badge>
                            <Badge className={getDemandColor(station.demandLevel)}>
                              {station.demandLevel.toUpperCase()}
                            </Badge>
                          </div>

                          <p className="text-gray-600 flex items-center gap-1 mb-3">
                            <MapPin size={16} />
                            {station.address}
                          </p>

                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-gray-500">Price/kWh</p>
                              <p className={`font-bold text-lg ${getPriceColor(station.pricePerKwh)}`}>
                                ${station.pricePerKwh.toFixed(2)}
                              </p>
                              {station.dynamicPrice &&
                                station.dynamicPrice !== station.pricePerKwh && (
                                  <p className="text-xs text-orange-600">
                                    Dynamic: ${station.dynamicPrice.toFixed(2)}
                                  </p>
                                )}
                            </div>

                            <div>
                              <p className="text-xs text-gray-500">Wait Time</p>
                              <p className="font-bold text-lg text-gray-900">
                                {station.waitingTimeMinutes} min
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-500">Rating</p>
                              <p className="font-bold text-lg">⭐ {station.averageRating.toFixed(1)}</p>
                              <p className="text-xs text-gray-500">({station.reviewCount})</p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-500">Power</p>
                              <p className="font-bold text-lg text-gray-900">
                                {station.powerRatingKw || 7}kW
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-500">Distance</p>
                              <p className="font-bold text-lg text-gray-900">
                                {(station.distance || 0).toFixed(1)} km
                              </p>
                            </div>
                          </div>

                          {/* Expandable Details */}
                          {expandedStationId === station.id && (
                            <div className="border-t pt-4 mt-4 space-y-3">
                              {station.amenities && (
                                <div>
                                  <p className="text-sm font-semibold text-gray-700 mb-1">
                                    Amenities
                                  </p>
                                  <p className="text-sm text-gray-600">{station.amenities}</p>
                                </div>
                              )}

                              {predictions && predictions.predictions && (
                                <div>
                                  <p className="text-sm font-semibold text-gray-700 mb-2">
                                    Demand Forecast
                                  </p>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {predictions.predictions.slice(0, 4).map((pred: any, idx: number) => (
                                      <div
                                        key={idx}
                                        className="bg-gray-50 p-2 rounded text-sm text-center"
                                      >
                                        <p className="font-semibold">{pred.timeSlot}</p>
                                        <p className="text-xs text-gray-600">
                                          {pred.predictedDemand.toFixed(0)}% demand
                                        </p>
                                        <p className="text-xs text-gray-600">
                                          Wait: {pred.predictedWaitTime} min
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button
                            className="bg-blue-600 hover:bg-blue-700 w-full whitespace-nowrap"
                            asChild
                          >
                            <Link href={`/booking/${station.id}`}>Book Now</Link>
                          </Button>
                          <Button
                            variant="outline"
                            onClick={e => {
                              e.stopPropagation()
                              setExpandedStationId(
                                expandedStationId === station.id ? null : station.id
                              )
                            }}
                          >
                            {expandedStationId === station.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Results Summary */}
        <div className="text-center text-gray-600">
          <p>
            Showing {filteredStations.length} out of {stations.length} stations
          </p>
        </div>
      </div>
    </div>
  )
}
