import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { getGameTables, joinTable } from '@/api/tables'
import { toast } from '@/utils/toast'
import GameTables from '../GameTables.vue'

vi.mock('@/api/tables', () => ({
  getGameTables: vi.fn(),
  joinTable: vi.fn(),
  getMyTables: vi.fn(async () => ({ playing: [], queued: [] })),
}))
vi.mock('@/utils/toast', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const table = (id) => ({
  id,
  host: { name: `host-${id}`, avatar: '' },
  pace: 'turn',
  mode: 'arena',
  settings: ['基礎版', '10 分鐘局', '隨機'],
  seats: { taken: 2, max: 4 },
  estimatedWaitMinutes: 5,
  status: 'waiting',
})

async function mountTables() {
  const wrapper = mount(GameTables, {
    props: { slug: 'werewolves' },
    global: {
      plugins: [createPinia()],
      stubs: { RouterLink: { template: '<a><slot /></a>' } },
      provide: { openPanel: vi.fn() },
    },
  })
  await flushPromises()
  return wrapper
}

const firstButton = (wrapper) => wrapper.find('li button')

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers()
  getGameTables.mockResolvedValue({ total: 4, tables: [table('a'), table('b'), table('c')] })
})
afterEach(() => vi.useRealTimers())

describe('GameTables', () => {
  it('reports how many tables this game has', async () => {
    const wrapper = await mountTables()
    expect(wrapper.findAll('li')).toHaveLength(3)
    expect(wrapper.emitted('update:total')).toEqual([[4]])
  })

  it('shows pace and mode before the settings, whatever the filter is', async () => {
    const wrapper = await mountTables()
    expect(wrapper.find('li').text()).toContain('回合制／競技場／基礎版／10 分鐘局／隨機')
  })

  it('shows 已加入, then removes the row after 1.5 seconds (PRD 7.6)', async () => {
    let finish
    joinTable.mockReturnValue(new Promise((resolve) => (finish = resolve)))
    const wrapper = await mountTables()
    await firstButton(wrapper).trigger('click')
    expect(firstButton(wrapper).text()).toBe('加入中…')
    finish({})
    await flushPromises()
    expect(firstButton(wrapper).text()).toBe('已加入')
    expect(toast.success).toHaveBeenCalledWith('已加入這桌', expect.any(Object))
    vi.advanceTimersByTime(1500)
    await flushPromises()
    expect(wrapper.emitted('update:total').at(-1)).toEqual([3])
  })

  it('turns the row into 已額滿 when the table filled up first', async () => {
    joinTable.mockRejectedValue(Object.assign(new Error('牌桌已滿'), { code: 'full' }))
    const wrapper = await mountTables()
    await firstButton(wrapper).trigger('click')
    await flushPromises()
    expect(firstButton(wrapper).text()).toBe('已額滿')
    expect(firstButton(wrapper).attributes('disabled')).toBeDefined()
    expect(toast.error).toHaveBeenCalledWith('加入失敗 牌桌已滿')
  })

  it('keeps the old rows when an auto refresh fails (產品規則 5.3)', async () => {
    const wrapper = await mountTables()
    getGameTables.mockRejectedValueOnce(new Error('offline'))
    vi.advanceTimersByTime(10_000)
    await flushPromises()
    expect(wrapper.findAll('li')).toHaveLength(3)
    expect(wrapper.text()).not.toContain('目前無法載入')
  })

  it('invites the player to open the first table when there is none', async () => {
    getGameTables.mockResolvedValue({ total: 0, tables: [] })
    const wrapper = await mountTables()
    expect(wrapper.find('h3').text()).toBe('這款遊戲還沒有人開桌')
    expect(wrapper.text()).toContain('建立遊戲桌')
  })
})
