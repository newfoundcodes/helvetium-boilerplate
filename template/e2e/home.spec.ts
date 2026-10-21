import { expect, test } from '@playwright/test';

test('home page renders the application shell', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/.+/);
  await expect(page.getByRole('heading', { name: /Build one application/ })).toBeVisible();
});

test('about navigation renders the about page', async ({ page }) => {
  await page.goto('/about');

  await expect(page).toHaveTitle(/.+/);
  await expect(page.getByRole('heading', { name: /^About$/ })).toBeVisible();
});
