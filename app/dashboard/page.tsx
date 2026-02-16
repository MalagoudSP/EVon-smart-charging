'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  Zap,
  TrendingUp,
  DollarSign,
  Clock,
  MapPin,
  AlertCircle,
  BarChart3,
  Activity,
} from 'lucide-react'

const demandData = [
  { hour: '00:00', demand: 30, availability: 70 },
  { hour: '04:00', demand: 20, availability: 80 },
  { hour: '08:00', demand: 70, availability: 30 },
  { hour: '12:00', demand: 65, availability: 35 },
  { hour: '16:00', demand: 75, availability: 25 },
  { hour: '20:00', demand: 60, availability: 40 },
  { hour: '23:00', demand: 35, availability: 65 },
]

const costData = [
  { month: 'Jan', cost: 45 },
  { month: 'Feb', cost: 52 },
  { month: 'Mar', cost: 48 },
  { month: 'Apr', cost: 61 },
  { month: 'May', cost: 55 },
  { month: 'Jun', cost: 67 },
]

const chargingDistribution = [
  { name: 'DC Fast', value: 45 },
  { name: 'Level 2', value: 35 },
  { name: 'DC Ultra', value: 20 },
]

const COLORS = ['hsl(210 100% 50%)', 'hsl(39 100% 50%)', '#8884d8']

const bookings = [
  {
    id: '1',
    stationName: 'Downtown Charging Hub',
    date: '2024-02-15 14:00',
    duration: 45,
    cost: 12.5,
    status: 'Completed',
    kWh: 18.5,
  },
  {
    id: '2',
    stationName: 'Shopping Mall Station',
    date: '2024-02-16 09:00',
    duration: 30,
    cost: 7.8,
    status: 'In Progress',
    kWh: 12.3,
  },
  {
    id: '3',
    stationName: 'Park Street Level 2',
    date: '2024-02-17 18:00',
    duration: 60,
    cost: 10.2,
    status: 'Pending',
    kWh: 14.7,
  },
]

const mlModels = [
  { name: 'Demand Prediction', model: 'LSTM', accuracy: 92, description: 'Forecasts station demand 24 hours ahead' },
  { name: 'Load Forecasting', model: 'Neural Network', accuracy: 90, description: 'Predicts grid load for optimal scheduling' },
  { name: 'Time Estimation', model: 'MLP', accuracy: 88, description: 'Estimates charging duration accurately' },
  { name: 'Smart Recommendations', model: 'Random Forest', accuracy: 87, description: 'Suggests best stations for your needs' },
]

export default function DashboardPage() {

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">Dashboard</h1>
            </div>
            <Link href="/stations">
              <Button className="gap-2">
                <MapPin className="h-4 w-4" />
                Find Stations
              </Button>
            </Link>
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
            <h3 className="text-lg font-semibold mb-4">Station Demand & Availability (24h Forecast)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={demandData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="hour" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="demand"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="availability"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-4">
              Peak demand hours: 08:00-20:00. Best time to charge: 00:00-08:00
            </p>
          </TabsContent>

          <TabsContent value="cost" className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Monthly Charging Cost Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem'
                  }}
                />
                <Bar dataKey="cost" fill="var(--accent)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-4">
              Lowest cost month: February ($45). Highest cost month: June ($67)
            </p>
          </TabsContent>
        </Tabs>

        {/* Distribution and Predictions */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Charging Distribution */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Charger Type Distribution</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chargingDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chargingDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* ML Predictions */}
          <Card className="lg:col-span-2 p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-accent" />
              Smart Recommendations
            </h2>
            <div className="space-y-3">
              <div className="p-4 rounded-lg border border-border bg-secondary">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-foreground">Downtown Hub</h3>
                  <span className="text-xs px-2 py-1 rounded font-medium bg-red-500/20 text-red-700">High Demand</span>
                </div>
                <p className="text-sm text-muted-foreground">Charge during off-peak (11 PM - 6 AM) to save 20%</p>
              </div>
              <div className="p-4 rounded-lg border border-border bg-secondary">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-foreground">Tech Park</h3>
                  <span className="text-xs px-2 py-1 rounded font-medium bg-green-500/20 text-green-700">Low Demand</span>
                </div>
                <p className="text-sm text-muted-foreground">Optimal time to charge now - fastest service</p>
              </div>
              <div className="p-4 rounded-lg border border-border bg-secondary">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-foreground">Airport Station</h3>
                  <span className="text-xs px-2 py-1 rounded font-medium bg-yellow-500/20 text-yellow-700">Medium Demand</span>
                </div>
                <p className="text-sm text-muted-foreground">Wait 2 hours for lower demand and reduced prices</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Bookings */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Charging Sessions</h3>
            <Link href="/stations">
              <Button variant="link" size="sm">
                View All
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 font-medium text-muted-foreground">Station</th>
                  <th className="text-left py-3 font-medium text-muted-foreground">Date & Time</th>
                  <th className="text-left py-3 font-medium text-muted-foreground">Duration</th>
                  <th className="text-left py-3 font-medium text-muted-foreground">Energy (kWh)</th>
                  <th className="text-left py-3 font-medium text-muted-foreground">Cost</th>
                  <th className="text-left py-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-border hover:bg-secondary transition-colors">
                    <td className="py-3 text-foreground font-medium">{booking.stationName}</td>
                    <td className="py-3 text-muted-foreground">{booking.date}</td>
                    <td className="py-3 text-muted-foreground">{booking.duration} min</td>
                    <td className="py-3 text-foreground font-medium">{booking.kWh}</td>
                    <td className="py-3 text-accent font-semibold">${booking.cost}</td>
                    <td className="py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        booking.status === 'Completed' ? 'bg-green-500/20 text-green-700' :
                        booking.status === 'In Progress' ? 'bg-primary/20 text-primary' :
                        'bg-yellow-500/20 text-yellow-700'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* ML Models Section */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20">
          <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Machine Learning Models
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {mlModels.map((model, idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-foreground">{model.name}</h3>
                    <p className="text-xs text-muted-foreground">Algorithm: {model.model}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{model.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Accuracy</span>
                    <span className="text-xs font-bold text-primary">{model.accuracy}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${model.accuracy}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </main>
  )
}
