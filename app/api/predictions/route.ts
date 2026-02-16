import { NextRequest, NextResponse } from 'next/server'

interface PredictionRequest {
  type: 'demand' | 'load' | 'charging_time' | 'recommendation'
  station_id?: string
  hour?: number
  day_of_week?: number
  month?: number
  temperature?: number
  battery_size?: number
  current_charge?: number
  target_charge?: number
}

interface PredictionResponse {
  type: string
  value: number
  confidence: number
  timestamp: string
  details?: Record<string, any>
}

export async function POST(request: NextRequest) {
  try {
    const body: PredictionRequest = await request.json()

    // In production, call FastAPI backend with ML models
    // const response = await fetch(`${process.env.BACKEND_URL}/api/predictions`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(body)
    // })
    // return NextResponse.json(await response.json())

    // Mock predictions based on type
    let predictedValue = 0
    let confidence = 0.92
    let details: Record<string, any> = {}

    const now = new Date()
    const hour = body.hour || now.getHours()
    const dayOfWeek = body.day_of_week || now.getDay()

    switch (body.type) {
      case 'demand':
        // Demand prediction: higher during peak hours
        const isPeakHour = (hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 20)
        const isPeakDay = dayOfWeek < 5 // Weekday
        predictedValue = isPeakHour && isPeakDay ? 85 : isPeakHour ? 70 : 45
        predictedValue += Math.random() * 10 - 5
        details = {
          peak_hour: isPeakHour,
          peak_day: isPeakDay,
          expected_wait_time: Math.round(predictedValue / 10) + ' minutes'
        }
        break

      case 'load':
        // Load prediction
        const baseLoad = 80
        const hourEffect = isPeakHour ? 40 : 20
        predictedValue = baseLoad + hourEffect + (Math.random() * 10 - 5)
        details = {
          grid_utilization: Math.round(predictedValue) + ' kW',
          available_capacity: Math.round(150 - predictedValue) + ' kW'
        }
        break

      case 'charging_time':
        // Charging time prediction
        const battery = body.battery_size || 60
        const currentCharge = body.current_charge || 20
        const targetCharge = body.target_charge || 80
        const requiredKwh = battery * (targetCharge - currentCharge) / 100
        const chargerPower = 50 // DC Fast charger
        predictedValue = (requiredKwh / chargerPower) * 60 // minutes
        confidence = 0.88
        details = {
          battery_size_kwh: battery,
          required_energy_kwh: requiredKwh.toFixed(1),
          charger_power_kw: chargerPower,
          estimated_time_minutes: Math.round(predictedValue)
        }
        break

      case 'recommendation':
        // Station recommendation score (0-100)
        predictedValue = 75 + (Math.random() * 20 - 10)
        details = {
          recommendation_score: Math.round(predictedValue),
          reason: 'Good availability and reasonable pricing',
          estimated_cost: '$8.50'
        }
        break

      default:
        return NextResponse.json(
          { error: 'Unknown prediction type' },
          { status: 400 }
        )
    }

    const response: PredictionResponse = {
      type: body.type,
      value: Math.round(predictedValue * 100) / 100,
      confidence: confidence,
      timestamp: new Date().toISOString(),
      details
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate prediction' },
      { status: 500 }
    )
  }
}
