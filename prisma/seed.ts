import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')
  
  // Create sample golfers
  const golfers = [
    { firstName: 'John', lastInitial: 'S' },
    { firstName: 'Mary', lastInitial: 'J' },
    { firstName: 'Robert', lastInitial: 'D' },
    { firstName: 'Sarah', lastInitial: 'W' },
    { firstName: 'Michael', lastInitial: 'B' },
  ]
  
  for (const golfer of golfers) {
    await prisma.golfer.upsert({
      where: {
        firstName_lastInitial: {
          firstName: golfer.firstName,
          lastInitial: golfer.lastInitial,
        },
      },
      update: {},
      create: golfer,
    })
    console.log(`Created golfer: ${golfer.firstName} ${golfer.lastInitial}`)
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