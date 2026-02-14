import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding...')

    // 1. Create a User
    const user = await prisma.user.upsert({
        where: { email: 'demo@example.com' },
        update: {},
        create: {
            email: 'demo@example.com',
            name: 'Demo Student',
            role: 'student',
            items: {
                create: [
                    {
                        title: 'Scientific Calculator',
                        description: 'Casio FX-991EX ClassWiz, barely used.',
                        price: 5.00,
                        status: 'active',
                        availability: {
                            create: [
                                { dayOfWeek: 'Monday' },
                                { dayOfWeek: 'Wednesday' }
                            ]
                        }
                    },
                    {
                        title: 'Lab Coat (Size M)',
                        description: 'Standard white lab coat, clean condition.',
                        price: 10.00,
                        status: 'active',
                        availability: {
                            create: [
                                { dayOfWeek: 'Tuesday' },
                                { dayOfWeek: 'Thursday' }
                            ]
                        }
                    },
                ],
            },
        },
    })

    console.log(`Created user with id: ${user.id}`)
    console.log(`Seeding finished.`)
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
