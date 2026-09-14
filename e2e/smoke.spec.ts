import { expect, test } from '@playwright/test'

test('app loads and renders the canvas', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /sticky notes/i })).toBeVisible()
  await expect(page.getByTestId('canvas')).toBeVisible()
})
