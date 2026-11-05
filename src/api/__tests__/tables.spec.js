import { describe, it, expect } from 'vitest'
import { openTables } from '../data/tables'
import { filterTables } from '../tables'

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
