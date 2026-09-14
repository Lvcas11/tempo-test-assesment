import { expect, test } from '@playwright/test'
import { drawNote, notes, resetApp } from './helpers'

test.beforeEach(async ({ page }) => {
  await resetApp(page)
})

test('Clear all is hidden when there are no notes', async ({ page }) => {
  await expect(page.getByTestId('clear-all')).toBeHidden()
})

test('Clear all removes every note after confirmation', async ({ page }) => {
  await drawNote(page, 120, 120, 320, 280)
  await drawNote(page, 400, 160, 600, 340)
  await expect(notes(page)).toHaveCount(2)

  await page.getByTestId('clear-all').click()
  // Confirmation step.
  await expect(page.getByTestId('clear-all-confirm')).toBeVisible()
  await page.getByTestId('clear-all-confirm').click()

  await expect(notes(page)).toHaveCount(0)
  await expect(page.getByText('No notes yet')).toBeVisible()
  await expect(page.getByTestId('clear-all')).toBeHidden()
})

test('Cancelling the confirm keeps the notes', async ({ page }) => {
  await drawNote(page, 120, 120, 320, 280)
  await page.getByTestId('clear-all').click()
  await page.getByTestId('clear-all-cancel').click()
  await expect(notes(page)).toHaveCount(1)
})

test('the per-note × button still deletes a single note', async ({ page }) => {
  await drawNote(page, 120, 120, 320, 280)
  await drawNote(page, 400, 160, 600, 340)
  const first = notes(page).first()
  await first.hover()
  await first.getByTestId('note-delete').click()
  await expect(notes(page)).toHaveCount(1)
})
