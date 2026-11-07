import { describe, it, expect, vi, afterEach } from 'vitest'
import { getMe, PLAY_HISTORY_LIMIT } from '../me'

afterEach(() => vi.useRealTimers())

describe('我（getMe）', () => {
  it('returns at most 8 plays, newest first, with the game attached', async () => {
    vi.useFakeTimers()
    const promise = getMe()
    await vi.runAllTimersAsync()
    const { playHistory } = await promise
    expect(playHistory).toHaveLength(PLAY_HISTORY_LIMIT)
    const times = playHistory.map((item) => Date.parse(item.playedAt))
    expect([...times].sort((a, b) => b - a)).toEqual(times)
    expect(playHistory.every((item) => item.game?.slug === item.gameSlug)).toBe(true)
  })
})
