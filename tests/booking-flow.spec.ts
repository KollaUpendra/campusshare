
import { test, expect } from '@playwright/test';
import { createTestUser, createTestItem, loginUser, cleanupTestData } from './test-utils';

test.describe('Critical Path: Booking Flow', () => {
    let borrower: { user: { id: string; email: string | null; role: string;[key: string]: unknown } };
    let owner: { user: { id: string; email: string | null; role: string;[key: string]: unknown } };
    let item: { id: string; title: string;[key: string]: unknown };

    test.beforeAll(async () => {
        // 1. Setup Data
        owner = await createTestUser('student');
        borrower = await createTestUser('student'); // Borrower is also a student
        item = await createTestItem(owner.user.id);
    });

    test.afterAll(async () => {
        // Cleanup
        await cleanupTestData([owner.user.id, borrower.user.id], [item.id]);
    });

    test('User can browse, view item, and request it', async ({ page }) => {
        // 2. Login as Borrower
        await loginUser(page, borrower.user);

        // 3. Go to Home Page
        await page.goto('/');

        // 5. Find Item in Feed
        await page.fill('input[placeholder="Search items..."]', item.title);
        await page.click('button:has-text("Search")');

        // Wait for item
        await expect(page.locator(`text=${item.title}`)).toBeVisible();

        // 6. Click on Item
        await page.locator('.rounded-xl', { hasText: item.title }).getByRole('link', { name: 'View Details' }).click();

        // 7. Verify Navigation
        await expect(page).toHaveURL(new RegExp(`/items/${item.id}`));

        // 8. Find valid date (Monday or Tuesday)
        const getNextValidDate = () => {
            const d = new Date();
            while (d.getDay() !== 1 && d.getDay() !== 2) { // 1=Monday, 2=Tuesday
                d.setDate(d.getDate() + 1);
            }
            return d.toISOString().split('T')[0];
        };
        const validDate = getNextValidDate();

        // 9. Request Item
        await page.getByRole('button', { name: /Request|Book/i }).click();

        // 10. Fill Date (inside Popover)
        await page.locator('input[type="date"]').fill(validDate);

        // 11. Find Confirm Button
        const confirmButton = page.getByRole('button', { name: 'Confirm Request' });
        await expect(confirmButton).toBeEnabled();

        // 12. Setup Dialog Handler BEFORE clicking
        const dialogPromise = page.waitForEvent('dialog');

        // 13. Confirm
        await confirmButton.click();

        // 14. Verify Dialog
        const dialog = await dialogPromise;
        expect(dialog.message()).toContain('Request sent successfully!');
        await dialog.accept();
    });
});
