/**
 * Environment Variables Configuration & Validation
 * Ensures all required environment variables are present and valid
 */

interface EnvironmentConfig {
  // API Configuration
  nextPublicBackendUrl: string
  nextPublicApiUrl: string

  // Database
  databaseUrl: string

  // Authentication
  nextAuthSecret: string
  nextAuthUrl: string

  // Third-party Services
  googleMapsApiKey?: string
  stripePublicKey?: string
  stripeSecretKey?: string

  // Feature Flags
  enableAnalytics: boolean
  enablePredictions: boolean
  enableDynamicPricing: boolean

  // Environment
  environment: 'development' | 'staging' | 'production'
  nodeEnv: string
}

/**
 * Parse and validate environment variables
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const env = process.env

  // Validate required variables
  const required = [
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'DATABASE_URL',
  ]

  const missing = required.filter(v => !env[v])
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    )
  }

  // Validate URLs
  const validateUrl = (url: string, name: string) => {
    try {
      new URL(url)
    } catch (err) {
      throw new Error(`Invalid URL for ${name}: ${url}`)
    }
  }

  if (env.NEXTAUTH_URL) validateUrl(env.NEXTAUTH_URL, 'NEXTAUTH_URL')
  if (env.NEXT_PUBLIC_BACKEND_URL)
    validateUrl(env.NEXT_PUBLIC_BACKEND_URL, 'NEXT_PUBLIC_BACKEND_URL')

  // Parse boolean flags
  const parseBoolean = (value: string | undefined, defaultValue: boolean = false) => {
    if (!value) return defaultValue
    return value.toLowerCase() === 'true'
  }

  const config: EnvironmentConfig = {
    nextPublicBackendUrl:
      env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
    nextPublicApiUrl: env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    databaseUrl: env.DATABASE_URL!,
    nextAuthSecret: env.NEXTAUTH_SECRET!,
    nextAuthUrl: env.NEXTAUTH_URL!,
    googleMapsApiKey: env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    stripePublicKey: env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
    stripeSecretKey: env.STRIPE_SECRET_KEY,
    enableAnalytics: parseBoolean(env.NEXT_PUBLIC_ENABLE_ANALYTICS, true),
    enablePredictions: parseBoolean(env.NEXT_PUBLIC_ENABLE_PREDICTIONS, true),
    enableDynamicPricing: parseBoolean(
      env.NEXT_PUBLIC_ENABLE_DYNAMIC_PRICING,
      true
    ),
    environment: (env.ENVIRONMENT as any) || 'development',
    nodeEnv: env.NODE_ENV || 'development',
  }

  return config
}

/**
 * Validate environment for specific context
 */
export function validateEnvironmentForContext(context: 'api' | 'frontend' | 'backend' = 'api'): void {
  const env = process.env

  switch (context) {
    case 'api':
      const apiRequired = ['NEXTAUTH_SECRET', 'NEXTAUTH_URL', 'DATABASE_URL']
      const apiMissing = apiRequired.filter(v => !env[v])
      if (apiMissing.length > 0) {
        throw new Error(
          `Missing required API environment variables: ${apiMissing.join(', ')}`
        )
      }
      break

    case 'frontend':
      // Frontend can be more lenient with variables
      if (!env.NEXT_PUBLIC_BACKEND_URL) {
        console.warn('NEXT_PUBLIC_BACKEND_URL not set, using default')
      }
      break

    case 'backend':
      const backendRequired = ['DATABASE_URL']
      const backendMissing = backendRequired.filter(v => !env[v])
      if (backendMissing.length > 0) {
        throw new Error(
          `Missing required backend environment variables: ${backendMissing.join(', ')}`
        )
      }
      break
  }
}

/**
 * Get safe config for client (no secrets)
 */
export function getPublicConfig() {
  return {
    backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    stripePublicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    enablePredictions: process.env.NEXT_PUBLIC_ENABLE_PREDICTIONS === 'true',
    enableDynamicPricing:
      process.env.NEXT_PUBLIC_ENABLE_DYNAMIC_PRICING === 'true',
  }
}

/**
 * Log environment info for debugging (safe version)
 */
export function logEnvironmentInfo() {
  const safe = getPublicConfig()
  console.info('✅ Environment Configuration:')
  console.info(`   Backend URL: ${safe.backendUrl}`)
  console.info(`   API URL: ${safe.apiUrl}`)
  console.info(`   Analytics: ${safe.enableAnalytics}`)
  console.info(`   Predictions: ${safe.enablePredictions}`)
  console.info(`   Dynamic Pricing: ${safe.enableDynamicPricing}`)
}
