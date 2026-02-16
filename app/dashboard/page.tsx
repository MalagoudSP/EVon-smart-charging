'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  Zap,
  LogOut,
  TrendingUp,
  DollarSign,
  Clock,
  MapPin,
  Settings,
  Loader2,
  Calendar,
} from 'lucide-react'

interface Booking {
  id: string
  stationName: string
  date: string
  duration: number
  cost: number
  status: string
}

const DemandChart = () => {
  const data = [
    { hour: '00:00', demand: 30, availability: 70 },
    { hour: '04:00', demand: 20, availability: 80 },
    { hour: '08:00', demand: 70, availability: 30 },
    { hour: '12:00', demand: 65, availability: 35 },
    { hour: '16:00', demand: 75, availability: 25 },
    { hour: '20:00', demand: 60, availability: 40 },
    { hour: '23:00', demand: 35, availability: 65 },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" />
        <YAxis stroke="hsl(var(--muted-foreground))" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: `1px solid hsl(var(--border))`,
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="demand"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="availability"
          stroke="hsl(var(--accent))"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

const CostChart = () => {
  const data = [
    { month: 'Jan', cost: 45 },
    { month: 'Feb', cost: 52 },
    { month: 'Mar', cost: 48 },
    { month: 'Apr', cost: 61 },
    { month: 'May', cost: 55 },
    { month: 'Jun', cost: 67 },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
        <YAxis stroke="hsl(var(--muted-foreground))" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: `1px solid hsl(var(--border))`,
          }}
        />
        <Bar dataKey="cost" fill="hsl(var(--accent))" />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [bookings, setBookings] = useState<Booking[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login')
    }
  }, [status])

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true)
      try {
        // Mock data
        setBookings([
          {
            id: '1',
            stationName: 'Downtown Charging Hub',
            date: '2024-02-15 14:00',
            duration: 45,
            cost: 12.5,
            status: 'Completed',
          },
          {
            id: '2',
            stationName: 'Shopping Mall Station',
            date: '2024-02-16 09:00',
            duration: 30,
            cost: 7.8,
            status: 'In Progress',
          },
          {
            id: '3',
            stationName: 'Park Street Level 2',
            date: '2024-02-17 18:00',
            duration: 60,
            cost: 10.2,
            status: 'Pending',
          },
        ])
      } catch (error) {
        console.error('Error fetching bookings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchBookings()
    }
  }, [session])

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-secondary">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {session?.user?.name || 'User'}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/stations">
                <Button variant="outline" size="sm">
                  Find Stations
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Total Charges</p>
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold">24</p>
            <p className="text-xs text-muted-foreground">This month</p>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <DollarSign className="h-5 w-5 text-accent" />
            </div>
            <p className="text-3xl font-bold">$324</p>
            <p className="text-xs text-muted-foreground">This month</p>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Energy Used</p>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold">480kWh</p>
            <p className="text-xs text-muted-foreground">This month</p>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Avg Duration</p>
              <Clock className="h-5 w-5 text-accent" />
            </div>
            <p className="text-3xl font-bold">42min</p>
            <p className="text-xs text-muted-foreground">Per charge</p>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="demand" className="space-y-4">
          <TabsList>
            <TabsTrigger value="demand">Demand Trends</TabsTrigger>
            <TabsTrigger value="cost">Cost Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="demand" className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Station Demand & Availability</h3>
            <DemandChart />
            <p className="text-xs text-muted-foreground mt-4">
              Peak demand hours: 08:00-20:00. Best time to charge: 00:00-08:00
            </p>
          </TabsContent>

          <TabsContent value="cost" className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Monthly Charging Cost</h3>
            <CostChart />
            <p className="text-xs text-muted-foreground mt-4">
              Lowest cost month: February ($45). Highest cost month: June ($67)
            </p>
          </TabsContent>
        </Tabs>

        {/* Recent Bookings */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Bookings</h3>
            <Link href="/stations">
              <Button variant="link" size="sm">
                View All
              </Button>
            </Link>
          </div>

          {bookings.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No bookings yet. Start charging!
            </p>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{booking.stationName}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {booking.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-semibold">${booking.cost}</p>
                    <p
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        booking.status === 'Completed'
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                          : booking.status === 'In Progress'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                      }`}
                    >
                      {booking.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
