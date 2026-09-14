import { expect, test } from '@playwright/test'
import { canvas, drawNote, noteRect, notes, resetApp } from './helpers'

test.beforeEach(async ({ page }) => {
  await resetApp(page)
})

test('shows an empty state when there are no notes', async ({ page }) => {
  await expect(page.getByText('No notes yet')).toBeVisible()
})

test('drawing a rectangle creates a note of that position and size', async ({ page }) => {
  await drawNote(page, 100, 120, 340, 300)

  await expect(notes(page)).toHaveCount(1)
  const rect = await noteRect(notes(page).first())
  expect(rect.x).toBeCloseTo(100, -1)
  expect(rect.y).toBeCloseTo(120, -1)
  expect(rect.width).toBeCloseTo(240, -1)
  expect(rect.height).toBeCloseTo(180, -1)
  await expect(page.getByText('No notes yet')).toBeHidden()
})

test('clicking on empty canvas creates a default-size note at that point', async ({ page }) => {
  const box = await canvas(page).boundingBox()
  if (!box) throw new Error('no canvas box')
  await page.mouse.click(box.x + 400, box.y + 300)

  await expect(notes(page)).toHaveCount(1)
  const rect = await noteRect(notes(page).first())
  // Default 200x200 centered on the click point.
  expect(rect.width).toBeCloseTo(200, -1)
  expect(rect.height).toBeCloseTo(200, -1)
  expect(rect.x).toBeCloseTo(300, -1)
  expect(rect.y).toBeCloseTo(200, -1)
})

test('a click-created note is immediately focused and typeable', async ({ page }) => {
  const box = await canvas(page).boundingBox()
  if (!box) throw new Error('no canvas box')
  await page.mouse.click(box.x + 400, box.y + 300)

  // No double-click needed — the textarea is already focused.
  const textarea = page.getByTestId('note-textarea')
  await expect(textarea).toBeFocused()
  await page.keyboard.type('Instant note')
  await textarea.press('ControlOrMeta+Enter')
  await expect(page.getByTestId('note-text')).toHaveText('Instant note')
})

test('a drawn note is immediately focused and typeable', async ({ page }) => {
  await drawNote(page, 120, 130, 380, 340)

  const textarea = page.getByTestId('note-textarea')
  await expect(textarea).toBeFocused()
  await page.keyboard.type('Drawn and typed')
  await textarea.press('ControlOrMeta+Enter')
  await expect(page.getByTestId('note-text')).toHaveText('Drawn and typed')
})
