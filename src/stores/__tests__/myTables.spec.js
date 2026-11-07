import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { acceptTable, getMyTables, leaveTable } from '@/api/tables'
import { toast } from '@/utils/toast'
import router from '@/router'
import { useMyTablesStore } from '../myTables'

vi.mock('@/api/tables', () => ({
  acceptTable: vi.fn(),
  getMyTables: vi.fn(),
  leaveTable: vi.fn(async () => {}),
}))
vi.mock('@/utils/toast', () => ({
  toast: { neutral: vi.fn(), success: vi.fn(), error: vi.fn() },
}))
vi.mock('@/router', () => ({ default: { push: vi.fn() } }))

const game = { slug: 'catan', name: { 'zh-TW': '卡坦島', en: 'Catan' } }
const row = (tableId, extra = {}) => ({
  tableId,
  status: 'queued',
  isMyTurn: false,
  table: { game },
  ...extra,
})
const confirmBy = () => new Date(Date.now() + 20000).toISOString()
const waitingFor = (tableId) => row(tableId, { status: 'confirming', confirmBy: confirmBy() })

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

    getMyTables.mockResolvedValueOnce({ playing: [row('a', { status: 'playing' })], queued: [] })
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

  it('asks about the first realtime table that filled up, without the 人到齊了 toast (MYTBL-13)', async () => {
    getMyTables.mockResolvedValueOnce({ playing: [], queued: [row('a')], confirming: [] })
    const store = useMyTablesStore()
    await store.load()
    getMyTables.mockResolvedValueOnce({
      playing: [],
      queued: [waitingFor('a')],
      confirming: [waitingFor('a')],
    })
    await store.load()
    expect(store.readyCheck.tableId).toBe('a')
    expect(toast.success).not.toHaveBeenCalled()
  })

  it('waits for the others after I accept, then starts when everyone confirmed (MYTBL-12)', async () => {
    getMyTables.mockResolvedValue({
      playing: [],
      queued: [waitingFor('a')],
      confirming: [waitingFor('a')],
    })
    const store = useMyTablesStore()
    await store.load()
    acceptTable.mockResolvedValueOnce({ tableId: 'a' })
    getMyTables.mockResolvedValueOnce({
      playing: [],
      queued: [waitingFor('a')],
      confirming: [{ ...waitingFor('a'), accepted: true }],
    })
    await store.accept('a')
    expect(store.readyCheck.accepted).toBe(true)
    expect(router.push).not.toHaveBeenCalled()

    getMyTables.mockResolvedValueOnce({
      playing: [row('a', { status: 'playing', autoLeft: 2 })],
      queued: [],
      confirming: [],
    })
    await store.load()
    expect(toast.neutral).toHaveBeenCalledWith('已退出另外 2 桌即時制的排隊')
    expect(router.push).toHaveBeenCalledWith('/coming-soon')
    expect(toast.success).not.toHaveBeenCalled()
    expect(store.readyCheck).toBe(null)
  })

  it('stays queued when another player did not confirm', async () => {
    getMyTables.mockResolvedValueOnce({
      playing: [],
      queued: [waitingFor('a')],
      confirming: [{ ...waitingFor('a'), accepted: true }],
    })
    const store = useMyTablesStore()
    await store.load()
    getMyTables.mockResolvedValueOnce({ playing: [], queued: [row('a')], confirming: [] })
    await store.load()
    expect(toast.neutral).toHaveBeenCalledWith('有玩家沒有確認 這桌回到等人')
    expect(router.push).not.toHaveBeenCalled()
  })

  it('keeps the notice until I close it when my time runs out', async () => {
    getMyTables.mockResolvedValueOnce({
      playing: [],
      queued: [waitingFor('a')],
      confirming: [waitingFor('a')],
    })
    const store = useMyTablesStore()
    await store.load()
    getMyTables.mockResolvedValueOnce({ playing: [], queued: [], confirming: [] })
    await store.load()
    expect(toast.neutral).toHaveBeenCalledWith('卡坦島 沒有在時間內確認 已退出這桌', {
      persistent: true,
    })
  })

  it('says 已退出這桌 only once when I leave from the dialog', async () => {
    getMyTables.mockResolvedValue({
      playing: [],
      queued: [waitingFor('a')],
      confirming: [waitingFor('a')],
    })
    const store = useMyTablesStore()
    await store.load()
    await store.decline('a')
    expect(store.readyCheck).toBe(null)
    expect(leaveTable).toHaveBeenCalledWith('a')
    getMyTables.mockResolvedValue({ playing: [], queued: [], confirming: [] })
    await store.load()
    expect(toast.neutral).toHaveBeenCalledTimes(1)
    expect(toast.neutral).toHaveBeenCalledWith('已退出這桌')
  })

  it('ignores a refresh that was sent before I left, so the dialog does not come back', async () => {
    const before = { playing: [], queued: [waitingFor('a')], confirming: [waitingFor('a')] }
    getMyTables.mockResolvedValueOnce(before)
    const store = useMyTablesStore()
    await store.load()

    let respond
    getMyTables.mockReturnValueOnce(new Promise((resolve) => (respond = resolve)))
    const refresh = store.load()
    await store.decline('a')
    respond(before)
    await refresh
    expect(store.readyCheck).toBe(null)
    expect(store.queued).toEqual([])
  })
})
