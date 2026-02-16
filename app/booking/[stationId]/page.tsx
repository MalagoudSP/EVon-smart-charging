'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Zap, MapPin, DollarSign, Clock, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface BookingData {
  stationName: string
  address: string
  chargerType: string
  powerRating: number
  pricePerKwh: number
  availableChargers: number
}

export default function BookingPage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const stationId = params.stationId as string
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
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

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login')
    }
  }, [status])

  // Fetch station details
  useEffect(() => {
    const fetchStationData = async () => {
      setIsLoading(true)
      try {
        // Mock data
        const mockData: BookingData = {
          stationName: 'Downtown Charging Hub',
          address: '123 Main St, Downtown',
          chargerType: 'DC Fast',
          powerRating: 150,
          pricePerKwh: 0.35,
          availableChargers: 8,
        }
        setBookingData(mockData)

        // Calculate initial estimates
        calculateEstimates(mockData, 20, 80, 150)
      } catch (error) {
        console.error('Error fetching station:', error)
        toast.error('Failed to load station details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStationData()
  }, [stationId])

  const calculateEstimates = (
    data: BookingData,
    currentSoc: number,
    targetSoc: number,
    powerRating: number
  ) => {
    // Mock battery capacity (60 kWh for Tesla Model 3)
    const batteryCapacity = 60

    // Calculate energy needed
    const energy = (batteryCapacity * (targetSoc - currentSoc)) / 100

    // Calculate time with charging curve consideration
    const chargingCurve = targetSoc > 80 ? 1 + (targetSoc - 80) * 0.2 : 1
    const duration = ((energy / powerRating) * 60 * chargingCurve) // in minutes

    // Calculate cost
    const cost = energy * data.pricePerKwh

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

    if (bookingData) {
      calculateEstimates(
        bookingData,
        type === 'current' ? value : newParams.currentSoc,
        type === 'target' ? value : newParams.targetSoc,
        bookingData.powerRating
      )
    }
  }

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // In production, call the FastAPI backend
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          station_id: stationId,
          current_soc: chargingParams.currentSoc,
          target_soc: chargingParams.targetSoc,
          charger_type: chargingParams.chargerType,
        }),
      })

      if (response.ok) {
        setBookingSuccess(true)
        toast.success('Booking confirmed!')
        setTimeout(() => {
          redirect('/dashboard')
        }, 3000)
      } else {
        toast.error('Failed to create booking')
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      toast.error('Booking error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Zap className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold">Station Not Found</h2>
          <Link href="/stations">
            <Button>Back to Stations</Button>
          </Link>
        </Card>
      </div>
    )
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
      <header className="border-b border-border bg-secondary">
        <div className="container py-6">
          <Link href="/stations">
            <Button variant="ghost" size="sm" className="mb-4">
              ← Back to Stations
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Book Charging Session</h1>
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
                  <span className="font-semibold text-primary">
                    {bookingData.availableChargers} Chargers
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
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Charging Parameters</h3>

                  {/* Current SOC */}
                  <div className="space-y-2">
                    <Label htmlFor="current-soc">
                      Current Battery Level: {chargingParams.currentSoc}%
                    </Label>
                    <input
                      id="current-soc"
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={chargingParams.currentSoc}
                      onChange={(e) =>
                        handleSOCChange('current', parseInt(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>

                  {/* Target SOC */}
                  <div className="space-y-2">
                    <Label htmlFor="target-soc">
                      Target Battery Level: {chargingParams.targetSoc}%
                    </Label>
                    <input
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

                  {/* Charger Type Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="charger-type">Charging Speed</Label>
                    <Select
                      value={chargingParams.chargerType}
                      onValueChange={(value) =>
                        setChargingParams((p) => ({
                          ...p,
                          chargerType: value,
                        }))
                      }
                    >
                      <SelectTrigger id="charger-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dc-fast">DC Fast (Fastest)</SelectItem>
                        <SelectItem value="level-2">Level 2 (Standard)</SelectItem>
                      </SelectContent>
                    </Select>
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
                    disabled={isSubmitting}
                    className="flex-1 gap-2"
                    size="lg"
                  >
                    <Zap className="h-5 w-5" />
                    {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
                  </Button>
                </div>
              </form>
            </Card>

            {/* Additional Info */}
            <Card className="p-6 mt-4 bg-secondary/50">
              <p className="text-sm text-muted-foreground">
                <strong>Smart Scheduling:</strong> Our AI system analyzes demand patterns to recommend the best time to charge. Based on historical data, this station has lower demand from 1 AM to 6 AM, which could save you up to 15% on charging costs.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
