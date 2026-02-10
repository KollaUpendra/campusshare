
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Starting Antigravity Stress Test...");

    try {
        // 1. Domain Bypass / Auth Check (Simulation)
        const evilUser = await prisma.user.create({
            data: {
                email: "hacker@evil.com",
                name: "Evil Hacker",
                role: "student"
            }
        });

        console.log(`[TEST 1] Domain Bypass Check: Created user with email ${evilUser.email}. Checks if DB enforces domain.`);
        if (evilUser.email && !evilUser.email.endsWith("@yourcollege.edu")) {
            console.log(" -> VULNERABLE: Database and Schema allow external emails. Auth logic handles this, but data layer is open.");
        } else {
            console.log(" -> SECURE.");
        }

        // Clean up user
        await prisma.user.delete({ where: { id: evilUser.id } });

        // 2. Ghost Item Test (Data Integrity)
        const ghostUser = await prisma.user.create({
            data: {
                email: "ghost@users.com",
                name: "GhostUser",
                role: "student"
            }
        });

        const ghostItem = await prisma.item.create({
            data: {
                title: "Ghost Item",
                description: "Will I survive?",
                price: 50,
                ownerId: ghostUser.id
            }
        });

        console.log(`[TEST 2] Ghost Item Check: user deleted -> item deleted?`);
        await prisma.user.delete({ where: { id: ghostUser.id } });

        const checkItem = await prisma.item.findUnique({ where: { id: ghostItem.id } });
        if (!checkItem) {
            console.log(" -> SECURE: Item was deleted with User (Cascade).");
        } else {
            console.log(" -> VULNERABLE: Item still exists (Orphaned Data).");
            // weak cleanup if it persisted
            await prisma.item.delete({ where: { id: ghostItem.id } });
        }

        // 3. High Volume / Long String Test
        // Simulating API payload which reaches database
        const longString = "A".repeat(600);
        const stressUser = await prisma.user.create({ data: { email: "stress@test.com", name: "Stress" } });

        try {
            const item = await prisma.item.create({
                data: {
                    title: longString,
                    description: "Test Description",
                    price: 10,
                    ownerId: stressUser.id
                }
            });
            console.log(`[TEST 3] Long String Check: Created item title len ${item.title.length}.`);
            if (item.title.length > 500) {
                console.log(" -> VULNERABLE: No length limit on title.");
            }
            await prisma.item.delete({ where: { id: item.id } });
        } catch (e) {
            console.log(" -> SECURE: Database rejected long string (unlikely for Postgres Text).");
        }
        await prisma.user.delete({ where: { id: stressUser.id } });

    } catch (err) {
        console.error("Test Error:", err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
