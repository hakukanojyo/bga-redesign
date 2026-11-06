import { describe, it, expect, beforeEach, vi } from 'vitest'
import { openTables } from '../data/tables'
import {
  emptyReason,
  filterTables,
  getGameTables,
  getOpenTables,
  joinTable,
  TABLES_PAGE_SIZE,
} from '../tables'

describe('開放桌（TABLE）', () => {
  it('sorts by newest first by default', () => {
    const result = filterTables(openTables)
    expect(result[0].createdAt >= result[1].createdAt).toBe(true)
  })

  it('filters by game name and pace', () => {
    const result = filterTables(openTables, { query: '狼人', pace: ['turn'] })
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((table) => table.gameSlug === 'werewolves' && table.pace === 'turn')).toBe(
      true,
    )
  })

  it('puts tables without an estimated wait last when sorting by wait', () => {
    const result = filterTables(openTables, { sort: 'wait' })
    expect(result.at(-1).estimatedWaitMinutes).toBeNull()
  })

  it('only gives 你的回合 to turn-based tables (MYTBL-04)', async () => {
    const { initialMyTables } = await import('../data/tables')
    for (const mine of initialMyTables.filter((item) => item.isMyTurn)) {
      expect(openTables.find((table) => table.id === mine.tableId).pace).toBe('turn')
    }
  })
})

describe('遊戲主畫面的開放桌（PRD 7.4 第 4 條）', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })

  async function load(slug) {
    const promise = getGameTables(slug)
    await vi.runAllTimersAsync()
    return promise
  }

  it('shows the newest 3 tables of this game and how many there are', async () => {
    const { tables, total } = await load('werewolves')
    expect(total).toBe(4)
    expect(tables).toHaveLength(3)
    expect(tables.every((table) => table.gameSlug === 'werewolves')).toBe(true)
    expect(tables[0].createdAt >= tables[1].createdAt).toBe(true)
  })

  it('leaves out tables I already joined', async () => {
    const first = (await load('werewolves')).tables[0]
    const joining = joinTable(first.id)
    await vi.runAllTimersAsync()
    await joining
    const { tables, total } = await load('werewolves')
    expect(total).toBe(3)
    expect(tables.map((table) => table.id)).not.toContain(first.id)
  })

  it('is empty for a game nobody has opened a table for', async () => {
    expect(await load('twilight-imperium')).toEqual({ total: 0, tables: [] })
  })
})

describe('尋找開放桌（PRD 7.5）', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })

  async function run(promise) {
    await vi.runAllTimersAsync()
    return promise
  }

  it('leaves out tables I already joined, like the game page does', async () => {
    const all = await run(getOpenTables({}))
    const target = all.tables.find((table) => table.status === 'waiting')
    await run(joinTable(target.id))
    const after = await run(getOpenTables({}))
    expect(after.tables.map((table) => table.id)).not.toContain(target.id)
    expect(after.total).toBe(all.total - 1)
  })

  it('filters by mode and pace together', async () => {
    const { tables } = await run(getOpenTables({ mode: ['arena'], pace: ['turn'] }))
    expect(tables.length).toBeGreaterThan(0)
    expect(tables.every((table) => table.mode === 'arena' && table.pace === 'turn')).toBe(true)
  })

  it('hands out tables in batches of 20 with the total (載入更多)', async () => {
    const first = await run(getOpenTables({}))
    expect(first.tables).toHaveLength(TABLES_PAGE_SIZE)
    // 40 桌扣掉一開始就在我的牌桌裡的 3 桌
    expect(first.total).toBe(37)
    const next = await run(getOpenTables({}, { offset: TABLES_PAGE_SIZE }))
    expect(next.tables).toHaveLength(17)
    const ids = [...first.tables, ...next.tables].map((table) => table.id)
    expect(new Set(ids).size).toBe(37)
  })
})

describe('尋找開放桌沒有結果時是哪一種（#40）', () => {
  beforeEach(() => localStorage.clear())

  it('says no-game when the keyword matches no game (TABLE-12)', () => {
    expect(emptyReason({ query: 'xyz' })).toBe('no-game')
  })

  it('says no-tables when the game exists but nobody opened a table (TABLE-11)', () => {
    expect(emptyReason({ query: 'Twilight Imperium' })).toBe('no-tables')
  })

  it('says filtered when there are tables but the mode or pace filtered them out', () => {
    expect(emptyReason({ query: '狼人' })).toBe('filtered')
  })
})

// 放最後：自動刷新會改到模組裡的開放桌，前面的測試才不受影響
describe('自動刷新像真的網站一樣（TABLE-06）', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })

  it('keeps opening new tables, so the list never runs dry', async () => {
    const counts = []
    for (let i = 0; i < 30; i += 1) {
      const promise = getOpenTables({}, { refresh: true })
      await vi.runAllTimersAsync()
      counts.push((await promise).total)
    }
    expect(Math.min(...counts)).toBeGreaterThanOrEqual(34)
    expect(Math.max(...counts)).toBeLessThanOrEqual(46)
    expect(new Set(counts).size).toBeGreaterThan(1)
  })
})
