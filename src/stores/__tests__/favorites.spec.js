import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { addFavorite } from '@/api/favorites'
import { toast } from '@/utils/toast'
import { useFavoritesStore } from '../favorites'

vi.mock('@/api/favorites', () => ({
  getFavorites: vi.fn(async () => [{ slug: 'catan' }]),
  addFavorite: vi.fn(async () => {}),
  removeFavorite: vi.fn(async () => {}),
}))
vi.mock('@/utils/toast', () => ({ toast: { neutral: vi.fn(), error: vi.fn() } }))

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

describe('收藏 store', () => {
  it('adds to the front right away and shows a toast', async () => {
    const store = useFavoritesStore()
    await store.load()
    const pending = store.add('skull')
    expect(store.slugs).toEqual(['skull', 'catan'])
    await pending
    expect(toast.neutral).toHaveBeenCalledWith('已加入收藏')
  })

  it('rolls back and shows an error when saving fails', async () => {
    addFavorite.mockRejectedValueOnce(new Error('fail'))
    const store = useFavoritesStore()
    await store.load()
    await store.add('skull')
    expect(store.slugs).toEqual(['catan'])
    expect(toast.error).toHaveBeenCalledWith('操作失敗，請再試一次')
  })

  it('toggles off a game that is already a favorite', async () => {
    const store = useFavoritesStore()
    await store.load()
    await store.toggle('catan')
    expect(store.isFavorite('catan')).toBe(false)
    expect(toast.neutral).toHaveBeenCalledWith('已取消收藏')
  })
})
