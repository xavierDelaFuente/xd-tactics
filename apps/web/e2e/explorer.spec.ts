import { expect, test } from '@playwright/test';

test('the web app loads and shows the Explorer', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Explorer' })).toBeVisible();
});
