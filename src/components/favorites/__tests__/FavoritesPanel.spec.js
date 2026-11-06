import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import router from '@/router'
import { useFavoritesStore } from '@/stores/favorites'
import FavoritesPanel from '../FavoritesPanel.vue'

vi.mock('@/utils/toast', () => ({ toast: { neutral: vi.fn(), error: vi.fn() } }))

async function mountWith(slugs, status = 'success') {
  setActivePinia(createPinia())
  const store = useFavoritesStore()
  store.slugs = slugs
  store.status = status
  await router.push('/')
  await router.isReady()
  return { store, wrapper: mount(FavoritesPanel, { global: { plugins: [router] } }) }
}

beforeEach(() => vi.clearAllMocks())

describe('我的收藏面板（FAV-01～06）', () => {
  it('lists favorites newest first, linking to the top of the game page', async () => {
    const { wrapper } = await mountWith(['azul', 'catan'])
    const names = wrapper.findAll('h3 a')
    expect(names).toHaveLength(2)
    expect(names[0].attributes('href')).toBe('/game/azul')
    expect(names[1].attributes('href')).toBe('/game/catan')
  })

  it('each card offers 建立遊戲桌, 查看開放桌 and 取消收藏', async () => {
    const { wrapper } = await mountWith(['azul'])
    const links = wrapper.findAll('li a').map((a) => [a.text(), a.attributes('href')])
    expect(links).toContainEqual(['建立遊戲桌', '/coming-soon'])
    expect(links).toContainEqual(['查看開放桌', '/game/azul#tables'])
    expect(wrapper.find('li button').text()).toContain('取消收藏')
  })

  it('removing from the panel offers undo (FAV-05)', async () => {
    const { store, wrapper } = await mountWith(['azul', 'catan'])
    const remove = vi.spyOn(store, 'remove').mockResolvedValue()
    await wrapper.find('li button').trigger('click')
    expect(remove).toHaveBeenCalledWith('azul', { undoable: true })
  })

  it('shows the empty state with 探索遊戲 when there are no favorites (FAV-06)', async () => {
    const { wrapper } = await mountWith([])
    expect(wrapper.find('h3').text()).toBe('還沒有收藏的遊戲')
    expect(wrapper.find('a').text()).toBe('探索遊戲')
    expect(wrapper.find('a').attributes('href')).toBe('/')
  })

  it('shows retry when favorites failed to load', async () => {
    const { wrapper } = await mountWith([], 'error')
    expect(wrapper.text()).toContain('目前無法載入')
    expect(wrapper.find('button').text()).toBe('重新嘗試')
  })
})
