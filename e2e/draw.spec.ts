import { expect, test, type Locator, type Page } from '@playwright/test'
import { drawNote, notes, resetApp } from './helpers'

test.beforeEach(async ({ page }) => {
  await resetApp(page)
})

test('the pen toggle reflects draw/write mode via aria-pressed', async ({ page }) => {
  await drawNote(page, 150, 150, 420, 400)
  const note = notes(page).first()
  await note.hover()
  const pen = note.getByTestId('note-pen')

  await expect(pen).toHaveAttribute('aria-pressed', 'false')
  await pen.click()
  await expect(pen).toHaveAttribute('aria-pressed', 'true') // draw mode
  await pen.click()
  await expect(pen).toHaveAttribute('aria-pressed', 'false') // back to write mode
})

test('pen mode lets you draw a stroke that is saved and restored', async ({ page }) => {
  await drawNote(page, 150, 150, 420, 400)
  const note = notes(page).first()

  await note.hover()
  await note.getByTestId('note-pen').click()

  // Draw a small squiggle inside the note body.
  const layer = note.getByTestId('drawing-layer')
  const box = await layer.boundingBox()
  if (!box) throw new Error('no drawing layer box')
  await page.mouse.move(box.x + 40, box.y + 40)
  await page.mouse.down()
  await page.mouse.move(box.x + 90, box.y + 70, { steps: 6 })
  await page.mouse.move(box.x + 140, box.y + 50, { steps: 6 })
  await page.mouse.up()

  // A path was committed.
  await expect(note.locator('svg[data-testid="drawing-layer"] path')).toHaveCount(1)

  // Survives reload.
  await page.waitForTimeout(500)
  await page.reload()
  await expect(notes(page).first().locator('svg[data-testid="drawing-layer"] path')).toHaveCount(1)
})

test('drawing does not move the note', async ({ page }) => {
  await drawNote(page, 150, 150, 420, 400)
  const note = notes(page).first()
  const beforeBox = await note.boundingBox()

  await note.hover()
  await note.getByTestId('note-pen').click()

  const layer = note.getByTestId('drawing-layer')
  const box = await layer.boundingBox()
  if (!box) throw new Error('no layer box')
  await page.mouse.move(box.x + 40, box.y + 40)
  await page.mouse.down()
  await page.mouse.move(box.x + 120, box.y + 90, { steps: 8 })
  await page.mouse.up()

  const afterBox = await note.boundingBox()
  expect(afterBox?.x).toBeCloseTo(beforeBox?.x ?? 0, 0)
  expect(afterBox?.y).toBeCloseTo(beforeBox?.y ?? 0, 0)
})

async function drawSquiggle(page: Page, note: Locator) {
  const box = await note.getByTestId('drawing-layer').boundingBox()
  if (!box) throw new Error('no drawing layer box')
  await page.mouse.move(box.x + 40, box.y + 40)
  await page.mouse.down()
  await page.mouse.move(box.x + 90, box.y + 70, { steps: 6 })
  await page.mouse.move(box.x + 140, box.y + 50, { steps: 6 })
  await page.mouse.up()
}

test('a note can hold BOTH text and a drawing at once', async ({ page }) => {
  await drawNote(page, 150, 150, 460, 440)
  const note = notes(page).first()

  // Add text first.
  const textarea = page.getByTestId('note-textarea')
  await expect(textarea).toBeFocused()
  await page.keyboard.type('Meeting notes')
  await textarea.press('ControlOrMeta+Enter')
  await expect(page.getByTestId('note-text')).toHaveText('Meeting notes')

  // Then draw on the same note.
  await note.getByTestId('note-pen').click()
  await drawSquiggle(page, note)

  // Both coexist: one stroke AND the text.
  await expect(note.locator('svg[data-testid="drawing-layer"] path')).toHaveCount(1)
  await expect(page.getByTestId('note-text')).toHaveText('Meeting notes')

  // And both survive a reload.
  await page.waitForTimeout(500)
  await page.reload()
  const restored = notes(page).first()
  await expect(page.getByTestId('note-text')).toHaveText('Meeting notes')
  await expect(restored.locator('svg[data-testid="drawing-layer"] path')).toHaveCount(1)
})

test('a stroke rescales when the note is resized', async ({ page }) => {
  await drawNote(page, 150, 150, 450, 450)
  const note = notes(page).first()

  await note.getByTestId('note-pen').click()
  await drawSquiggle(page, note)
  await note.getByTestId('note-pen').click() // back to write mode

  const before = await note
    .locator('svg[data-testid="drawing-layer"] path')
    .first()
    .getAttribute('d')

  // Grow via the SE handle.
  const h = note.getByTestId('resize-se')
  const hb = await h.boundingBox()
  if (!hb) throw new Error('no handle box')
  await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2)
  await page.mouse.down()
  await page.mouse.move(hb.x + 120, hb.y + 120, { steps: 8 })
  await page.mouse.up()

  const after = await note
    .locator('svg[data-testid="drawing-layer"] path')
    .first()
    .getAttribute('d')

  // The path data changed → the stroke was rescaled with the note.
  expect(after).not.toBe(before)
})
