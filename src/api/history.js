import { loadStored, saveStored } from './fake'
import { findGame } from './games'

// 最近看過：進遊戲主畫面就記一筆，給「為你推薦」用（PRD 7.1 第 8 條）。
// 存遊戲代稱的清單，新的在最前面、同一款只留一筆，最多 20 筆（docs/data-model.md）
const KEY = 'bga:recently-viewed'
const LIMIT = 20

export function addRecentlyViewed(slug) {
  if (!findGame(slug)) return
  const slugs = loadStored(KEY, []).filter((item) => item !== slug)
  saveStored(KEY, [slug, ...slugs].slice(0, LIMIT))
}
