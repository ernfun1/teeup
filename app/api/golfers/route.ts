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

// POST /api/golfers - Create a new golfer or return existing one
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastInitial } = body
    
    // Validate input
    if (!firstName || !lastInitial) {
      return NextResponse.json(
        { error: 'First name and last initial are required' },
        { status: 400 }
      )
    }
    
    // Validate firstName (2-15 characters, letters only)
    if (!/^[A-Za-z]{2,15}$/.test(firstName)) {
      return NextResponse.json(
        { error: 'First name must be 2-15 letters only' },
        { status: 400 }
      )
    }
    
    // Validate lastInitial (1 letter)
    if (!/^[A-Za-z]$/.test(lastInitial)) {
      return NextResponse.json(
        { error: 'Last initial must be a single letter' },
        { status: 400 }
      )
    }
    
    // First, check if this golfer already exists
    const existingGolfer = await prisma.golfer.findUnique({
      where: {
        firstName_lastInitial: {
          firstName,
          lastInitial: lastInitial.toUpperCase()
        }
      }
    })
    
    // If golfer exists, return them (allows login)
    if (existingGolfer) {
      return NextResponse.json(existingGolfer)
    }
    
    // If golfer doesn't exist, check if we've reached the limit
    const golferCount = await prisma.golfer.count()
    if (golferCount >= 50) {
      return NextResponse.json(
        { error: 'Maximum golfer limit reached. Please use an existing name.' },
        { status: 400 }
      )
    }
    
    // Create new golfer
    const golfer = await prisma.golfer.create({
      data: {
        firstName,
        lastInitial: lastInitial.toUpperCase()
      }
    })
    
    return NextResponse.json(golfer)
  } catch (error) {
    console.error('Error creating golfer:', error)
    return NextResponse.json(
      { error: 'Failed to create golfer' },
      { status: 500 }
    )
  }
} 