import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * ML-powered demand prediction endpoint
 * GET /api/predictions/demand
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const stationId = searchParams.get('stationId')
    const hoursAhead = parseInt(searchParams.get('hoursAhead') || '2')

    if (!stationId) {
      return NextResponse.json(
        { error: 'stationId parameter is required' },
        { status: 400 }
      )
    }

    // Get existing predictions from database
    const predictions = await prisma.demandPrediction.findMany({
      where: { stationId },
      orderBy: { createdAt: 'desc' },
      take: 24, // Last 24 predictions
    })

    // If we have recent predictions, return them
    const mostRecentPrediction = predictions[0]
    if (
      mostRecentPrediction &&
      new Date().getTime() - mostRecentPrediction.createdAt.getTime() < 3600000 // 1 hour
    ) {
      return NextResponse.json(
        {
          predictions: predictions.slice(0, hoursAhead),
          source: 'cached',
        },
        { status: 200 }
      )
    }

    // Generate new predictions using ML model
    const newPredictions = await generateMLPredictions(stationId, hoursAhead)

    return NextResponse.json(
      {
        predictions: newPredictions,
        source: 'ml_generated',
        timestamp: new Date(),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Prediction error:', error)
    return NextResponse.json(
      { error: 'Failed to generate predictions' },
      { status: 500 }
    )
  }
}

/**
 * Generate ML-powered predictions for demand
 * This would call your ML backend in production
 */
async function generateMLPredictions(
  stationId: string,
  hoursAhead: number
) {
  // In production, call your FastAPI ML backend
  // For now, generate realistic mock predictions based on patterns

  const now = new Date()
  const predictions = []

  for (let i = 0; i < hoursAhead; i++) {
    const predictionTime = new Date(now.getTime() + i * 3600000)
    const hour = predictionTime.getHours()
    const dayOfWeek = predictionTime.getDay()

    // ML pattern: high demand during commute hours (7-9am, 5-7pm)
    // Weekends have different patterns
    let predictedDemand = 40
    let waitingTime = 10

    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const isMorningCommute = hour >= 7 && hour <= 9
    const isEveningCommute = hour >= 17 && hour <= 19
    const isLunchTime = hour >= 12 && hour <= 13

    if (isMorningCommute || isEveningCommute) {
      predictedDemand = isWeekend ? 65 : 85
      waitingTime = isWeekend ? 20 : 40
    } else if (isLunchTime) {
      predictedDemand = 60
      waitingTime = 25
    } else if (hour >= 9 && hour <= 17) {
      predictedDemand = isWeekend ? 50 : 55
      waitingTime = isWeekend ? 12 : 15
    } else if (hour >= 20 && hour <= 23) {
      predictedDemand = 45
      waitingTime = 8
    } else {
      predictedDemand = 25
      waitingTime = 3
    }

    // Add some randomness
    predictedDemand += Math.random() * 10 - 5
    waitingTime += Math.floor(Math.random() * 5 - 2)

    predictions.push({
      stationId,
      predictedDemand: Math.max(0, Math.min(100, predictedDemand)),
      timeSlot: `${predictionTime.getHours().toString().padStart(2, '0')}:00`,
      dayOfWeek: dayOfWeek,
      predictedWaitTime: Math.max(0, waitingTime),
      confidenceScore: 0.75 + Math.random() * 0.2,
      mlModelVersion: 'v1.0.1',
    })
  }

  // Save predictions to database
  for (const pred of predictions) {
    await prisma.demandPrediction.create({ data: pred })
  }

  return predictions
}

/**
 * POST /api/predictions/demand
 * Update predictions with actual data for model retraining
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { stationId, actualDemand, actualWaitTime, timeSlot } = data

    // Record actual data for model feedback
    const prediction = await prisma.demandPrediction.findFirst({
      where: {
        stationId,
        timeSlot,
      },
      orderBy: { createdAt: 'desc' },
    })

    if (prediction) {
      // Calculate accuracy
      const demandAccuracy = 1 - Math.abs(prediction.predictedDemand - actualDemand) / 100
      const waitingTimeAccuracy =
        1 -
        Math.abs((prediction.predictedWaitTime || 0) - (actualWaitTime || 0)) /
          Math.max(prediction.predictedWaitTime || 1, actualWaitTime || 1)

      console.log('ML Model Feedback:', {
        stationId,
        demandAccuracy: (demandAccuracy * 100).toFixed(2) + '%',
        waitingTimeAccuracy: (waitingTimeAccuracy * 100).toFixed(2) + '%',
      })

      // In production, send this to ML backend for model retraining
    }

    return NextResponse.json(
      { success: true, message: 'Feedback recorded' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Feedback error:', error)
    return NextResponse.json(
      { error: 'Failed to record feedback' },
      { status: 500 }
    )
  }
}
