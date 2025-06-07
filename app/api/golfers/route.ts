import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/golfers - Get all golfers or find a specific golfer
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const firstName = searchParams.get('firstName')
    const lastInitial = searchParams.get('lastInitial')
    
    // If searching for a specific golfer
    if (firstName && lastInitial) {
      const golfer = await prisma.golfer.findUnique({
        where: {
          firstName_lastInitial: {
            firstName,
            lastInitial: lastInitial.toUpperCase()
          }
        }
      })
      
      return NextResponse.json(golfer)
    }
    
    // Otherwise return all golfers
    const golfers = await prisma.golfer.findMany({
      orderBy: [
        { firstName: 'asc' },
        { lastInitial: 'asc' }
      ]
    })
    
    return NextResponse.json(golfers)
  } catch (error) {
    console.error('Error fetching golfers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch golfers' },
      { status: 500 }
    )
  }
}

// POST /api/golfers - Create a new golfer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastInitial, mobileNumber } = body
    
    // Validate required fields
    if (!firstName || !lastInitial) {
      return NextResponse.json(
        { error: 'First name and last initial are required' },
        { status: 400 }
      )
    }
    
    // Check if we've reached the limit of 50 golfers
    const golferCount = await prisma.golfer.count()
    if (golferCount >= 50) {
      return NextResponse.json(
        { error: 'Maximum number of golfers (50) has been reached' },
        { status: 400 }
      )
    }
    
    // Create the golfer
    const golfer = await prisma.golfer.create({
      data: {
        firstName,
        lastInitial: lastInitial.toUpperCase(),
        mobileNumber: mobileNumber || null
      }
    })
    
    return NextResponse.json(golfer)
  } catch (error: any) {
    console.error('Error creating golfer:', error)
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A golfer with this name already exists' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create golfer' },
      { status: 500 }
    )
  }
} 