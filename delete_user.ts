import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = 'vamshivision01@gmail.com'
  console.log(`Looking for user with email: ${email}`)
  
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    console.log('User not found.')
    return
  }

  console.log(`Found user: ${user.id} (${user.name})`)
  console.log('Attempting to delete...')

  try {
      // Due to relation constraints that might not cascade (e.g. Transactions if any),
      // we might face errors. But standard relations like Items/Bookings are cascaded.
      // If transactions exist, we might need to handle them. 
      // For now, we attempt direct delete.
      
      const deletedUser = await prisma.user.delete({
        where: { id: user.id },
      })
      console.log('User deleted successfully:', deletedUser.email)
  } catch (error) {
      console.error('Error deleting user:', error)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
