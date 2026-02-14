
import { test, expect } from '@playwright/test';
import { createTestUser, loginUser, cleanupTestData } from './test-utils';

test.describe('Item Management Lifecycle', () => {
    let owner: any;
    const timestamp = Date.now();
    const itemTitle = `Test Item ${timestamp}`;
    const updatedTitle = `Updated Item ${timestamp}`;

    test.beforeAll(async () => {
        // 1. Setup Data - Create Owner
        owner = await createTestUser('student');
    });

    test.afterAll(async () => {
        // Cleanup User (Items cascade delete usually, or we can rely on DB cleanup)
        // We will try to clean up user, if items exist they might block delete if no cascade.
        // But in this test we delete the item as part of the test.
        // If test fails, cleanup might need to delete item explicitly.
        // For now, just cleanup user.
        await cleanupTestData([owner.user.id], []);
    });

    test('User can create, edit, and delete an item', async ({ page }) => {
        try {
            // 1. Login
            await loginUser(page, owner.user);

            // 2. Create Item
            console.log('Navigating to Post Item...');
            await page.goto('/post-item');

            console.log('Filling Create Form...');
            await page.fill('input[name="title"]', itemTitle);
            await page.fill('textarea[name="description"]', 'A description for the test item.');
            await page.fill('input[name="price"]', '25');

            // Select Days
            await page.click('button:has-text("Mon")');
            await page.click('button:has-text("Wed")');

            console.log('Submitting Create Form...');
            await page.click('button:has-text("List Item")');

            // Verify Redirect to Home
            await expect(page).toHaveURL('/');

            // Verify Item in Feed
            console.log('Verifying Item in Feed...');
            await expect(page.locator(`text=${itemTitle}`)).toBeVisible();

            // 3. View Item
            console.log('Viewing Item Details...');
            // Find the card and click view
            await page.locator('.rounded-xl', { hasText: itemTitle }).getByRole('link', { name: 'View Details' }).click();

            // Verify URL
            await expect(page).toHaveURL(/\/items\//);
            const itemId = page.url().split('/').pop();
            console.log(`Item ID: ${itemId}`);

            // 4. Edit Item
            console.log('Navigating to Edit...');
            const editButton = page.getByRole('button', { name: 'Edit Item' }); // It's a button in EditItemActions
            await expect(editButton).toBeVisible();
            await editButton.click();

            // Verify Edit URL
            await expect(page).toHaveURL(/\/edit$/);

            console.log('Updating Item...');
            await page.fill('input[name="title"]', updatedTitle);
            // Deselect Mon, Select Fri
            await page.click('button:has-text("Mon")');
            await page.click('button:has-text("Fri")');

            await page.click('button:has-text("Update Item")');

            // Verify Redirect to Item Details
            await expect(page).toHaveURL(new RegExp(`/items/${itemId}$`));

            // Verify Updated Data
            await expect(page.locator(`h1:has-text("${updatedTitle}")`)).toBeVisible();
            await expect(page.getByText("Friday")).toBeVisible(); // Check badge match full day name

            // 5. Delete Item
            console.log('Deleting Item...');
            const deleteButton = page.locator('button:has(.lucide-trash-2)'); // Button with Trash icon

            // Setup Dialog
            page.on('dialog', dialog => dialog.accept());

            await deleteButton.click();

            // Verify Redirect to Home
            await expect(page).toHaveURL('/');

            // Verify Item Gone
            console.log('Verifying Item Deleted...');
            await expect(page.locator(`text=${updatedTitle}`)).not.toBeVisible();

        } catch (error) {
            console.error('Test Failed:', error);
            const fs = require('fs');
            fs.appendFileSync('test-failure.log', `Test Failed: ${error}\n`);
            throw error;
        }
    });
});
