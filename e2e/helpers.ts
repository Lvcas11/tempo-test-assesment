import type { Locator, Page } from '@playwright/test'

/**
 * Start each test from an empty canvas. Clears storage once, then reloads so the
 * app boots clean — without an init script that would also wipe data across the
 * reloads that persistence tests rely on.
 */
export async function resetApp(page: Page): Promise<void> {
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
  await page.getByTestId('canvas').waitFor()
}

export function canvas(page: Page): Locator {
  return page.getByTestId('canvas')
}

export function notes(page: Page): Locator {
  return page.getByTestId('note')
}

/** Draw a note by dragging a rectangle on the canvas from (x1,y1) to (x2,y2). */
export async function drawNote(
  page: Page,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): Promise<void> {
  const box = await canvas(page).boundingBox()
  if (!box) throw new Error('canvas has no bounding box')
  await page.mouse.move(box.x + x1, box.y + y1)
  await page.mouse.down()
  await page.mouse.move(box.x + x1 + (x2 - x1) / 2, box.y + y1 + (y2 - y1) / 2, { steps: 4 })
  await page.mouse.move(box.x + x2, box.y + y2, { steps: 4 })
  await page.mouse.up()
}

/** Drag from one point to another on the canvas (both relative to the canvas). */
export async function dragOnCanvas(
  page: Page,
  from: { x: number; y: number },
  to: { x: number; y: number },
): Promise<void> {
  const box = await canvas(page).boundingBox()
  if (!box) throw new Error('canvas has no bounding box')
  await page.mouse.move(box.x + from.x, box.y + from.y)
  await page.mouse.down()
  await page.mouse.move(box.x + to.x, box.y + to.y, { steps: 8 })
  await page.mouse.up()
}

/** Drag a note by its accent-bar handle, by a (dx, dy) offset. */
export async function dragNoteBy(page: Page, note: Locator, dx: number, dy: number): Promise<void> {
  const handle = note.getByTestId('note-drag-handle')
  const box = await handle.boundingBox()
  if (!box) throw new Error('note handle has no bounding box')
  const cx = box.x + box.width / 2
  const cy = box.y + box.height / 2
  await page.mouse.move(cx, cy)
  await page.mouse.down()
  await page.mouse.move(cx + dx, cy + dy, { steps: 8 })
  await page.mouse.up()
}

/** Drag a note by its handle to an absolute screen point. */
export async function dragNoteTo(
  page: Page,
  note: Locator,
  screenX: number,
  screenY: number,
): Promise<void> {
  const handle = note.getByTestId('note-drag-handle')
  const box = await handle.boundingBox()
  if (!box) throw new Error('note handle has no bounding box')
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(screenX, screenY, { steps: 12 })
  await page.mouse.up()
}

/** Read a note's committed rect from its inline styles. */
export async function noteRect(note: Locator): Promise<{
  x: number
  y: number
  width: number
  height: number
}> {
  return note.evaluate((el) => {
    const style = el.style
    const match = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(style.transform)
    return {
      x: match ? parseFloat(match[1]) : 0,
      y: match ? parseFloat(match[2]) : 0,
      width: parseFloat(style.width),
      height: parseFloat(style.height),
    }
  })
}
