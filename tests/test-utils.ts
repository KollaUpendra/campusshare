import { Page } from '@playwright/test';
import db from '../src/lib/db';

export const createTestUser = async (role: string = 'student') => {
    const email = `test-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`;

    const user = await db.user.create({
        data: {
            email,
            name: 'Test User',
            role,
            image: 'https://github.com/shadcn.png',

        },
    });

    // We no longer create a session in DB because we use JWT strategy.
    return { user };
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

export const loginUser = async (page: Page, user: { id: string, email: string | null, role: string }) => {
    const baseURL = 'http://localhost:3000';

    // 1. Get CSRF Token
    const csrfRes = await page.request.get(`${baseURL}/api/auth/csrf`);
    const csrfJson = await csrfRes.json();
    const { csrfToken } = csrfJson;

    // 2. Perform Login via Credentials Provider

    const loginRes = await page.request.post(`${baseURL}/api/auth/callback/credentials`, {
        form: {
            csrfToken,
            email: user.email || '',
            id: user.id,
            role: user.role,
            redirect: 'false',
            json: 'true',
        },
    });

    const loginText = await loginRes.text();

    if (!loginRes.ok()) {
        throw new Error(`Login failed: ${loginRes.status()} ${loginText}`);
    }

    // 3. Refresh the page to pick up the session? 
    // Usually not needed if cookies are set, but let's reload if we are already on a page.
    // Or just let the test navigate.
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
