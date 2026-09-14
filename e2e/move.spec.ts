import { expect, test } from '@playwright/test'
import { dragNoteBy, dragNoteTo, drawNote, noteRect, notes, resetApp } from './helpers'

test.beforeEach(async ({ page }) => {
  await resetApp(page)
})

test('dragging a note by its handle moves it', async ({ page }) => {
  await drawNote(page, 100, 100, 300, 260)
  const note = notes(page).first()
  const before = await noteRect(note)

  await dragNoteBy(page, note, 250, 180)

  const after = await noteRect(note)
  expect(after.x).toBeCloseTo(before.x + 250, -1)
  expect(after.y).toBeCloseTo(before.y + 180, -1)
  // Size is unchanged by a move.
  expect(after.width).toBeCloseTo(before.width, -1)
  expect(after.height).toBeCloseTo(before.height, -1)
})

test('a note cannot be dropped outside the canvas bounds', async ({ page }) => {
  await drawNote(page, 100, 100, 300, 260)
  const note = notes(page).first()

  // Drag far past the top-left corner.
  await dragNoteTo(page, note, -400, -400)

  const after = await noteRect(note)
  expect(after.x).toBeGreaterThanOrEqual(0)
  expect(after.y).toBeGreaterThanOrEqual(0)
})
