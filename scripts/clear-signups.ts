// Script to clear all signups from database
// Run with: cd teeup && npx tsx scripts/clear-signups.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearSignups() {
  try {
    console.log('Clearing all signups from database...')
    
    const result = await prisma.signup.deleteMany({})
    
    console.log(`✅ Cleared ${result.count} signups from database`)
    
  } catch (error) {
    console.error('Error clearing signups:', error)
  } finally {
    await prisma.$disconnect()
  }
}

clearSignups() 