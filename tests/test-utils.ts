import { Page } from '@playwright/test';
import db from '../src/lib/db'; // Relative import to avoid alias issues if not configured perfectly
import { User, Item } from '@prisma/client';

export const createTestUser = async (role: string = 'student') => {
    const email = `test-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`;

    const user = await db.user.create({
        data: {
            email,
            name: 'Test User',
            role,
            image: 'https://github.com/shadcn.png',
            emailVerified: new Date(),
        },
    });

    // Create a session for this user to simulate login
    const sessionToken = `test-session-${user.id}`;
    const expires = new Date();
    expires.setDate(expires.getDate() + 1); // Expires in 1 day

    await db.session.create({
        data: {
            sessionToken,
            userId: user.id,
            expires,
        },
    });

    return { user, sessionToken };
};

export const createTestItem = async (ownerId: string) => {
    const item = await db.item.create({
        data: {
            title: `Test Item ${Date.now()}`,
            description: 'A test item for booking flow.',
            price: 10,
            status: 'active',
            ownerId,
            availability: {
                create: [
                    { dayOfWeek: "Monday" },
                    { dayOfWeek: "Tuesday" },
                ]
            }
        },
    });
    return item;
};

export const loginUser = async (page: Page, sessionToken: string) => {
    // Set the session cookie. Name depends on environment (secure vs non-secure)
    // In dev (http), it's next-auth.session-token
    // We set both just in case, or check strictness.
    // For localhost, next-auth.session-token is standard.

    await page.context().addCookies([
        {
            name: 'next-auth.session-token',
            value: sessionToken,
            domain: 'localhost',
            path: '/',
            httpOnly: true,
            sameSite: 'Lax',
            expires: Date.now() / 1000 + 86400,
        },
    ]);
};

export const cleanupTestData = async (userIds: string[], itemIds: string[]) => {
    if (itemIds.length > 0) {
        await db.item.deleteMany({
            where: { id: { in: itemIds } },
        });
    }
    if (userIds.length > 0) {
        await db.user.deleteMany({
            where: { id: { in: userIds } },
        });
    }
};
