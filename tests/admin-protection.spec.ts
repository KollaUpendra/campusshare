
import { test, expect } from '@playwright/test';
import { createTestUser, loginUser, cleanupTestData } from './test-utils';

test.describe('Security Guard: Admin Protection', () => {
    let student: { user: { id: string; email: string | null; role: string;[key: string]: unknown } };
    let admin: { user: { id: string; email: string | null; role: string;[key: string]: unknown } };

    test.beforeAll(async () => {
        student = await createTestUser('student');
        admin = await createTestUser('admin');
    });

    test.afterAll(async () => {
        await cleanupTestData([student.user.id, admin.user.id], []);
    });

    test('Student cannot access admin dashboard', async ({ page }) => {
        // Login as Student
        await loginUser(page, student.user);

        // Attempt to go to Admin Dashboard
        await page.goto('/admin/dashboard');

        // Verify Redirection or Access Denied
        // Middleware redirects to '/' if not admin.
        // Or shows 403.
        // Let's check for redirection to home.
        await expect(page).toHaveURL('http://localhost:3000/');
        // Or check for a "Access Denied" message if it doesn't redirect.
    });

    test('Admin can access admin dashboard', async ({ page }) => {
        // Login as Admin
        await loginUser(page, admin.user);

        // Attempt to go to Admin Dashboard
        await page.goto('/admin/dashboard');

        // Verify Success (URL stays, or check content)
        await expect(page).toHaveURL(/\/admin\/dashboard/);
        // await expect(page.locator('h1')).toHaveText(/Admin Dashboard/i);
    });
});
