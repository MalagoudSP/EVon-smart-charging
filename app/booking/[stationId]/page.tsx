'use client'

import { useState } from 'react'
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

interface BookingData {
  stationName: string
  address: string
  chargerType: string
  powerRating: number
  pricePerKwh: number
  availableChargers: number
}

const stationDatabase: { [key: string]: BookingData } = {
  '1': {
    stationName: 'Downtown Charging Hub',
    address: '123 Main St, Downtown',
    chargerType: 'DC Fast',
    powerRating: 150,
    pricePerKwh: 0.35,
    availableChargers: 8,
  },
  '2': {
    stationName: 'Shopping Mall Station',
    address: '456 Mall Dr',
    chargerType: 'Level 2',
    powerRating: 7,
    pricePerKwh: 0.28,
    availableChargers: 14,
  },
  '3': {
    stationName: 'Airport Charging Station',
    address: '789 Airport Rd',
    chargerType: 'DC Fast',
    powerRating: 120,
    pricePerKwh: 0.42,
    availableChargers: 5,
  },
  '4': {
    stationName: 'Park Street Level 2',
    address: '321 Park Ave',
    chargerType: 'Level 2',
    powerRating: 7,
    pricePerKwh: 0.25,
    availableChargers: 8,
  },
  '5': {
    stationName: 'Tech Park DC Fast',
    address: '999 Tech Ave',
    chargerType: 'DC Fast',
    powerRating: 200,
    pricePerKwh: 0.48,
    availableChargers: 3,
  },
  '6': {
    stationName: 'Highway Rest Stop',
    address: 'Mile 45, Interstate 95',
    chargerType: 'DC Fast',
    powerRating: 150,
    pricePerKwh: 0.38,
    availableChargers: 6,
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
    setBookingSuccess(true)
    setTimeout(() => {
      window.location.href = '/dashboard'
    }, 3000)
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
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
