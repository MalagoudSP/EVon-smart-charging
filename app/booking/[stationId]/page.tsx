'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Zap, MapPin, DollarSign, Clock, AlertCircle, CheckCircle } from 'lucide-react'
import Map from '@/components/ui/map'
import InteractiveMap from '@/components/ui/interactive-map'
import useAvailability from '@/lib/use-availability'

interface BookingData {
  stationName: string
  address: string
  chargerType: string
  powerRating: number
  pricePerKwh: number
  availableChargers: number
  lat?: number
  lng?: number
}

const stationDatabase: { [key: string]: BookingData } = {
  // keep a small in-file fallback for dev environments where DB isn't seeded yet
  '1': {
    stationName: 'Downtown Charging Hub',
    address: '123 Main St, Downtown',
    chargerType: 'DC Fast',
    powerRating: 150,
    pricePerKwh: 0.35,
    availableChargers: 8,
    lat: 40.7128,
    lng: -74.006,
  },
}

export default function BookingPage() {
  const params = useParams()
  const stationId = params.stationId as string
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [chargingParams, setChargingParams] = useState({
    currentSoc: 20,
    targetSoc: 80,
    chargerType: 'dc-fast',
  })
  const [estimates, setEstimates] = useState({
    duration: 0,
    energy: 0,
    cost: 0,
  })

  const bookingData = stationDatabase[stationId] || stationDatabase['1']
  const [stationsMap, setStationsMap] = React.useState<Record<string, BookingData> | null>(null)

  React.useEffect(() => {
    // fetch stations from API (falls back to in-file data)
    ;(async () => {
      try {
        const res = await fetch('/api/stations')
        if (!res.ok) return
        const data = await res.json()
        const map: Record<string, BookingData> = {}
        data.forEach((s: any) => {
          map[s.stationId] = {
            stationName: s.stationName,
            address: s.address,
            chargerType: s.chargerType,
            powerRating: s.powerRating,
            pricePerKwh: s.pricePerKwh,
            availableChargers: s.availableChargers,
            lat: s.lat,
            lng: s.lng,
          }
        })
        setStationsMap(map)
      } catch (err) {
        // ignore and keep fallback
      }
    })()
  }, [])

  const resolvedBookingData = stationsMap?.[stationId] ?? bookingData

  const [nearbyStations, setNearbyStations] = useState<{ id: string; stationName: string; distanceKm: number }[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null)

  const { availability, connected } = useAvailability()
  const availableCount = availability[stationId] ?? resolvedBookingData.availableChargers

  const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (v: number) => (v * Math.PI) / 180
    const R = 6371 // km
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // availability handled via SSE hook (useAvailability)

  const findNearbyStations = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not available in this browser.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setUserLocation({ lat: latitude, lng: longitude })
        const list: { id: string; stationName: string; distanceKm: number }[] = []
        Object.entries(stationDatabase).forEach(([id, s]) => {
          if (s.lat && s.lng) {
            const d = getDistanceKm(latitude, longitude, s.lat, s.lng)
            list.push({ id, stationName: s.stationName, distanceKm: Math.round(d * 10) / 10 })
          }
        })
        list.sort((a, b) => a.distanceKm - b.distanceKm)
        setNearbyStations(list.slice(0, 5))
      },
      (err) => {
        alert('Unable to get location: ' + err.message)
      }
    )
  }

  const calculateEstimates = (currentSoc: number, targetSoc: number) => {
    // Mock battery capacity (60 kWh for Tesla Model 3)
    const batteryCapacity = 60

    // Calculate energy needed
    const energy = (batteryCapacity * (targetSoc - currentSoc)) / 100

    // Calculate time with charging curve consideration
    const chargingCurve = targetSoc > 80 ? 1 + (targetSoc - 80) * 0.2 : 1
    const duration = ((energy / bookingData.powerRating) * 60 * chargingCurve) // in minutes

    // Calculate cost
    const cost = energy * bookingData.pricePerKwh

    setEstimates({
      duration: Math.round(duration),
      energy: Math.round(energy * 10) / 10,
      cost: Math.round(cost * 100) / 100,
    })
  }

  const handleSOCChange = (type: 'current' | 'target', value: number) => {
    const newParams = {
      ...chargingParams,
      [type === 'current' ? 'currentSoc' : 'targetSoc']: value,
    }
    setChargingParams(newParams)
    calculateEstimates(
      type === 'current' ? value : newParams.currentSoc,
      type === 'target' ? value : newParams.targetSoc
    )
  }

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault()
    ;(async () => {
      try {
        const payload = {
          stationId,
          stationName: bookingData.stationName,
          date: new Date().toISOString(),
          duration: estimates.duration,
          kWh: estimates.energy,
          cost: estimates.cost,
          status: 'Pending',
          params: chargingParams,
        }

        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!res.ok) throw new Error('Failed to create booking')
        setBookingSuccess(true)
        setTimeout(() => (window.location.href = '/dashboard'), 2000)
      } catch (err) {
        alert('Unable to create booking: ' + (err as Error).message)
      }
    })()
  }

  if (bookingSuccess) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center space-y-4 max-w-md">
          <CheckCircle className="h-12 w-12 text-primary mx-auto" />
          <h2 className="text-2xl font-semibold">Booking Confirmed!</h2>
          <p className="text-muted-foreground">
            Your charging session has been booked. Check your dashboard for details.
          </p>
          <p className="text-sm text-muted-foreground">
            Redirecting to dashboard...
          </p>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container py-6">
          <Link href="/stations">
            <Button variant="ghost" size="sm" className="mb-4">
              ← Back to Stations
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Book Charging Session</h1>
          <p className="text-muted-foreground mt-2">Set your charging parameters and confirm booking</p>
        </div>
      </header>

      <div className="container py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Station Info */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-6 space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{bookingData.stationName}</h3>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{bookingData.address}</span>
                </div>
              </div>

              <div className="pt-4">
                <InteractiveMap
                  stations={Object.entries(stationDatabase)
                    .filter(([, s]) => s.lat && s.lng)
                    .map(([id, s]) => ({ id, stationName: s.stationName, lat: s.lat!, lng: s.lng! }))}
                  center={bookingData.lat && bookingData.lng ? { lat: bookingData.lat, lng: bookingData.lng } : undefined}
                  userLocation={userLocation}
                  onSelect={(id) => setSelectedStationId(id)}
                />
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Charger Type</span>
                  <span className="font-semibold">{bookingData.chargerType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Power Rating</span>
                  <span className="font-semibold">{bookingData.powerRating}kW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Available</span>
                  <span className="font-semibold text-primary flex items-center gap-2">
                    {availableCount} Chargers
                    {availableCount <= 2 ? (
                      <span className="text-amber-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" /> Low availability
                      </span>
                    ) : null}
                    <span className="text-xs text-muted-foreground">{connected ? 'live' : 'offline'}</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-semibold text-accent">
                    ${bookingData.pricePerKwh}/kWh
                  </span>
                </div>
              </div>
            </Card>

            {/* Estimates */}
            <Card className="p-6 bg-primary/5 border-primary/20 space-y-3">
              <p className="font-semibold text-primary">Estimated Charges</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-semibold flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {estimates.duration}m
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Energy</span>
                  <span className="font-semibold">{estimates.energy}kWh</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-primary/20">
                  <span className="text-muted-foreground">Total Cost</span>
                  <span className="font-semibold text-accent flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {estimates.cost.toFixed(2)}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <form onSubmit={handleSubmitBooking} className="space-y-6">
                  <h3 className="font-semibold text-lg">{resolvedBookingData.stationName}</h3>
                  <h3 className="font-semibold text-lg">Charging Parameters</h3>
                  <span className="text-sm">{resolvedBookingData.address}</span>
                  {/* Current SOC */}
                  <div className="space-y-2">
                    <Label htmlFor="current-soc">
                      Current Battery Level: {chargingParams.currentSoc}%
                    </Label>
                    <span className="font-semibold">{resolvedBookingData.chargerType}</span>
                      id="current-soc"
                      type="range"
                    <span className="font-semibold">{resolvedBookingData.powerRating}kW</span>
                      max="100"
                      step="5"
                      value={chargingParams.currentSoc}
                    <span className="font-semibold text-primary flex items-center gap-2">
                      {availableCount} Chargers
                      }
                      className="w-full"
                    />
                  </div>

                  {/* Target SOC */}
                  <div className="space-y-2">
                    <Label htmlFor="target-soc">
                      Target Battery Level: {chargingParams.targetSoc}%
                    <span className="font-semibold text-accent">
                      ${resolvedBookingData.pricePerKwh}/kWh
                      id="target-soc"
                      type="range"
                      min={chargingParams.currentSoc}
                      max="100"
                      step="5"
                      value={chargingParams.targetSoc}
                      onChange={(e) =>
                        handleSOCChange('target', parseInt(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>

                </div>

                {/* Terms */}
                <div className="bg-secondary/50 border border-border rounded-lg p-4">
                  <div className="flex gap-3">
                    <input type="checkbox" id="terms" className="mt-1" required />
                    <Label htmlFor="terms" className="text-sm cursor-pointer">
                      I agree to the charging terms and conditions. I understand that I will be charged based on actual usage.
                    </Label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Link href="/stations" className="flex-1">
                    <Button variant="outline" type="button" className="w-full">
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    className="flex-1 gap-2"
                    size="lg"
                  >
                    <Zap className="h-5 w-5" />
                    Confirm Booking
                  </Button>
                </div>
              </form>
            </Card>

            {/* Additional Info */}
            <Card className="p-6 mt-4 bg-secondary/50">
              <p className="text-sm text-muted-foreground">
                <strong>Smart Scheduling:</strong> Our AI system analyzes demand patterns to recommend the best time to charge. Based on historical data, this station has lower demand from 1 AM to 6 AM, which could save you up to 15% on charging costs.
              </p>
              <div className="mt-4">
                <button
                  onClick={findNearbyStations}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-md"
                  type="button"
                >
                  Find Nearby Stations
                </button>

                {nearbyStations.length > 0 && (
                  <div className="mt-3">
                    <h4 className="font-semibold mb-2">Nearby Stations</h4>
                    <ul className="space-y-2">
                      {nearbyStations.map(s => (
                        <li key={s.id} className="flex justify-between items-center">
                          <span>{s.stationName}</span>
                          <span className="text-sm text-muted-foreground">{s.distanceKm} km</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
