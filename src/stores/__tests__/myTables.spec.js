import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { getMyTables, leaveTable } from '@/api/tables'
import { toast } from '@/utils/toast'
import { useMyTablesStore } from '../myTables'

vi.mock('@/api/tables', () => ({ getMyTables: vi.fn(), leaveTable: vi.fn(async () => {}) }))
vi.mock('@/utils/toast', () => ({
  toast: { neutral: vi.fn(), success: vi.fn(), error: vi.fn() },
}))
vi.mock('@/router', () => ({ default: { push: vi.fn() } }))

const game = { slug: 'catan', name: { 'zh-TW': '卡坦島', en: 'Catan' } }
const row = (tableId, extra = {}) => ({ tableId, isMyTurn: false, table: { game }, ...extra })

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

describe('我的牌桌 store', () => {
  it('removes the table right away and says 已退出這桌, without undo (MYTBL-08)', async () => {
    getMyTables.mockResolvedValue({ playing: [], queued: [row('a'), row('b')] })
    const store = useMyTablesStore()
    await store.load()
    const pending = store.leave('a')
    expect(store.queued.map((item) => item.tableId)).toEqual(['b'])
    await pending
    expect(toast.neutral).toHaveBeenCalledWith('已退出這桌')
    expect(leaveTable).toHaveBeenCalledWith('a')
  })

  it('puts the table back when leaving fails (產品規則 5.3)', async () => {
    getMyTables.mockResolvedValue({ playing: [], queued: [row('a')] })
    leaveTable.mockRejectedValueOnce(new Error('fail'))
    const store = useMyTablesStore()
    await store.load()
    await store.leave('a')
    expect(store.queued.map((item) => item.tableId)).toEqual(['a'])
    expect(toast.error).toHaveBeenCalledWith('操作失敗 請再試一次')
  })

  it('tells me when a queued table fills up, with 進入遊戲 (MYTBL-11)', async () => {
    getMyTables.mockResolvedValueOnce({ playing: [], queued: [row('a')] })
    const store = useMyTablesStore()
    await store.load()
    expect(toast.success).not.toHaveBeenCalled()

    getMyTables.mockResolvedValueOnce({ playing: [row('a')], queued: [] })
    await store.load()
    expect(toast.success).toHaveBeenCalledWith(
      '卡坦島 人到齊了',
      expect.objectContaining({ viewLabel: '進入遊戲', persistent: true }),
    )
  })

  it('lights the red dot only when it is my turn', async () => {
    getMyTables.mockResolvedValue({ playing: [row('a', { isMyTurn: true })], queued: [] })
    const store = useMyTablesStore()
    await store.load()
    expect(store.hasMyTurn).toBe(true)
  })
})
