import { expect, test } from '@playwright/test'
import { canvas, drawNote, noteRect, notes, resetApp } from './helpers'

test.beforeEach(async ({ page }) => {
  await resetApp(page)
})

test('a note grows vertically to fit long text', async ({ page }) => {
  // Start from a short note.
  await drawNote(page, 150, 150, 380, 300)
  const note = notes(page).first()
  const before = await noteRect(note)

  await note.dblclick()
  const textarea = page.getByTestId('note-textarea')
  const longText = Array.from({ length: 20 }, (_, i) => `Line ${i + 1} of a long note`).join('\n')
  await textarea.fill(longText)
  await textarea.press('ControlOrMeta+Enter')

  const after = await noteRect(note)
  expect(after.height).toBeGreaterThan(before.height)
  expect(after.width).toBeCloseTo(before.width, -1)
})

test('auto-grow never makes a note taller than the canvas', async ({ page }) => {
  await drawNote(page, 150, 60, 380, 220)
  const note = notes(page).first()

  // Type an enormous amount of text.
  await note.dblclick()
  const textarea = page.getByTestId('note-textarea')
  const hugeText = Array.from({ length: 300 }, (_, i) => `Line ${i + 1}`).join('\n')
  await textarea.fill(hugeText)
  await textarea.press('ControlOrMeta+Enter')

  const canvasBox = await canvas(page).boundingBox()
  if (!canvasBox) throw new Error('no canvas box')
  const { height } = await noteRect(note)

  // The note must stay within the canvas — never overflow off-screen.
  expect(height).toBeLessThanOrEqual(canvasBox.height)
})

test('a manually resized note does not auto-grow', async ({ page }) => {
  await drawNote(page, 150, 150, 500, 480)
  const note = notes(page).first()

  // Manually resize smaller via the SE handle.
  const handle = note.getByTestId('resize-se')
  const hb = await handle.boundingBox()
  if (!hb) throw new Error('no handle box')
  await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2)
  await page.mouse.down()
  await page.mouse.move(hb.x - 150, hb.y - 150, { steps: 8 })
  await page.mouse.up()

  const afterResize = await noteRect(note)

  await note.dblclick()
  const textarea = page.getByTestId('note-textarea')
  await textarea.fill(Array.from({ length: 20 }, (_, i) => `Line ${i}`).join('\n'))
  await textarea.press('ControlOrMeta+Enter')

  const afterText = await noteRect(note)
  // Height stays as the user set it (text scrolls instead).
  expect(afterText.height).toBeCloseTo(afterResize.height, -1)
})
