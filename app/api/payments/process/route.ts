import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * POST /api/payments/process
 * Process payment for a booking
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const {
      userId,
      bookingId,
      amount,
      paymentMethod,
      cardToken,
      promoCode,
    } = data

    if (!userId || !bookingId || !amount || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate booking exists and belongs to user
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    })

    if (!booking || booking.userId !== userId) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // In production, integrate with Stripe/PayPal/Square
    // const paymentIntentId = await processPaymentWithProvider(){ 
    //   amount,
    //   paymentMethod,
    //   cardToken,
    // })

    // Mock successful payment
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Apply promo code discount if provided
    let finalAmount = amount
    if (promoCode) {
      const discount = await validateAndApplyPromoCode(promoCode, userId, amount)
      if (discount) {
        finalAmount = amount - discount.discountAmount
      }
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        bookingId,
        amount: finalAmount,
        paymentMethod,
        transactionId,
        status: 'completed',
      },
    })

    // Update booking status
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'completed',
        bookingStatus: 'active',
        finalCost: finalAmount,
      },
    })

    // Create confirmation notification
    const station = await prisma.station.findUnique({
      where: { id: booking.stationId },
      select: { stationName: true },
    })

    await prisma.notification.create({
      data: {
        userId,
        type: 'booking_confirmation',
        title: 'Booking Confirmed',
        message: `Your booking at ${station?.stationName} has been confirmed. Total: $${finalAmount.toFixed(2)}`,
        data: JSON.stringify({ bookingId, paymentId: payment.id }),
      },
    })

    return NextResponse.json(
      {
        success: true,
        payment,
        transactionId,
        message: 'Payment processed successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Payment processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/payments/history
 * Fetch user payment history
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    const summary = {
      totalSpent: payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0),
      totalTransactions: payments.length,
      lastPayment: payments[0]?.createdAt || null,
    }

    return NextResponse.json(
      {
        payments: payments.map(p => ({
          id: p.id,
          amount: p.amount,
          paymentMethod: p.paymentMethod,
          status: p.status,
          transactionId: p.transactionId,
          createdAt: p.createdAt,
        })),
        summary,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Payment history error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment history' },
      { status: 500 }
    )
  }
}

/**
 * Validate and apply promo code
 */
async function validateAndApplyPromoCode(
  promoCode: string,
  userId: string,
  amount: number
) {
  // Mock promo codes
  const promoCodes: {
    [key: string]: { type: 'percentage' | 'fixed'; value: number; minAmount: number }
  } = {
    WELCOME10: { type: 'percentage', value: 10, minAmount: 0 },
    SAVE5: { type: 'fixed', value: 5, minAmount: 20 },
    NEWUSER20: { type: 'percentage', value: 20, minAmount: 0 },
    BULK15: { type: 'percentage', value: 15, minAmount: 100 },
  }

  const code = promoCodes[promoCode.toUpperCase()]
  if (!code) return null

  if (amount < code.minAmount) return null

  const discountAmount =
    code.type === 'percentage' ? (amount * code.value) / 100 : code.value

  return {
    promoCode,
    discountAmount: Math.min(discountAmount, amount * 0.5), // Max 50% discount
  }
}

/**
 * POST /api/payments/wellness-rewards
 * Process wellness credits earned from sustainable driving
 */
export async function wellness(request: NextRequest) {
  try {
    const data = await request.json()
    const { userId, rewardsPoints, reason } = data

    if (!userId || !rewardsPoints) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Record wellness reward (could integrate with a rewards system)
    const creditAmount = (rewardsPoints * 0.01).toFixed(2)

    const notification = await prisma.notification.create({
      data: {
        userId,
        type: 'wellness_reward',
        title: 'Eco-Friendly Bonus!',
        message: `You earned $${creditAmount} in credits for ${reason}. Rewards: ${rewardsPoints} points`,
        data: JSON.stringify({
          rewardsPoints,
          creditAmount,
          reason,
        }),
      },
    })

    return NextResponse.json(
      {
        success: true,
        notification,
        creditAmount,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Wellness reward error:', error)
    return NextResponse.json(
      { error: 'Failed to process wellness reward' },
      { status: 500 }
    )
  }
}
