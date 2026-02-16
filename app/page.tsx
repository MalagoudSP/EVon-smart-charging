'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Zap, MapPin, TrendingUp, Clock, Zap as ZapIcon, TrendingUp as TrendingUpIcon } from 'lucide-react'

export default function Home() {
  const [session, setSession] = useState(null)

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-secondary">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Zap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">EVon</span>
          </div>
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <Link href="/stations">
                  <Button variant="ghost">Find Stations</Button>
                </Link>
                <Link href="/dashboard">
                  <Button>Dashboard</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container space-y-6 py-20 md:py-32">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-foreground text-balance">
            Smart EV Charging Management System
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground text-balance">
            Find nearby charging stations, predict demand, and optimize your charging experience with AI-powered recommendations.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row justify-center pt-4">
            <Link href={session ? '/stations' : '/register'}>
              <Button size="lg" className="gap-2">
                <Zap className="h-5 w-5" />
                Start Charging Now
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container space-y-12 py-20 md:py-28">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            Powerful Features
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need for optimal EV charging
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Feature Cards */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-3">
            <MapPin className="h-8 w-8 text-primary" />
            <h3 className="font-semibold text-lg">Smart Location Finder</h3>
            <p className="text-sm text-muted-foreground">
              Discover nearby charging stations with real-time availability and pricing information.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-3">
            <TrendingUp className="h-8 w-8 text-accent" />
            <h3 className="font-semibold text-lg">Demand Prediction</h3>
            <p className="text-sm text-muted-foreground">
              AI-powered forecasting shows future station demand and optimal charging times.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-3">
            <Clock className="h-8 w-8 text-primary" />
            <h3 className="font-semibold text-lg">Time Estimation</h3>
            <p className="text-sm text-muted-foreground">
              Accurate predictions of charging duration based on your vehicle and station specs.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-3">
            <Zap className="h-8 w-8 text-accent" />
            <h3 className="font-semibold text-lg">Cost Optimization</h3>
            <p className="text-sm text-muted-foreground">
              Find the most economical charging options considering price and travel distance.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-secondary py-12 md:py-16">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold text-primary">50K+</p>
              <p className="text-muted-foreground">Active Stations</p>
            </div>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold text-primary">2M+</p>
              <p className="text-muted-foreground">Successful Charges</p>
            </div>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold text-primary">95%</p>
              <p className="text-muted-foreground">Prediction Accuracy</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container space-y-6 py-20 md:py-32">
        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            Ready to Optimize Your Charging?
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of EV users who are saving time and money with EVon
          </p>
          <div className="flex flex-col gap-3 sm:flex-row justify-center">
            <Link href={session ? '/stations' : '/register'}>
              <Button size="lg">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>EVon © 2024 - Smart EV Charging Management System</p>
        </div>
      </footer>
    </main>
  )
}
