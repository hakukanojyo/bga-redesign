import { fakeRequest, loadStored, saveStored, scenario } from './fake'
import { findGame } from './games'
import { initialFavorites } from './data/tables'

// 收藏存成遊戲代稱的清單，新的在最前面（docs/data-model.md）
const KEY = 'bga:favorites'

export function getFavorites() {
  const slugs = scenario() === 'empty' ? [] : loadStored(KEY, initialFavorites)
  return fakeRequest(slugs.map(findGame).filter(Boolean))
}

// index 給「復原」用：取消收藏後按復原，放回原本的位置
export function addFavorite(slug, index = 0) {
  const slugs = loadStored(KEY, initialFavorites).filter((item) => item !== slug)
  slugs.splice(index, 0, slug)
  saveStored(KEY, slugs)
  return fakeRequest(slugs)
}

// 回傳原本的位置，讓畫面可以復原
export function removeFavorite(slug) {
  const slugs = loadStored(KEY, initialFavorites)
  const index = slugs.indexOf(slug)
  saveStored(
    KEY,
    slugs.filter((item) => item !== slug),
  )
  return fakeRequest({ index })
}
