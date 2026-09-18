import { expect, test } from '@playwright/test';

test('the web app loads and shows the Explorer', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Explorer' })).toBeVisible();
});

test('the grid renders the row name and average placement', async ({ page }) => {
  await page.goto('/');

  // Scoped to the Explorer table specifically — a page-wide row search can collide with a
  // same-named row in another table (see the reference-tables test below for a real example).
  const row = page.getByRole('table', { name: 'Explorer' }).getByRole('row', { name: /Jinx/ });
  await expect(row).toContainText('Jinx');
  await expect(row).toContainText('4.5');
});

test('the static reference tables render real units, items and traits from the CDragon mock', async ({
  page,
}) => {
  await page.goto('/');

  const unitRow = page.getByRole('table', { name: 'Units' }).getByRole('row', { name: /Gromp/ });
  await expect(unitRow).toContainText('Gromp');
  await expect(unitRow).toContainText('2');

  // Not asserting a specific item row here: this real dataset has ~280 item names shared by
  // 2+ entries (Radiant/DA_-prefixed variants), so a role-name match is genuinely fragile no
  // matter which name is picked. The capped count is deterministic and proves the same thing —
  // real data fetched, list rendered — without depending on which 30 of 769 happen to show.
  await expect(page.getByText('Showing 30 of 769 items')).toBeVisible();

  // Real-data gotcha: a unit is actually named "Lux (Elderwood)", so an unscoped row search
  // for /Elderwood/ matches both this trait row and that unit row — scoping to the Traits
  // table specifically is what makes this deterministic, not incidental.
  const traitRow = page
    .getByRole('table', { name: 'Traits' })
    .getByRole('row', { name: /Elderwood/ });
  await expect(traitRow).toContainText('3');
});
