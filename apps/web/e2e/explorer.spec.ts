import { expect, test } from '@playwright/test';

test('the web app loads and shows the Explorer', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Explorer' })).toBeVisible();
});

test('the grid renders the row name and average placement', async ({ page }) => {
  await page.goto('/');

  const row = page.getByRole('row', { name: /Jinx/ });
  await expect(row).toContainText('Jinx');
  await expect(row).toContainText('4.5');
});
