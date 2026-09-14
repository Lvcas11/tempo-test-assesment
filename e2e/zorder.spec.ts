import { expect, test, type Locator } from '@playwright/test'
import { drawNote, notes, resetApp } from './helpers'

test.beforeEach(async ({ page }) => {
  await resetApp(page)
})

const zOf = (n: Locator) => n.evaluate((el) => Number((el as HTMLElement).style.zIndex))

test('interacting with a note brings it to the front', async ({ page }) => {
  // Two notes drawn in separate empty regions (so each create starts on canvas).
  await drawNote(page, 120, 120, 340, 320)
  await drawNote(page, 520, 120, 740, 320)

  const first = notes(page).nth(0)
  const second = notes(page).nth(1)

  // The most recently created note starts on top.
  expect(await zOf(second)).toBeGreaterThan(await zOf(first))

  // Press the first note's drag handle to promote it (mousedown is enough).
  const handle = first.getByTestId('note-drag-handle')
  const hb = await handle.boundingBox()
  if (!hb) throw new Error('no handle box')
  await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2)
  await page.mouse.down()
  await page.mouse.up()

  expect(await zOf(first)).toBeGreaterThan(await zOf(second))
})
