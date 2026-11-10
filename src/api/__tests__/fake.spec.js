import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { applyStoredScenario } from '../fake'
import { getFavorites } from '../favorites'
import { getMe } from '../me'
import { FILL_AFTER_MS, getMyTables, joinTable } from '../tables'
import { openTables } from '../data/tables'

async function settle(promise) {
  await vi.runAllTimersAsync()
  return promise
}

// 打開網址時的狀態處理，再換頁（網址沒有 scenario 了）
function open(url) {
  window.history.replaceState(null, '', url)
  applyStoredScenario()
  window.history.replaceState(null, '', '/')
}

describe('可用性測試的乾淨狀態（#70）', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })
  afterEach(() => {
    window.history.replaceState(null, '', '/')
    vi.useRealTimers()
  })

  it('starts like a new player and stays clean after changing pages', async () => {
    open('/?scenario=usertest')
    const mine = await settle(getMyTables())
    expect(mine.playing).toEqual([])
    expect(mine.queued).toEqual([])
    expect(await settle(getFavorites())).toEqual([])
    expect((await settle(getMe())).playHistory).toEqual([])
  })

  it('lets you join a realtime table, which stays queued', async () => {
    open('/?scenario=usertest')
    const table = openTables.find((item) => item.pace === 'realtime' && item.status === 'waiting')
    await settle(joinTable(table.id))
    vi.advanceTimersByTime(FILL_AFTER_MS * 2)
    const mine = await settle(getMyTables())
    expect(mine.queued.map((row) => row.tableId)).toEqual([table.id])
    expect(mine.confirming).toEqual([])
    expect(mine.playing).toEqual([])
  })

  it('clears again every time it is opened', async () => {
    open('/?scenario=usertest')
    await settle(joinTable(openTables[0].id))
    open('/?scenario=usertest')
    expect((await settle(getMyTables())).queued).toEqual([])
  })

  it('goes back to the demo data with ?scenario=reset', async () => {
    open('/?scenario=usertest')
    open('/?scenario=reset')
    expect((await settle(getMyTables())).playing.length).toBeGreaterThan(0)
    expect((await settle(getMe())).playHistory.length).toBeGreaterThan(0)
  })
})
