import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfWeek, endOfWeek, addWeeks } from 'date-fns'

// GET /api/signups - Get signups for the 4-week period
export async function GET(request: NextRequest) {
  try {
    const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 }) // Monday
    const fourWeeksEnd = endOfWeek(addWeeks(currentWeekStart, 3), { weekStartsOn: 1 })
    
    const signups = await prisma.signup.findMany({
      where: {
        date: {
          gte: currentWeekStart,
          lte: fourWeeksEnd
        }
      },
      include: {
        golfer: true
      },
      orderBy: {
        date: 'asc'
      }
    })
    
    // Transform dates to ISO strings for consistency
    const transformedSignups = signups.map((signup) => ({
      ...signup,
      date: signup.date.toISOString().split('T')[0]
    }))
    
    return NextResponse.json(transformedSignups)
  } catch (error) {
    console.error('Error fetching signups:', error)
    return NextResponse.json(
      { error: 'Failed to fetch signups' },
      { status: 500 }
    )
  }
}

// POST /api/signups - Create a new signup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { golferId, date } = body
    
    if (!golferId || !date) {
      return NextResponse.json(
        { error: 'Golfer ID and date are required' },
        { status: 400 }
      )
    }
    
    // Check if golfer exists
    const golfer = await prisma.golfer.findUnique({
      where: { id: golferId }
    })
    
    if (!golfer) {
      return NextResponse.json(
        { error: 'Golfer not found' },
        { status: 404 }
      )
    }
    
    // Check if signup already exists
    const existingSignup = await prisma.signup.findUnique({
      where: {
        golferId_date: {
          golferId,
          date: new Date(date)
        }
      }
    })
    
    if (existingSignup) {
      return NextResponse.json(
        { error: 'You are already signed up for this date' },
        { status: 400 }
      )
    }
    
    // Check if date has reached capacity (8 golfers)
    const signupsForDate = await prisma.signup.count({
      where: {
        date: new Date(date)
      }
    })
    
    if (signupsForDate >= 8) {
      return NextResponse.json(
        { error: 'This date is fully booked (8 golfers maximum)' },
        { status: 400 }
      )
    }
    
    // Create the signup
    const signup = await prisma.signup.create({
      data: {
        golferId,
        date: new Date(date)
      },
      include: {
        golfer: true
      }
    })
    
    return NextResponse.json({
      ...signup,
      date: signup.date.toISOString().split('T')[0]
    })
  } catch (error) {
    console.error('Error creating signup:', error)
    return NextResponse.json(
      { error: 'Failed to create signup' },
      { status: 500 }
    )
  }
}

// DELETE /api/signups - Remove a signup
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const signupId = searchParams.get('id')
    
    if (!signupId) {
      return NextResponse.json(
        { error: 'Signup ID is required' },
        { status: 400 }
      )
    }
    
    const signup = await prisma.signup.delete({
      where: { id: signupId }
    })
    
    return NextResponse.json({
      success: true,
      deletedId: signup.id
    })
  } catch (error) {
    console.error('Error deleting signup:', error)
    return NextResponse.json(
      { error: 'Failed to delete signup' },
      { status: 500 }
    )
  }
} 