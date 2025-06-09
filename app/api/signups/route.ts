import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfWeek, endOfWeek, addWeeks } from 'date-fns'
import { dateToString, stringToDate, getTodayUTC } from '@/lib/date-utils'

// GET /api/signups - Get signups for the 4-week period
export async function GET(request: NextRequest) {
  try {
    console.log('=== GET /api/signups called at', new Date().toISOString(), '===')
    
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
      },
      orderBy: {
        date: 'asc'
      }
    })
    console.log('Total signups in database:', allSignups.length)
    
    // Log all signup IDs and dates for debugging
    console.log('All signup IDs and dates:')
    allSignups.forEach(s => {
      console.log(`  - ID: ${s.id}, Date: ${dateToString(s.date)}, GolferId: ${s.golferId}`)
    })
    
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
    
    // TEMPORARY: Return ALL signups to debug the filtering issue
    console.log('Filtered signups for 4-week period:', signups.length)
    console.log('Total signups in DB:', allSignups.length)
    console.log('DEBUGGING: Returning ALL signups to diagnose filtering issue')
    
    // Log sample data to debug
    if (allSignups.length > 0) {
      console.log('Sample signup data:', {
        id: allSignups[0].id,
        golferId: allSignups[0].golferId,
        golferIdLength: allSignups[0].golferId.length,
        date: allSignups[0].date,
        golferFirstName: allSignups[0].golfer?.firstName
      })
    }
    
    // Transform dates to ISO strings for consistency and ensure all fields are included
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
    
    console.log('Returning', transformedSignups.length, 'total signups (all dates)')
    
    // Add response headers to ensure fresh data
    return NextResponse.json(transformedSignups, {
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Content-Type-Options': 'nosniff',
        'Vary': 'Accept-Encoding'
      }
    })
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
    console.log('Created at timestamp:', new Date().toISOString())
    
    // Verify the signup was actually created
    const verifySignup = await prisma.signup.findUnique({
      where: { id: signup.id },
      include: { golfer: true }
    })
    
    console.log('Verification - signup exists:', !!verifySignup)
    
    // Return all signups to avoid consistency issues with connection pooling
    const updatedSignups = await prisma.signup.findMany({
      include: {
        golfer: true
      },
      orderBy: {
        date: 'asc'
      }
    })
    
    console.log('Returning updated signups count:', updatedSignups.length)
    
    const transformedSignups = updatedSignups.map((s) => ({
      id: s.id,
      golferId: s.golferId,
      date: dateToString(s.date),
      createdAt: s.createdAt,
      golfer: s.golfer ? {
        id: s.golfer.id,
        firstName: s.golfer.firstName,
        lastInitial: s.golfer.lastInitial,
        mobileNumber: s.golfer.mobileNumber
      } : null
    }))
    
    return NextResponse.json({
      success: true,
      newSignup: {
        ...signup,
        date: dateToString(signup.date)
      },
      allSignups: transformedSignups
    }, {
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Content-Type-Options': 'nosniff',
        'Vary': 'Accept-Encoding'
      }
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