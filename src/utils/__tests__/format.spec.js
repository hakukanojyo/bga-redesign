import { describe, it, expect } from 'vitest'
import {
  formatCountry,
  formatDuration,
  formatFileSize,
  formatPlayers,
  formatPlays,
  formatScore,
  formatSeats,
  formatSettings,
  formatTimeAgo,
  formatVersion,
  formatWait,
} from '../format'

describe('資料格式（產品規則 6.6）', () => {
  it('formats players', () => {
    expect(formatPlayers({ min: 2, max: 4 })).toBe('2-4 人')
    expect(formatPlayers({ min: 2, max: 2 })).toBe('2 人')
  })

  it('formats duration without 約, and wait time with 約', () => {
    expect(formatDuration(30)).toBe('30 分鐘')
    expect(formatWait(13)).toBe('約 13 分鐘')
    expect(formatWait(null)).toBe('—')
  })

  it('joins table settings with full-width slashes', () => {
    expect(formatSettings(['基礎版', '10 分鐘局', '隨機'])).toBe('基礎版／10 分鐘局／隨機')
  })

  it('formats seats and scores', () => {
    expect(formatSeats({ taken: 14, max: 15 })).toBe('14/15 人')
    expect(formatScore(9980000)).toBe('9.98M PX')
    expect(formatScore(9800000)).toBe('9.8M PX')
    expect(formatScore(30)).toBe('30 PX')
  })

  it('formats how long ago a table was opened', () => {
    const now = Date.parse('2026-11-05T10:15:00+08:00')
    expect(formatTimeAgo('2026-11-05T10:00:00+08:00', now)).toBe('15 分鐘前')
    expect(formatTimeAgo('2026-11-05T07:15:00+08:00', now)).toBe('3 小時前')
  })
})

describe('國家', () => {
  it('shows the Chinese country name from its code', () => {
    expect(formatCountry('TW')).toBe('台灣')
    expect(formatCountry('JP')).toBe('日本')
  })
})

describe('遊戲主畫面', () => {
  it('formats file sizes, play counts and versions', () => {
    expect(formatFileSize(12)).toBe('12 MB')
    expect(formatPlays(2310455)).toBe('2,310,455 場')
    expect(formatVersion({ version: '1.4.2', date: '2026-10-28' })).toBe('版本 1.4.2（2026-10-28）')
  })
})
