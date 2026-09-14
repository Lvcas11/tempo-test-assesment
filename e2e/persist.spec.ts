import { expect, test } from '@playwright/test'
import { drawNote, noteRect, notes, resetApp } from './helpers'

test.beforeEach(async ({ page }) => {
  await resetApp(page)
})

test('notes are restored after a page reload', async ({ page }) => {
  await drawNote(page, 140, 140, 380, 340)
  const note = notes(page).first()

  // Edit text and color so we can assert full fidelity on restore.
  await note.dblclick()
  const textarea = page.getByTestId('note-textarea')
  await textarea.fill('Persisted note')
  await textarea.press('ControlOrMeta+Enter')

  await note.hover()
  await note.getByTestId('note-color-toggle').click()
  await note.getByTestId('color-blue').click()

  const before = await noteRect(note)

  // Give the debounced persistence time to flush, then reload.
  await page.waitForTimeout(500)
  await page.reload()

  // After reload the note is restored (loading state resolves first).
  await expect(notes(page)).toHaveCount(1)
  const restored = notes(page).first()
  await expect(page.getByTestId('note-text')).toHaveText('Persisted note')
  await expect(restored).toHaveClass(/bg-note-blue/)

  const after = await noteRect(restored)
  expect(after.x).toBeCloseTo(before.x, -1)
  expect(after.y).toBeCloseTo(before.y, -1)
  expect(after.width).toBeCloseTo(before.width, -1)
  expect(after.height).toBeCloseTo(before.height, -1)
})

test('an empty canvas stays empty after reload', async ({ page }) => {
  await expect(page.getByText('No notes yet')).toBeVisible()
  await page.waitForTimeout(300)
  await page.reload()
  await expect(page.getByText('No notes yet')).toBeVisible()
})
