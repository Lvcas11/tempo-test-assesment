import { expect, test } from '@playwright/test'
import { drawNote, notes, resetApp } from './helpers'

test.beforeEach(async ({ page }) => {
  await resetApp(page)
})

test('double-clicking a note lets you type text that persists', async ({ page }) => {
  await drawNote(page, 150, 150, 380, 340)
  const note = notes(page).first()

  await note.dblclick()
  const textarea = page.getByTestId('note-textarea')
  await expect(textarea).toBeFocused()
  await textarea.fill('Buy milk')
  // Commit with Cmd/Ctrl+Enter.
  await textarea.press('ControlOrMeta+Enter')

  await expect(page.getByTestId('note-text')).toHaveText('Buy milk')
})

test('Escape cancels editing without committing', async ({ page }) => {
  await drawNote(page, 150, 150, 380, 340)
  const note = notes(page).first()

  await note.dblclick()
  const textarea = page.getByTestId('note-textarea')
  await textarea.fill('discard me')
  await textarea.press('Escape')

  await expect(page.getByTestId('note-text')).not.toHaveText('discard me')
})
