import { expect, test } from '@playwright/test'
import { canvas, drawNote, notes, resetApp } from './helpers'

test.beforeEach(async ({ page }) => {
  await resetApp(page)
})

test('the delete zone is hidden until a note is dragged', async ({ page }) => {
  await drawNote(page, 150, 150, 340, 320)
  await expect(page.getByTestId('delete-zone')).toHaveAttribute('data-visible', 'false')
})

test('dragging a note onto the right-edge delete zone removes it', async ({ page }) => {
  await drawNote(page, 150, 150, 340, 320)
  await expect(notes(page)).toHaveCount(1)
  const note = notes(page).first()

  const handle = note.getByTestId('note-drag-handle')
  const hb = await handle.boundingBox()
  const canvasBox = await canvas(page).boundingBox()
  if (!hb || !canvasBox) throw new Error('missing boxes')

  await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2)
  await page.mouse.down()
  // Move toward the far right edge of the canvas.
  const target = { x: canvasBox.x + canvasBox.width - 20, y: canvasBox.y + 200 }
  await page.mouse.move(target.x, target.y, { steps: 16 })

  // Zone becomes visible and arms while hovering.
  await expect(page.getByTestId('delete-zone')).toHaveAttribute('data-visible', 'true')
  await expect(page.getByTestId('delete-zone')).toHaveAttribute('data-armed', 'true')

  await page.mouse.up()
  await expect(notes(page)).toHaveCount(0)
})

test('dropping a note away from the delete zone keeps it', async ({ page }) => {
  await drawNote(page, 150, 150, 340, 320)
  const note = notes(page).first()

  const handle = note.getByTestId('note-drag-handle')
  const hb = await handle.boundingBox()
  if (!hb) throw new Error('no handle box')

  await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2)
  await page.mouse.down()
  await page.mouse.move(hb.x + 120, hb.y + 100, { steps: 8 })
  await page.mouse.up()

  await expect(notes(page)).toHaveCount(1)
  // Zone hides again after the drag ends.
  await expect(page.getByTestId('delete-zone')).toHaveAttribute('data-visible', 'false')
})
