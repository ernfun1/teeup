import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT /api/golfers/[id] - Update a golfer
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { firstName, lastInitial, mobileNumber } = body
    
    // Update the golfer
    const golfer = await prisma.golfer.update({
      where: { id: params.id },
      data: {
        firstName: firstName || undefined,
        lastInitial: lastInitial?.toUpperCase() || undefined,
        mobileNumber: mobileNumber || undefined
      }
    })
    
    return NextResponse.json(golfer)
  } catch (error: any) {
    console.error('Error updating golfer:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Golfer not found' },
        { status: 404 }
      )
    }
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A golfer with this name already exists' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update golfer' },
      { status: 500 }
    )
  }
}

// DELETE /api/golfers/[id] - Delete a golfer
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.golfer.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting golfer:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Golfer not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to delete golfer' },
      { status: 500 }
    )
  }
} 