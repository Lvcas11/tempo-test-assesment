import { expect, test, type Locator, type Page } from '@playwright/test'
import { drawNote, noteRect, notes, resetApp } from './helpers'

test.beforeEach(async ({ page }) => {
  await resetApp(page)
})

async function dragHandle(page: Page, note: Locator, handle: string, dx: number, dy: number) {
  const box = await note.getByTestId(`resize-${handle}`).boundingBox()
  if (!box) throw new Error(`handle ${handle} has no box`)
  const cx = box.x + box.width / 2
  const cy = box.y + box.height / 2
  await page.mouse.move(cx, cy)
  await page.mouse.down()
  await page.mouse.move(cx + dx, cy + dy, { steps: 8 })
  await page.mouse.up()
}

test('dragging the SE handle grows the note (origin fixed)', async ({ page }) => {
  await drawNote(page, 150, 150, 350, 320)
  const note = notes(page).first()
  const before = await noteRect(note)

  await dragHandle(page, note, 'se', 80, 60)

  const after = await noteRect(note)
  expect(after.x).toBeCloseTo(before.x, -1)
  expect(after.y).toBeCloseTo(before.y, -1)
  expect(after.width).toBeCloseTo(before.width + 80, -1)
  expect(after.height).toBeCloseTo(before.height + 60, -1)
})

test('dragging the NW handle moves the origin and shrinks the note', async ({ page }) => {
  await drawNote(page, 200, 200, 460, 420)
  const note = notes(page).first()
  const before = await noteRect(note)

  await dragHandle(page, note, 'nw', 50, 40)

  const after = await noteRect(note)
  expect(after.x).toBeCloseTo(before.x + 50, -1)
  expect(after.y).toBeCloseTo(before.y + 40, -1)
  expect(after.width).toBeCloseTo(before.width - 50, -1)
  expect(after.height).toBeCloseTo(before.height - 40, -1)
})

test('a note cannot be resized below the minimum size', async ({ page }) => {
  await drawNote(page, 150, 150, 350, 320)
  const note = notes(page).first()

  // Drag SE handle far into negative to force below-min.
  await dragHandle(page, note, 'se', -500, -500)

  const after = await noteRect(note)
  expect(after.width).toBeGreaterThanOrEqual(120)
  expect(after.height).toBeGreaterThanOrEqual(120)
})
