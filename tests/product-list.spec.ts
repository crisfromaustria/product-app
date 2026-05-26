import { test, expect } from '@playwright/test';

const PRODUCT_1_ID = '00000000-0000-0000-0000-000000000001';

test.beforeEach(async ({ page }) => {
  console.log('beforeEach: starting');
  const productsLoaded = page.waitForResponse(
    r => r.url().includes('localhost:8081/products') && r.request().method() === 'GET'
  );
  await page.goto('/products');
  await productsLoaded;
  console.log('beforeEach: done');
});

test('should display all products in the list', async ({ page }) => {
  console.log('Testing product list display');
  await expect(page.getByText('Product 1')).toBeVisible();
  await expect(page.getByText('Product 2')).toBeVisible();
  await expect(page.getByText('Product 3')).toBeVisible();
});

test('should display product prices', async ({ page }) => {
  await expect(page.locator('table').getByText('10')).toBeVisible();
  await expect(page.locator('table').getByText('20')).toBeVisible();
});

test('should show New Product button', async ({ page }) => {
  await expect(page.locator('button').filter({ hasText: 'New' })).toBeVisible();
});

test('should navigate to product form when New Product is clicked', async ({ page }) => {
  await page.getByRole('button', { name: /New/i }).click();
  await expect(page).toHaveURL(/\/products\/new/);
  await expect(page.getByRole('button', { name: /Save/i })).toBeVisible();
});

test('should navigate to edit form when edit button is clicked', async ({ page }) => {
  await page.locator('button[mat-icon-button]').first().click();
  await expect(page).toHaveURL(/\/products\/[0-9a-f-]+\/edit/);
});

test('should show delete confirmation dialog when delete is clicked', async ({ page }) => {
  await page.locator('button[color="warn"]').first().click();
  await expect(page.getByText('Delete Product')).toBeVisible();
  await expect(page.getByText(/Are you sure you want to delete "Product 1"/)).toBeVisible();
});

test('should remove product from list after confirming delete', async ({ page }) => {
  // Mock only the DELETE call to prevent permanent data deletion on the real backend
  await page.route(`http://localhost:8081/products/${PRODUCT_1_ID}`, route => {
    if (route.request().method() === 'DELETE') {
      route.fulfill({ status: 204 });
    } else {
      route.continue();
    }
  });

  await page.locator('button[color="warn"]').first().click();
  await page.getByRole('button', { name: /Delete/i }).click();
  await expect(page.locator('mat-dialog-container')).not.toBeVisible();
  await expect(page.locator('table').getByText('Product 1')).not.toBeVisible();
  await expect(page.locator('table').getByText('Product 2')).toBeVisible();
});

test('should keep product in list when delete is cancelled', async ({ page }) => {
  await page.locator('button[color="warn"]').first().click();
  await page.getByRole('button', { name: /Cancel/i }).click();
  await expect(page.locator('mat-dialog-container')).not.toBeVisible();
  await expect(page.locator('table').getByText('Product 1')).toBeVisible();
  await expect(page.locator('table').getByText('Product 2')).toBeVisible();
});
