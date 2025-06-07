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

// POST /api/golfers - Not used in new flow
export async function POST(request: NextRequest) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

// PUT /api/golfers/[id] - Update a golfer
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, firstName, lastInitial, mobileNumber } = body
    
    if (!id) {
      return NextResponse.json(
        { error: 'Golfer ID is required' },
        { status: 400 }
      )
    }
    
    // Update the golfer
    const golfer = await prisma.golfer.update({
      where: { id },
      data: {
        firstName: firstName || undefined,
        lastInitial: lastInitial?.toUpperCase() || undefined,
        mobileNumber: mobileNumber || undefined
      }
    })
    
    return NextResponse.json(golfer)
  } catch (error) {
    console.error('Error updating golfer:', error)
    return NextResponse.json(
      { error: 'Failed to update golfer' },
      { status: 500 }
    )
  }
} 