import { prisma } from '../lib/prisma'

async function debugGolferSignups() {
  console.log('=== Debugging Golfer IDs and Signups ===\n')
  
  try {
    // Get all golfers
    const golfers = await prisma.golfer.findMany()
    console.log(`Found ${golfers.length} golfers:\n`)
    
    golfers.forEach(golfer => {
      console.log(`Golfer: ${golfer.firstName} ${golfer.lastInitial}`)
      console.log(`  ID: "${golfer.id}"`)
      console.log(`  ID length: ${golfer.id.length}`)
      console.log(`  ID type: ${typeof golfer.id}`)
      console.log('')
    })
    
    // Get all signups
    const signups = await prisma.signup.findMany({
      include: { golfer: true }
    })
    
    console.log(`\nFound ${signups.length} signups:\n`)
    
    signups.forEach(signup => {
      console.log(`Signup ID: ${signup.id}`)
      console.log(`  Golfer ID: "${signup.golferId}"`)
      console.log(`  Golfer ID length: ${signup.golferId.length}`)
      console.log(`  Golfer name: ${signup.golfer?.firstName} ${signup.golfer?.lastInitial}`)
      console.log(`  Date: ${signup.date.toISOString()}`)
      console.log('')
    })
    
    // Check for any ID mismatches
    console.log('\n=== Checking for ID inconsistencies ===\n')
    
    const golferIds = new Set(golfers.map(g => g.id))
    const signupGolferIds = new Set(signups.map(s => s.golferId))
    
    signupGolferIds.forEach(id => {
      if (!golferIds.has(id)) {
        console.log(`WARNING: Signup has golferId "${id}" but no matching golfer found!`)
      }
    })
    
    // Show a sample comparison
    if (golfers.length > 0 && signups.length > 0) {
      const firstGolfer = golfers[0]
      const firstSignup = signups[0]
      
      console.log('\n=== Sample comparison ===')
      console.log(`First golfer ID: "${firstGolfer.id}"`)
      console.log(`First signup golfer ID: "${firstSignup.golferId}"`)
      console.log(`IDs match: ${firstGolfer.id === firstSignup.golferId}`)
      console.log(`IDs match (trimmed): ${firstGolfer.id.trim() === firstSignup.golferId.trim()}`)
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugGolferSignups() 