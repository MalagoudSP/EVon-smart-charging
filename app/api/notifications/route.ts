import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/notifications
 * Fetch user notifications
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const where = unreadOnly ? { userId, isRead: false } : { userId }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    })

    return NextResponse.json(
      {
        notifications,
        unreadCount,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Notifications fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/notifications
 * Create a new notification
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { userId, type, title, message, data: notificationData } = data

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, type, title, message' },
        { status: 400 }
      )
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: notificationData ? JSON.stringify(notificationData) : null,
      },
    })

    return NextResponse.json(
      {
        success: true,
        notification,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Notification creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/notifications
 * Mark notifications as read
 */
export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json()
    const { notificationId, userId, markAllAsRead } = data

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    if (markAllAsRead) {
      // Mark all notifications as read for the user
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      })

      return NextResponse.json(
        { success: true, message: 'All notifications marked as read' },
        { status: 200 }
      )
    }

    if (!notificationId) {
      return NextResponse.json(
        { error: 'notificationId or markAllAsRead is required' },
        { status: 400 }
      )
    }

    // Mark specific notification as read
    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    })

    return NextResponse.json(
      { success: true, notification },
      { status: 200 }
    )
  } catch (error) {
    console.error('Notification update error:', error)
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/notifications
 * Delete notifications
 */
export async function DELETE(request: NextRequest) {
  try {
    const data = await request.json()
    const { notificationId, userId, deleteAll } = data

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    if (deleteAll) {
      await prisma.notification.deleteMany({
        where: { userId },
      })
      return NextResponse.json(
        { success: true, message: 'All notifications deleted' },
        { status: 200 }
      )
    }

    if (!notificationId) {
      return NextResponse.json(
        { error: 'notificationId or deleteAll is required' },
        { status: 400 }
      )
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    })

    return NextResponse.json(
      { success: true, message: 'Notification deleted' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Notification deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    )
  }
}

/**
 * Generate smart notifications based on user patterns
 */
export async function generateSmartNotifications() {
  try {
    // Find users with upcoming bookings
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    const upcomingBookings = await prisma.booking.findMany({
      where: {
        startTime: {
          gte: new Date(),
          lte: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      },
      include: {
        user: true,
        station: true,
      },
    })

    for (const booking of upcomingBookings) {
      // Create reminder notification
      await prisma.notification.create({
        data: {
          userId: booking.userId,
          type: 'booking_reminder',
          title: 'Your charging session is coming up',
          message: `Your session at ${booking.station.stationName} starts in 1 hour`,
          data: JSON.stringify({ bookingId: booking.id, stationId: booking.stationId }),
        },
      })
    }

    return { success: true, notificationsCreated: upcomingBookings.length }
  } catch (error) {
    console.error('Smart notifications error:', error)
    throw error
  }
}
