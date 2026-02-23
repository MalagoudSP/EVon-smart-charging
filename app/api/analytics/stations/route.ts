import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/analytics/stations
 * Fetch real-time analytics for all stations
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const stationId = searchParams.get('stationId')

    if (stationId) {
      // Single station analytics
      const analytics = await prisma.stationAnalytics.findMany({
        where: { stationId },
        orderBy: { date: 'desc' },
        take: 30,
      })

      const currentStats = await prisma.station.findUnique({
        where: { id: stationId },
        select: {
          stationName: true,
          availableChargers: true,
          totalChargers: true,
          demandLevel: true,
          waitingTimeMinutes: true,
          averageRating: true,
          reviewCount: true,
          dynamicPrice: true,
          pricePerKwh: true,
        },
      })

      return NextResponse.json(
        {
          currentStats,
          historicalAnalytics: analytics,
        },
        { status: 200 }
      )
    }

    // All stations analytics summary
    const today = new Date()
    today.setDate(today.getDate())

    const allAnalytics = await prisma.stationAnalytics.findMany({
      where: {
        date: {
          gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        },
      },
      orderBy: { totalRevenueUsd: 'desc' },
    })

    const totalStats = {
      totalStations: await prisma.station.count(),
      totalBookingsToday: allAnalytics.reduce((sum, a) => sum + a.totalBookings, 0),
      totalEnergyDispenedKwh: allAnalytics.reduce(
        (sum, a) => sum + a.totalEnergyDispenedKwh,
        0
      ),
      totalRevenueUsd: allAnalytics.reduce((sum, a) => sum + a.totalRevenueUsd, 0),
      averageOccupancy: (
        allAnalytics.reduce((sum, a) => sum + a.averageOccupancy, 0) /
        Math.max(allAnalytics.length, 1)
      ).toFixed(2),
    }

    return NextResponse.json(
      {
        summary: totalStats,
        stationAnalytics: allAnalytics,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
