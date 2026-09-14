import { expect, test } from '@playwright/test'
import { drawNote, notes, resetApp } from './helpers'

test.beforeEach(async ({ page }) => {
  await resetApp(page)
})

test('changing a note color applies the new background', async ({ page }) => {
  await drawNote(page, 150, 150, 380, 340)
  const note = notes(page).first()

  await note.hover()
  await note.getByTestId('note-color-toggle').click()
  await note.getByTestId('color-green').click()

  await expect(note).toHaveClass(/bg-note-green/)
  await expect(note).not.toHaveClass(/bg-note-yellow/)
})
