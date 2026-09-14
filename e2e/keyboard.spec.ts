import { expect, test } from '@playwright/test'
import { drawNote, noteRect, notes, resetApp } from './helpers'

test.beforeEach(async ({ page }) => {
  await resetApp(page)
})

test('arrow keys move a focused note', async ({ page }) => {
  await drawNote(page, 200, 200, 400, 380)
  const note = notes(page).first()
  const before = await noteRect(note)

  await note.getByTestId('note-drag-handle').focus()
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowDown')

  const after = await noteRect(note)
  expect(after.x).toBeGreaterThan(before.x)
  expect(after.y).toBeGreaterThan(before.y)
  expect(after.width).toBeCloseTo(before.width, -1)
})

test('Alt+arrow keys resize a focused note', async ({ page }) => {
  await drawNote(page, 200, 200, 400, 380)
  const note = notes(page).first()
  const before = await noteRect(note)

  await note.getByTestId('note-drag-handle').focus()
  await page.keyboard.press('Alt+ArrowRight')
  await page.keyboard.press('Alt+ArrowDown')

  const after = await noteRect(note)
  expect(after.width).toBeGreaterThan(before.width)
  expect(after.height).toBeGreaterThan(before.height)
})

test('Delete key removes a focused note', async ({ page }) => {
  await drawNote(page, 200, 200, 400, 380)
  await expect(notes(page)).toHaveCount(1)

  await notes(page).first().getByTestId('note-drag-handle').focus()
  await page.keyboard.press('Delete')

  await expect(notes(page)).toHaveCount(0)
})
