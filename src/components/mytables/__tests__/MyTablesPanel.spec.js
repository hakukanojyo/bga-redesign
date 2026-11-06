import { describe, it, expect, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import router from '@/router'
import { getMyTables } from '@/api/tables'
import { useMyTablesStore } from '@/stores/myTables'
import MyTablesPanel from '../MyTablesPanel.vue'

vi.mock('@/api/tables', () => ({ getMyTables: vi.fn() }))

const game = { slug: 'skull', name: { en: 'Skull' }, images: { box: null } }
const row = (tableId, extra = {}) => ({
  tableId,
  status: 'playing',
  isMyTurn: false,
  joinedAt: '2026-11-05T10:00:00+08:00',
  table: {
    game,
    host: { name: 'host', avatar: '' },
    pace: 'turn',
    mode: 'simple',
    settings: ['基礎版'],
    estimatedWaitMinutes: 13,
  },
  ...extra,
})

async function mountPanel(data) {
  getMyTables.mockResolvedValue(data)
  setActivePinia(createPinia())
  await router.push('/')
  await router.isReady()
  const wrapper = mount(MyTablesPanel, { global: { plugins: [router] } })
  await flushPromises()
  return { wrapper, store: useMyTablesStore() }
}

describe('我的牌桌面板（MYTBL-01～06、09、10）', () => {
  it('shows how many tables each tab has', async () => {
    const { wrapper } = await mountPanel({ playing: [row('a'), row('b')], queued: [row('c')] })
    const labels = wrapper.findAll('label').map((label) => label.text())
    expect(labels).toEqual(['進行中 2', '排隊中 1'])
  })

  it('marks your turn and realtime tables, others say 進入此遊戲桌', async () => {
    const live = row('b')
    live.table = { ...live.table, pace: 'realtime' }
    const { wrapper } = await mountPanel({
      playing: [row('a', { isMyTurn: true }), live, row('c')],
      queued: [],
    })
    const cards = wrapper.findAll('li')
    expect(cards[0].text()).toContain('你的回合')
    expect(cards[1].text()).toContain('對戰中')
    expect(cards[2].text()).toContain('進入此遊戲桌')
    expect(cards[2].text()).toContain('回合制／簡易／基礎版')
  })

  it('switches to the queued tab with the estimated wait', async () => {
    const { wrapper, store } = await mountPanel({
      playing: [],
      queued: [row('c', { status: 'queued' })],
    })
    store.tab = 'queued'
    await flushPromises()
    expect(wrapper.find('li').text()).toContain('預估等待 約 13 分鐘')
    expect(wrapper.find('li').text()).toContain('查看此桌詳細設定')
  })

  it('shows the empty state with 尋找開放桌 (MYTBL-09)', async () => {
    const { wrapper } = await mountPanel({ playing: [], queued: [] })
    expect(wrapper.find('h3').text()).toBe('目前沒有進行中的牌桌')
    const link = wrapper.findAll('a').find((a) => a.text() === '尋找開放桌')
    expect(link.attributes('href')).toBe('/tables')
  })
})
