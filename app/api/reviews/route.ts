import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/reviews
 * Fetch reviews for a station
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const stationId = searchParams.get('stationId')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sort = searchParams.get('sort') || 'recent' // recent, rating, helpful

    if (!stationId) {
      return NextResponse.json(
        { error: 'stationId is required' },
        { status: 400 }
      )
    }

    const reviews = await prisma.review.findMany({
      where: { stationId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: sort === 'rating' ? { rating: 'desc' } : { createdAt: 'desc' },
      take: limit,
    })

    // Calculate stats
    const allReviews = await prisma.review.findMany({
      where: { stationId },
      select: {
        rating: true,
        cleanliness: true,
        chargerFunctionality: true,
        chargingExperience: true,
        waitingTime: true,
      },
    })

    const stats = {
      averageRating:
        allReviews.length > 0
          ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
          : 0,
      totalReviews: allReviews.length,
      ratingDistribution: calculateRatingDistribution(allReviews),
      averageCleanliness:
        allReviews.filter(r => r.cleanliness).length > 0
          ? (
              allReviews
                .filter(r => r.cleanliness)
                .reduce((sum, r) => sum + (r.cleanliness || 0), 0) /
              allReviews.filter(r => r.cleanliness).length
            ).toFixed(1)
          : null,
      averageChargerFunctionality:
        allReviews.filter(r => r.chargerFunctionality).length > 0
          ? (
              allReviews
                .filter(r => r.chargerFunctionality)
                .reduce((sum, r) => sum + (r.chargerFunctionality || 0), 0) /
              allReviews.filter(r => r.chargerFunctionality).length
            ).toFixed(1)
          : null,
      averageWaitingTime:
        allReviews.filter(r => r.waitingTime).length > 0
          ? Math.round(
              allReviews
                .filter(r => r.waitingTime)
                .reduce((sum, r) => sum + (r.waitingTime || 0), 0) /
                allReviews.filter(r => r.waitingTime).length
            )
          : null,
    }

    return NextResponse.json(
      {
        reviews: reviews.map(r => ({
          id: r.id,
          author: `${r.user.firstName} ${r.user.lastName}`,
          rating: r.rating,
          comment: r.comment,
          details: {
            cleanliness: r.cleanliness,
            chargerFunctionality: r.chargerFunctionality,
            chargingExperience: r.chargingExperience,
            waitingTime: r.waitingTime,
          },
          createdAt: r.createdAt,
        })),
        stats,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Reviews fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/reviews
 * Submit a new review
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const {
      userId,
      stationId,
      rating,
      comment,
      cleanliness,
      chargerFunctionality,
      waitingTime,
      chargingExperience,
    } = data

    if (!userId || !stationId || !rating) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, stationId, rating' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Check if user has a recent booking at this station
    const recentBooking = await prisma.booking.findFirst({
      where: {
        userId,
        stationId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      },
    })

    if (!recentBooking) {
      return NextResponse.json(
        { error: 'You must have visited this station in the last 30 days to leave a review' },
        { status: 403 }
      )
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId,
        stationId,
        rating,
        comment,
        cleanliness,
        chargerFunctionality,
        waitingTime,
        chargingExperience,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    // Update station rating
    const station = await prisma.station.findUnique({
      where: { id: stationId },
      select: { averageRating: true, reviewCount: true },
    })

    if (station) {
      const newAverageRating =
        (station.averageRating * station.reviewCount + rating) / (station.reviewCount + 1)

      await prisma.station.update({
        where: { id: stationId },
        data: {
          averageRating: parseFloat(newAverageRating.toFixed(1)),
          reviewCount: station.reviewCount + 1,
        },
      })
    }

    return NextResponse.json(
      {
        success: true,
        review,
        message: 'Review submitted successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Review creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}

function calculateRatingDistribution(reviews: any[]) {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  const total = reviews.length || 1

  reviews.forEach(review => {
    distribution[review.rating as keyof typeof distribution]++
  })

  return {
    5: Math.round((distribution[5] / total) * 100),
    4: Math.round((distribution[4] / total) * 100),
    3: Math.round((distribution[3] / total) * 100),
    2: Math.round((distribution[2] / total) * 100),
    1: Math.round((distribution[1] / total) * 100),
  }
}
