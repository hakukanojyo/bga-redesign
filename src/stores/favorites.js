import { ref } from 'vue'
import { defineStore } from 'pinia'
import { addFavorite, getFavorites, removeFavorite } from '@/api/favorites'
import { toast } from '@/utils/toast'

// 收藏（docs/adr/0002）：首頁卡片、遊戲主畫面、收藏面板都讀這一份，在一個地方按，其他地方跟著變。
// 存遊戲代稱，新收藏的在最前面。樂觀更新：先改畫面，失敗再改回去並提示（產品規則 5.3）
export const useFavoritesStore = defineStore('favorites', () => {
  const slugs = ref([])
  const status = ref('idle')

  async function load() {
    status.value = 'loading'
    try {
      slugs.value = (await getFavorites()).map((game) => game.slug)
      status.value = 'success'
    } catch {
      status.value = 'error'
    }
  }

  const isFavorite = (slug) => slugs.value.includes(slug)

  async function add(slug) {
    if (isFavorite(slug)) return
    const before = [...slugs.value]
    slugs.value = [slug, ...slugs.value]
    toast.neutral('已加入收藏')
    try {
      await addFavorite(slug)
    } catch {
      slugs.value = before
      toast.error('操作失敗 請再試一次')
    }
  }

  // 卡片和遊戲頁的按鈕再按一次就是取消，按錯了再按一次就加回來，所以不附「復原」（GAME-02）。
  // 收藏面板的「取消收藏」按了卡片就不見了，附「復原」放回原本的位置（FAV-05，undoable）
  async function remove(slug, { undoable = false } = {}) {
    if (!isFavorite(slug)) return
    const before = [...slugs.value]
    const index = before.indexOf(slug)
    slugs.value = slugs.value.filter((item) => item !== slug)
    toast.neutral('已取消收藏', { undo: undoable ? () => restore(slug, index) : undefined })
    try {
      await removeFavorite(slug)
    } catch {
      slugs.value = before
      toast.error('操作失敗 請再試一次')
    }
  }

  // 復原：不再出「已加入收藏」，畫面回到取消前的樣子就是回饋
  async function restore(slug, index) {
    if (isFavorite(slug)) return
    const before = [...slugs.value]
    slugs.value = [...before.slice(0, index), slug, ...before.slice(index)]
    try {
      await addFavorite(slug, index)
    } catch {
      slugs.value = before
      toast.error('操作失敗 請再試一次')
    }
  }

  const toggle = (slug) => (isFavorite(slug) ? remove(slug) : add(slug))

  return { slugs, status, load, isFavorite, add, remove, toggle }
})
