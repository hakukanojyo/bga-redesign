import { describe, it, expect, beforeEach, vi } from 'vitest'
import { openTables } from '../data/tables'
import { filterTables, getGameTables, joinTable } from '../tables'

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
