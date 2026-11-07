import { describe, it, expect, vi, beforeEach } from 'vitest'
import { toast as sonner } from 'vue-sonner'
import { toast, UNDO_DURATION, DEFAULT_DURATION } from '../toast'

vi.mock('vue-sonner', () => {
  const fn = vi.fn()
  fn.success = vi.fn()
  fn.error = vi.fn()
  return { toast: fn }
})

beforeEach(() => vi.clearAllMocks())

describe('提示', () => {
  it('stays 5 seconds with an undo action', () => {
    const undo = vi.fn()
    toast.neutral('已取消收藏', { undo })
    const [message, options] = sonner.mock.calls[0]
    expect(message).toBe('已取消收藏')
    expect(options.duration).toBe(UNDO_DURATION)
    expect(options.action.label).toBe('復原')
    options.action.onClick()
    expect(undo).toHaveBeenCalled()
  })

  it('stays 3 seconds without an action', () => {
    toast.neutral('已加入收藏')
    const [, options] = sonner.mock.calls[0]
    expect(options.duration).toBe(DEFAULT_DURATION)
    expect(options.action).toBeUndefined()
  })

  it('stays 3 seconds with a view link', () => {
    toast.success('已加入這桌', { onView: vi.fn() })
    const [, options] = sonner.success.mock.calls[0]
    expect(options.duration).toBe(DEFAULT_DURATION)
    expect(options.action.label).toBe('查看')
  })

  it('shows errors without an action', () => {
    toast.error('加入失敗 牌桌已滿')
    const [, options] = sonner.error.mock.calls[0]
    expect(options.duration).toBe(DEFAULT_DURATION)
    expect(options.action).toBeUndefined()
  })
})
