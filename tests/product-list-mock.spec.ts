import { test, expect } from '@playwright/test';

const mockProducts = [
  { id: '1', name: 'Product A', price: 100 },
  { id: '2', name: 'Product B', price: 200 },
];

test.beforeEach(async ({ page }) => {
  await page.route('http://localhost:8081/products', route => {
    console.log('Intercepting request to /products');
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockProducts)
      });
    } else {
      route.continue();
    }
  });
});

test('mock should display all products in the list', async ({ page }) => {
  await page.goto('/products');
  await expect(page.getByText('Product A')).toBeVisible();
  await expect(page.getByText('Product B')).toBeVisible();
});

test('mock should display product prices', async ({ page }) => {
  await page.goto('/products');
  await expect(page.locator('table').getByText('100')).toBeVisible();
  await expect(page.locator('table').getByText('200')).toBeVisible();
});

test('mock should show New button', async ({ page }) => {
  await page.goto('/products');
  await expect(page.locator('button').filter({ hasText: 'New' })).toBeVisible();
});

test('mock should navigate to product form when New is clicked', async ({ page }) => {
  await page.goto('/products');
  await page.getByRole('button', { name: /New/i }).click();
  await expect(page).toHaveURL(/\/products\/new/);
  await expect(page.getByRole('button', { name: /Save/i })).toBeVisible();
});

test('mock should navigate to edit form when edit button is clicked', async ({ page }) => {
  await page.goto('/products');
  await page.locator('button[mat-icon-button]').first().click();
  await expect(page).toHaveURL(/\/products\/1\/edit/);
});

test('mock should show delete confirmation dialog when delete is clicked', async ({ page }) => {
  await page.goto('/products');
  await page.locator('button[color="warn"]').first().click();
  await expect(page.getByText('Delete Product')).toBeVisible();
  await expect(page.getByText(/Are you sure you want to delete "Product A"/)).toBeVisible();
});

test('mock should remove product from list after confirming delete', async ({ page }) => {
  await page.route('http://localhost:8081/products/1', route => {
    if (route.request().method() === 'DELETE') {
      route.fulfill({ status: 204 });
    } else {
      route.continue();
    }
  });

  await page.route('http://localhost:8081/products', route => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([mockProducts[1]])
      });
    } else {
      route.continue();
    }
  });

  await page.goto('/products');
  await page.locator('button[color="warn"]').first().click();
  await page.getByRole('button', { name: /Delete/i }).click();
  await expect(page.locator('mat-dialog-container')).not.toBeVisible();
  await expect(page.locator('table').getByText('Product A')).not.toBeVisible();
  await expect(page.locator('table').getByText('Product B')).toBeVisible();
});

test('mock should keep product in list when delete is cancelled', async ({ page }) => {
  await page.goto('/products');
  await page.locator('button[color="warn"]').first().click();
  await page.getByRole('button', { name: /Cancel/i }).click();
  await expect(page.locator('mat-dialog-container')).not.toBeVisible();
  await expect(page.locator('table').getByText('Product A')).toBeVisible();
  await expect(page.locator('table').getByText('Product B')).toBeVisible();
});

test('mock should show empty table when no products exist', async ({ page }) => {
  await page.route('http://localhost:8081/products', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([])
    });
  });

  await page.goto('/products');
  await expect(page.getByText('Product A')).not.toBeVisible();
  await expect(page.locator('button').filter({ hasText: 'New' })).toBeVisible();
});
