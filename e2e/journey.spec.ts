import { expect, test } from '@playwright/test'
import { canvas, drawNote, noteRect, notes, resetApp } from './helpers'

test.beforeEach(async ({ page }) => {
  await resetApp(page)
})

/**
 * A full end-to-end journey exercising the whole app in one flow: create several
 * notes, give them text and ink, resize, overlap, delete one via the drop zone,
 * then clear the board.
 */
test('create, edit, resize, overlap, drop-delete, and clear', async ({ page }) => {
  // 1. Create three notes.
  await drawNote(page, 120, 130, 340, 320)
  await page.getByTestId('note-textarea').fill('First')
  await page.getByTestId('note-textarea').press('ControlOrMeta+Enter')

  await drawNote(page, 440, 130, 660, 320)
  await page.getByTestId('note-textarea').fill('Second')
  await page.getByTestId('note-textarea').press('ControlOrMeta+Enter')

  await drawNote(page, 760, 130, 980, 320)
  await page.getByTestId('note-textarea').press('Escape')
  await expect(notes(page)).toHaveCount(3)

  // 2. Make the first note bigger via its SE handle.
  const first = notes(page).nth(0)
  const beforeResize = await noteRect(first)
  const seh = await first.getByTestId('resize-se').boundingBox()
  if (!seh) throw new Error('no handle')
  await page.mouse.move(seh.x + seh.width / 2, seh.y + seh.height / 2)
  await page.mouse.down()
  await page.mouse.move(seh.x + 80, seh.y + 60, { steps: 8 })
  await page.mouse.up()
  const afterResize = await noteRect(first)
  expect(afterResize.width).toBeGreaterThan(beforeResize.width)

  // 3. Overlap the second onto the first, then click the first to bring it to front.
  const second = notes(page).nth(1)
  const s2 = await second.getByTestId('note-drag-handle').boundingBox()
  const f1 = await first.getByTestId('note-drag-handle').boundingBox()
  if (!s2 || !f1) throw new Error('no handles')
  await page.mouse.move(s2.x + s2.width / 2, s2.y + s2.height / 2)
  await page.mouse.down()
  await page.mouse.move(f1.x + 30, f1.y + 60, { steps: 10 }) // drop over the first
  await page.mouse.up()

  const zFirst = () => first.evaluate((el) => Number((el as HTMLElement).style.zIndex))
  const zSecond = () => second.evaluate((el) => Number((el as HTMLElement).style.zIndex))
  expect(await zSecond()).toBeGreaterThan(await zFirst())
  // Click the first note's handle → it comes to the front.
  await page.mouse.move(f1.x + f1.width / 2, f1.y + f1.height / 2)
  await page.mouse.down()
  await page.mouse.up()
  expect(await zFirst()).toBeGreaterThan(await zSecond())

  // 4. Delete the third note by dragging it to the right-edge delete zone.
  const third = notes(page).nth(2)
  const th = await third.getByTestId('note-drag-handle').boundingBox()
  const cb = await canvas(page).boundingBox()
  if (!th || !cb) throw new Error('no boxes')
  await page.mouse.move(th.x + th.width / 2, th.y + th.height / 2)
  await page.mouse.down()
  await page.mouse.move(cb.x + cb.width - 20, cb.y + 200, { steps: 16 })
  await expect(page.getByTestId('delete-zone')).toHaveAttribute('data-armed', 'true')
  await page.mouse.up()
  await expect(notes(page)).toHaveCount(2)

  // 5. Clear all remaining notes.
  await page.getByTestId('clear-all').click()
  await page.getByTestId('clear-all-confirm').click()
  await expect(notes(page)).toHaveCount(0)
  await expect(page.getByText('No notes yet')).toBeVisible()
})
