import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfWeek, endOfWeek, addWeeks } from 'date-fns'
import { dateToString, stringToDate, getTodayUTC } from '@/lib/date-utils'

// GET /api/signups - Get signups for the 4-week period
export async function GET(request: NextRequest) {
  try {
    const today = getTodayUTC()
    const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 }) // Monday
    const fourWeeksEnd = endOfWeek(addWeeks(currentWeekStart, 3), { weekStartsOn: 1 })
    
    console.log('GET /api/signups - Date filter debug:')
    console.log('Today (UTC):', dateToString(today))
    console.log('Week start:', dateToString(currentWeekStart))
    console.log('Four weeks end:', dateToString(fourWeeksEnd))
    
    // First, let's check if there are ANY signups in the database
    const allSignups = await prisma.signup.findMany({
      include: {
        golfer: true
      }
    })
    console.log('Total signups in database:', allSignups.length)
    if (allSignups.length > 0) {
      console.log('First signup date:', dateToString(allSignups[0].date))
    }
    
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
    
    // TEMPORARY: Return ALL signups to debug the issue
    console.log('Filtered signups:', signups.length)
    console.log('Using ALL signups for debugging')
    
    // Log sample data to debug
    if (allSignups.length > 0) {
      console.log('Sample signup data:', {
        id: allSignups[0].id,
        golferId: allSignups[0].golferId,
        date: allSignups[0].date,
        golferFirstName: allSignups[0].golfer?.firstName
      })
    }
    
    // Transform dates to ISO strings for consistency
    const transformedSignups = allSignups.map((signup) => ({
      id: signup.id,
      golferId: signup.golferId,
      date: dateToString(signup.date),
      createdAt: signup.createdAt,
      golfer: signup.golfer ? {
        id: signup.golfer.id,
        firstName: signup.golfer.firstName,
        lastInitial: signup.golfer.lastInitial,
        mobileNumber: signup.golfer.mobileNumber
      } : null
    }))
    
    console.log('Returning', transformedSignups.length, 'signups')
    
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
    
    console.log('Signup request received:', { golferId, date })
    
    if (!golferId || !date) {
      console.error('Missing required fields:', { golferId, date })
      return NextResponse.json(
        { error: 'Golfer ID and date are required' },
        { status: 400 }
      )
    }
    
    // Parse the date string to a proper UTC date
    const parsedDate = stringToDate(date)
    console.log('Date parsing debug:')
    console.log('Input date string:', date)
    console.log('Parsed date (UTC):', parsedDate.toISOString())
    console.log('Date string:', dateToString(parsedDate))
    
    if (isNaN(parsedDate.getTime())) {
      console.error('Invalid date format:', date)
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      )
    }
    
    // Check if golfer exists
    const golfer = await prisma.golfer.findUnique({
      where: { id: golferId }
    })
    
    if (!golfer) {
      console.error('Golfer not found:', golferId)
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
          date: parsedDate
        }
      }
    })
    
    if (existingSignup) {
      console.log('Signup already exists for:', { golferId, date })
      return NextResponse.json(
        { error: 'You are already signed up for this date' },
        { status: 400 }
      )
    }
    
    // Check if date has reached capacity (8 golfers)
    const signupsForDate = await prisma.signup.count({
      where: {
        date: parsedDate
      }
    })
    
    if (signupsForDate >= 8) {
      console.log('Date is fully booked:', date)
      return NextResponse.json(
        { error: 'This date is fully booked (8 golfers maximum)' },
        { status: 400 }
      )
    }
    
    // Create the signup
    const signup = await prisma.signup.create({
      data: {
        golferId,
        date: parsedDate
      },
      include: {
        golfer: true
      }
    })
    
    console.log('Signup created successfully:', signup.id)
    console.log('Created signup date:', dateToString(signup.date))
    
    return NextResponse.json({
      ...signup,
      date: dateToString(signup.date)
    })
  } catch (error) {
    console.error('Error creating signup:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    
    // Check for Prisma-specific errors
    if (error instanceof Error) {
      if (error.message.includes('P2002')) {
        return NextResponse.json(
          { error: 'A signup for this date already exists' },
          { status: 400 }
        )
      }
      if (error.message.includes('P2003')) {
        return NextResponse.json(
          { error: 'Invalid golfer ID provided' },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create signup', details: error instanceof Error ? error.message : 'Unknown error' },
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
    
    try {
      const signup = await prisma.signup.delete({
        where: { id: signupId }
      })
      
      return NextResponse.json({
        success: true,
        deletedId: signup.id
      })
    } catch (deleteError: any) {
      // If the record doesn't exist (P2025), return success anyway
      // This handles the case where a user rapidly toggles a signup
      if (deleteError.code === 'P2025') {
        return NextResponse.json({
          success: true,
          deletedId: signupId,
          message: 'Signup was already removed'
        })
      }
      // Re-throw other errors
      throw deleteError
    }
  } catch (error) {
    console.error('Error deleting signup:', error)
    return NextResponse.json(
      { error: 'Failed to delete signup' },
      { status: 500 }
    )
  }
} 