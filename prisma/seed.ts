import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')
  
  // Create 8 dummy golfers with mobile numbers
  const golfers = [
    { firstName: 'John', lastInitial: 'S', mobileNumber: '(555) 123-4567' },
    { firstName: 'Mary', lastInitial: 'J', mobileNumber: '(555) 234-5678' },
    { firstName: 'Robert', lastInitial: 'D', mobileNumber: '(555) 345-6789' },
    { firstName: 'Sarah', lastInitial: 'W', mobileNumber: '(555) 456-7890' },
    { firstName: 'Michael', lastInitial: 'B', mobileNumber: '(555) 567-8901' },
    { firstName: 'David', lastInitial: 'L', mobileNumber: '(555) 678-9012' },
    { firstName: 'Jennifer', lastInitial: 'M', mobileNumber: '(555) 789-0123' },
    { firstName: 'James', lastInitial: 'T', mobileNumber: '(555) 890-1234' },
  ]
  
  // Create or update golfers
  for (const golfer of golfers) {
    await prisma.golfer.upsert({
      where: {
        firstName_lastInitial: {
          firstName: golfer.firstName,
          lastInitial: golfer.lastInitial
        }
      },
      update: {
        mobileNumber: golfer.mobileNumber
      },
      create: golfer,
    })
    console.log(`Created/Updated golfer: ${golfer.firstName} ${golfer.lastInitial} - ${golfer.mobileNumber}`)
  }
  
  console.log('Seeding completed!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  }) 