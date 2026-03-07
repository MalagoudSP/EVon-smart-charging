'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Zap, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(
        'http://localhost:8000/api/auth/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        setError(error.detail || 'Invalid email or password')
        toast.error('Invalid credentials')
        setIsLoading(false)
        return
      }

      const data = await response.json()
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      toast.success('Logged in successfully')
      router.push('/dashboard')
    } catch (err) {
      console.error('Login error:', err)
      setError('Failed to login. Make sure the backend is running.')
      toast.error('Login failed')
    }
    setIsLoading(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="space-y-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Zap className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">EVon</h1>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Sign In</h2>
          <p className="text-muted-foreground">Welcome back to your charging dashboard</p>
        </div>

        {/* Login Form */}
        <div className="rounded-lg border border-border bg-card p-8 space-y-6">
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-card px-2 text-muted-foreground">
                Don't have an account?
              </span>
            </div>
          </div>

          <Link href="/register">
            <Button variant="outline" className="w-full">
              Create Account
            </Button>
          </Link>
        </div>

        {/* Backend Info */}
        <div className="rounded-lg border border-border bg-secondary/50 p-4 space-y-2">
          <p className="text-sm font-semibold text-foreground">⚠️ Important</p>
          <p className="text-xs text-muted-foreground">
            Make sure the backend server is running on <strong>http://localhost:8000</strong> before logging in.
          </p>
        </div>
      </div>
    </main>
  )
}
