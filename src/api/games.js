import { fakeRequest, loadStored, scenario } from './fake'
import { games } from './data/games'
import { me } from './data/people'
import { initialFavorites } from './data/tables'
import { playerOptions, timeOptions } from './data/options'

// 壓縮過的圖片（npm run images 產生）：檔名是「代稱_banner／box／logo.webp」，沒有的那種是 null
const imageFiles = import.meta.glob('@/assets/images/games/*.webp', {
  eager: true,
  import: 'default',
})

function imagesOf(slug) {
  const find = (kind) => imageFiles[`/src/assets/images/games/${slug}_${kind}.webp`] ?? null
  return { box: find('box'), banner: find('banner'), logo: find('logo') }
}

// 每張橫幅的主色（npm run images 算的）：主視覺的「立即遊玩」按鈕跟著換色（docs/adr/0014）；沒有橫幅的用品牌藍
import accentColors from '@/assets/images/games/colors.json'

const allGames = games.map((game) => ({
  ...game,
  images: imagesOf(game.slug),
  accentColor: accentColors[game.slug] ?? '#0b72b5',
}))

// 名稱依語言顯示；沒有官方中文名時顯示英文名
export function gameName(game, locale = 'zh-TW') {
  return game.name[locale] ?? game.name.en
}

const normalize = (text) => text.trim().toLowerCase()

// 搜尋只比對各語言的名稱和別名，不比對標籤（PRD 7.2）
export function matchesQuery(game, query) {
  const q = normalize(query ?? '')
  if (!q) return true
  return [...Object.values(game.name), ...game.aliases].some((name) => normalize(name).includes(q))
}

const overlaps = (a, b) => a.min <= b.max && b.min <= a.max
const includesAny = (values, selected) => selected.some((value) => values.includes(value))

// 篩選（PRD 7.3）：同一類裡選好幾個是「或」，不同類別之間是「且」；沒選的類別不限制
export function matchesFilters(game, filters = {}) {
  const {
    players = [],
    time = [],
    complexity = [],
    types = [],
    mechanics = [],
    themes = [],
  } = filters
  return (
    (!players.length || players.some((key) => overlaps(game.players, playerOptions[key]))) &&
    (!time.length ||
      time.some((key) => overlaps({ min: game.duration, max: game.duration }, timeOptions[key]))) &&
    (!complexity.length || complexity.includes(game.complexity)) &&
    (!types.length || includesAny(game.types, types)) &&
    (!mechanics.length || includesAny(game.mechanics, mechanics)) &&
    (!themes.length || includesAny(game.themes, themes))
  )
}

// 排序（SRCH-05）：同分時依名稱，結果才不會每次順序不同
const byName = (a, b) => gameName(a).localeCompare(gameName(b), 'zh-TW')
const sorters = {
  popular: (a, b) => b.playsLast30Days - a.playsLast30Days || byName(a, b),
  newest: (a, b) => b.releasedAt.localeCompare(a.releasedAt) || byName(a, b),
  duration: (a, b) => a.duration - b.duration || byName(a, b),
  name: byName,
}

export function searchGames(list, { query = '', filters = {}, sort = 'popular' } = {}) {
  return list
    .filter((game) => matchesQuery(game, query) && matchesFilters(game, filters))
    .sort(sorters[sort] ?? sorters.popular)
}

// 首頁每區最多 10 張：排序類（為你推薦、最新、熱門）一定 10 張，分類類只放符合的（PRD 7.1 第 9 條）
const SECTION_SIZE = 10

// 為你推薦的三種紀錄和權重：玩過 > 收藏 > 看過（PRD 7.1 第 8 條）
const WEIGHTS = { played: 3, favorites: 2, viewed: 1 }

// 為你推薦：和每款紀錄裡的遊戲比類型、機制、主題，相同的個數 × 那種紀錄的權重，加總越高越前面。
// 玩過、收藏的不再推薦；只是看過的還會推薦（還沒決定要玩）。不足 limit 款時用熱門補，沒有紀錄時就是熱門
export function recommend(list, signals = {}, limit = SECTION_SIZE) {
  const tags = (game) => [...game.types, ...game.mechanics, ...game.themes]
  const weighted = Object.entries(WEIGHTS).flatMap(([kind, weight]) =>
    list
      .filter((game) => (signals[kind] ?? []).includes(game.slug))
      .map((game) => ({ tags: tags(game), weight })),
  )
  const owned = [...(signals.played ?? []), ...(signals.favorites ?? [])]
  const score = (game) =>
    weighted.reduce(
      (sum, item) => sum + item.weight * tags(game).filter((tag) => item.tags.includes(tag)).length,
      0,
    )
  return list
    .filter((game) => !owned.includes(game.slug))
    .sort((a, b) => score(b) - score(a) || sorters.popular(a, b))
    .slice(0, limit)
}

// 首頁分區：都從遊戲的欄位算出來，不另外存清單（PRD 7.1）
export function homeSections(list, signals) {
  return [
    { key: 'recommended', title: '為你推薦', games: recommend(list, signals) },
    {
      key: 'newest',
      title: '最新上線',
      games: searchGames(list, { sort: 'newest' }).slice(0, SECTION_SIZE),
    },
    {
      key: 'popular',
      title: '現正熱門',
      games: searchGames(list, { sort: 'popular' }).slice(0, SECTION_SIZE),
    },
    {
      key: 'casual',
      title: '輕鬆小品',
      games: searchGames(list, { filters: { complexity: ['casual'] } }).slice(0, SECTION_SIZE),
    },
    {
      key: 'classic',
      title: '經典遊戲',
      games: searchGames(list, { filters: { types: ['classic'] } }).slice(0, SECTION_SIZE),
    },
    {
      key: 'family',
      title: '適合家庭',
      games: searchGames(list, { filters: { types: ['family'] } }).slice(0, SECTION_SIZE),
    },
    {
      key: 'deep',
      title: '適合深度玩家',
      games: searchGames(list, { filters: { complexity: ['deep'] } }).slice(0, SECTION_SIZE),
    },
  ]
}

// ---------- 畫面呼叫的函式 ----------

export function getGames(params) {
  return fakeRequest(scenario() === 'empty' ? [] : searchGames(allGames, params))
}

// 找不到這款遊戲時回傳 null，畫面顯示找不到頁面（產品規則 5.3）
export function getGame(slug) {
  return fakeRequest(allGames.find((game) => game.slug === slug) ?? null)
}

// 首頁主視覺（HOME-01）：廣告版位，人工指定，所以不用算的
export function getFeaturedGame() {
  return getGame('zombicide-2e')
}

// 首頁中段精選橫幅（HOME-09）：和主視覺一樣是人工指定的廣告版位
export function getPromoGame() {
  return getGame('distilled')
}

export function getHomeSections() {
  const signals = {
    played: me.playHistory.map((item) => item.gameSlug),
    favorites: loadStored('bga:favorites', initialFavorites),
    viewed: loadStored('bga:recently-viewed', []),
  }
  return fakeRequest(scenario() === 'empty' ? [] : homeSections(allGames, signals))
}

// 收藏、牌桌要用遊戲資料時從這裡拿，不重複存
export function findGame(slug) {
  return allGames.find((game) => game.slug === slug) ?? null
}
