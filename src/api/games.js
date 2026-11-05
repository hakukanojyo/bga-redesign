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

// ---------- 也許你想找的是這些？（PRD 7.2 第 5 條） ----------
// 中文和英文分開比：中文看共同的字，英文一個單字一個單字看拼得像不像

const hanChars = (text) => new Set(normalize(text).match(/\p{Script=Han}/gu) ?? [])
const latinWords = (text) => normalize(text).match(/[a-z0-9]+/g) ?? []

// 編輯距離（Levenshtein）：a 要改、加、刪幾個字母才會變成 b
function editDistance(a, b) {
  let row = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const next = [i]
    for (let j = 1; j <= b.length; j++) {
      next[j] = Math.min(row[j] + 1, next[j - 1] + 1, row[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    }
    row = next
  }
  return row[b.length]
}

// 英文單字允許打錯幾個字母，照 Algolia 的級距：3 個字母以下不容錯、4～7 個錯 1 個、8 個以上錯 2 個
const allowedTypos = (word) => (word.length >= 8 ? 2 : word.length >= 4 ? 1 : 0)
const wordMatches = (typed, word) =>
  word.startsWith(typed) || editDistance(typed, word) <= allowedTypos(typed)

// 一個名稱和搜尋字有多像，0 是不像：
// 中文：共同的字至少 2 個，或超過搜尋字的一半（「璀燦寶石」→ 璀璨寶石）；分數是共同的字數
// 英文：搜尋字的單字是名稱某個單字的開頭（werew → Werewolves），或拼錯在容許範圍內（Splendour → Splendor）；
// 分數是對到的單字數
function nameSimilarity(name, query) {
  const typedHan = hanChars(query)
  const shared = [...hanChars(name)].filter((char) => typedHan.has(char)).length
  const hanScore = shared >= 2 || shared > typedHan.size / 2 ? shared : 0
  const words = latinWords(name)
  const wordScore = latinWords(query).filter((typed) =>
    words.some((word) => wordMatches(typed, word)),
  ).length
  return hanScore + wordScore
}

// 各語言的名稱和別名都比，取最像的那個
const similarity = (game, query) =>
  Math.max(
    ...[...Object.values(game.name), ...game.aliases].map((name) => nameSimilarity(name, query)),
  )

// 先放名稱像的，越像越前面；不夠 limit 款用為你推薦補，不重複。
// 只用在沒結果時的推薦；正式搜尋結果還是只放完全相符的（錯字容錯、同音字下一輪）
export function suggestGames(list, query, signals = {}, limit = 3) {
  const similar = list
    .map((game) => ({ game, score: similarity(game, query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || sorters.popular(a.game, b.game))
    .map(({ game }) => game)
    .slice(0, limit)
  const fill = recommend(list, signals, list.length).filter((game) => !similar.includes(game))
  return [...similar, ...fill].slice(0, limit)
}

// ---------- 篩選沒結果時建議移除哪個條件（PRD 7.3 第 8 條） ----------
// 玩家數、遊玩時間是使用者的現實限制（今晚幾個人、有多少時間），不建議移除；只從偏好裡挑。
// 同一類的標籤是「或」，拿掉其中一個只會更少，所以多選的類別整類一起移除。
// 每類試著拿掉，選多出最多款的；一樣多時照這裡的順序。都救不回來時回傳 null
const RELAXABLE = ['complexity', 'types', 'mechanics', 'themes']

export function relaxFilters(list, filters) {
  const best = RELAXABLE.filter((key) => filters[key]?.length)
    .map((key) => {
      const relaxed = { ...filters, [key]: [] }
      return { key, values: filters[key], games: searchGames(list, { filters: relaxed }) }
    })
    .reduce((top, item) => (item.games.length > (top?.games.length ?? 0) ? item : top), null)
  return best && { key: best.key, values: best.values, count: best.games.length, games: best.games }
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

// 遊戲主畫面的推薦（GAME-13）：只看類型、機制、主題和這款相近的，不含這款本身，5 款（PRD 7.4 第 4、5 條）。
// 和為你推薦同一套算法，把這款當成唯一一筆「玩過」的紀錄
export function getSimilarGames(slug) {
  return fakeRequest(recommend(allGames, { played: [slug] }, 5))
}

// 首頁主視覺（HOME-01）：廣告版位，人工指定，所以不用算的
export function getFeaturedGame() {
  return getGame('zombicide-2e')
}

// 首頁中段精選橫幅（HOME-09）：和主視覺一樣是人工指定的廣告版位
export function getPromoGame() {
  return getGame('distilled')
}

// 為你推薦用的三種紀錄
function currentSignals() {
  return {
    played: me.playHistory.map((item) => item.gameSlug),
    favorites: loadStored('bga:favorites', initialFavorites),
    viewed: loadStored('bga:recently-viewed', []),
  }
}

export function getHomeSections() {
  return fakeRequest(scenario() === 'empty' ? [] : homeSections(allGames, currentSignals()))
}

export function getSearchSuggestions(query) {
  return fakeRequest(suggestGames(allGames, query, currentSignals()))
}

// 篩選沒結果時的建議：remove 是建議移除的條件和多出幾款；games 是替代推薦 3 款
// （移除後最熱門的；沒有可以移除的條件時用為你推薦）
export function getFilterSuggestion(filters) {
  const relaxed = relaxFilters(allGames, filters)
  return fakeRequest({
    remove: relaxed && { key: relaxed.key, values: relaxed.values, count: relaxed.count },
    games: relaxed ? relaxed.games.slice(0, 3) : recommend(allGames, currentSignals(), 3),
  })
}

// 收藏、牌桌要用遊戲資料時從這裡拿，不重複存
export function findGame(slug) {
  return allGames.find((game) => game.slug === slug) ?? null
}
