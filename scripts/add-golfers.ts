import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const golfers = [
  { firstName: 'John', lastInitial: 'S', mobileNumber: '(555) 123-4567' },
  { firstName: 'Mary', lastInitial: 'J', mobileNumber: '(555) 234-5678' },
  { firstName: 'Robert', lastInitial: 'D', mobileNumber: '(555) 345-6789' },
  { firstName: 'Sarah', lastInitial: 'W', mobileNumber: '(555) 456-7890' },
  { firstName: 'Michael', lastInitial: 'B', mobileNumber: '(555) 567-8901' },
  { firstName: 'David', lastInitial: 'L', mobileNumber: '(555) 678-9012' },
  { firstName: 'Jennifer', lastInitial: 'M', mobileNumber: '(555) 789-0123' },
  { firstName: 'James', lastInitial: 'T', mobileNumber: '(555) 890-1234' }
]

async function main() {
  console.log('Adding golfers...')
  
  for (const golfer of golfers) {
    try {
      const created = await prisma.golfer.create({
        data: golfer
      })
      console.log(`✓ Added ${created.firstName} ${created.lastInitial}`)
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`- ${golfer.firstName} ${golfer.lastInitial} already exists`)
      } else {
        console.error(`✗ Error adding ${golfer.firstName} ${golfer.lastInitial}:`, error.message)
      }
    }
  }
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