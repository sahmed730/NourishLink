import { test, expect } from '@playwright/test';

test('landing page loads and contains main CTA', async ({ page }) => {
  await page.goto('/');

  // Expect title to contain the app name or related keywords (if any)
  // But let's check for specific text on the landing page
  await expect(page.locator('h1')).toContainText(/Rescue Food|Feed Communities/i);

  // Check that Get Started link exists
  const getStartedLink = page.getByRole('link', { name: /Get Started/i });
  await expect(getStartedLink).toBeVisible();

  // Click and expect navigation to /register
  await getStartedLink.click();
  await expect(page).toHaveURL(/.*\/register/);
});
