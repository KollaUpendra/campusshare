
import { test, expect } from '@playwright/test';
import { createTestUser, createTestItem, loginUser, cleanupTestData } from './test-utils';

test.describe('Critical Path: Booking Flow', () => {
    let borrower: { user: any, sessionToken: string };
    let owner: { user: any, sessionToken: string };
    let item: any;

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
        await loginUser(page, borrower.sessionToken);

        // 3. Go to Home Page
        await page.goto('/');

        // 4. Verify Logged In (optional, checks for avatar or profile link)
        // await expect(page.locator('text=Test User')).toBeVisible(); // Might be in a dropdown

        // 5. Find Item in Feed
        // Assuming the specific item is visible or searchable.
        // If many items, we might need to search or filter.
        // Let's filter by title to be safe.
        await page.fill('input[placeholder="Search items..."]', item.title);
        await page.click('button:has-text("Search")');

        // Wait for the item to appear
        const itemCard = page.locator(`.group:has-text("${item.title}")`).first(); // Adjust selector if needed
        // Actually, ItemCard uses Title which is unique enough here.
        await expect(page.locator(`text=${item.title}`)).toBeVisible();

        // 6. Click on Item (Navigate to Details)
        await page.click(`text=${item.title}`); // This clicks the title or card? 
        // ItemCard has a "View Details" button.
        // Let's click specifically the "View Details" button inside the card.
        // Or just click the title if it's a link. ItemCard title is NOT a link, the button is.
        // The button says "View Details".
        // We need to click "View Details" for *this* item.
        // Locator: find card with text title, then find button "View Details".
        await page.locator('.rounded-xl', { hasText: item.title }).getByRole('link', { name: 'View Details' }).click();

        // 7. Verify Navigation to Item Details
        await expect(page).toHaveURL(new RegExp(`/items/${item.id}`));

        // 8. Request Item (Booking)
        // Assuming there is a "Request" or "Book" button.
        // Since the page doesn't exist, this will fail.
        // But this is the test description.
        const requestButton = page.getByRole('button', { name: /Request|Book/i });
        await expect(requestButton).toBeVisible();
        await requestButton.click();

        // 9. Verify Success
        await expect(page.getByText(/Request Sent|Booking Confirmed/i)).toBeVisible();
    });
});
