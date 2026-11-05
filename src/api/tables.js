import { fakeRequest, loadStored, saveStored, scenario } from './fake'
import { findGame, matchesQuery } from './games'
import { initialMyTables, openTables } from './data/tables'

const KEY = 'bga:myTables'

// 開放桌每 10 秒刷新（TABLE-06）：每刷新一次，有幾桌人數加一，坐滿就變已額滿；已額滿的下一次刷新消失
let refreshCount = 0
const current = structuredClone(openTables)

function simulateRefresh() {
  refreshCount += 1
  for (let i = current.length - 1; i >= 0; i -= 1) {
    const table = current[i]
    if (table.status === 'full') current.splice(i, 1)
    else if ((i + refreshCount) % 6 === 0) {
      table.seats.taken = Math.min(table.seats.max, table.seats.taken + 1)
      if (table.seats.taken === table.seats.max) table.status = 'full'
    }
  }
}

const withGame = (table) => ({ ...table, game: findGame(table.gameSlug) })

// 排序（TABLE-05）：預設開桌時間新到舊；沒有預估等待的排最後
const sorters = {
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  wait: (a, b) => (a.estimatedWaitMinutes ?? Infinity) - (b.estimatedWaitMinutes ?? Infinity),
  'almost-full': (a, b) => a.seats.max - a.seats.taken - (b.seats.max - b.seats.taken),
}

export function filterTables(list, { query = '', mode = [], pace = [], sort = 'newest' } = {}) {
  return list
    .map(withGame)
    .filter(
      (table) =>
        matchesQuery(table.game, query) &&
        (!mode.length || mode.includes(table.mode)) &&
        (!pace.length || pace.includes(table.pace)),
    )
    .sort(sorters[sort] ?? sorters.newest)
}

// ---------- 畫面呼叫的函式 ----------

// refresh：自動刷新時傳 true，假資料才會變化
export function getOpenTables(params, { refresh = false } = {}) {
  if (refresh) simulateRefresh()
  return fakeRequest(scenario() === 'empty' ? [] : filterTables(current, params))
}

// 遊戲主畫面的開放桌（GAME-07、PRD 7.4）：這款遊戲最新開的 3 桌＋總共幾桌。
// 自己已經加入的不放進來：它在我的牌桌裡，留在列表上也不能再加入
export const GAME_TABLES_LIMIT = 3

export function getGameTables(slug, { refresh = false } = {}) {
  if (refresh) simulateRefresh()
  const mine = loadStored(KEY, initialMyTables).map((item) => item.tableId)
  const list =
    scenario() === 'empty'
      ? []
      : current
          .filter((table) => table.gameSlug === slug && !mine.includes(table.id))
          .map(withGame)
          .sort(sorters.newest)
  return fakeRequest({ total: list.length, tables: list.slice(0, GAME_TABLES_LIMIT) })
}

// 加入這桌（TABLE-07、08）：已額滿或已經在我的牌桌就失敗；成功後放進排隊中
export async function joinTable(tableId) {
  const table = current.find((item) => item.id === tableId)
  const mine = loadStored(KEY, initialMyTables)
  if (!table || table.status === 'full') {
    await fakeRequest(null)
    throw Object.assign(new Error('牌桌已滿'), { code: 'full' })
  }
  if (!mine.some((item) => item.tableId === tableId)) {
    mine.unshift({ tableId, status: 'queued', isMyTurn: false, joinedAt: new Date().toISOString() })
    saveStored(KEY, mine)
  }
  return fakeRequest(withGame(table))
}

// 我的牌桌（MYTBL）：進行中把輪到我的排最上面
export function getMyTables() {
  const mine = scenario() === 'empty' ? [] : loadStored(KEY, initialMyTables)
  const rows = mine
    .map((item) => {
      const table = openTables.find((open) => open.id === item.tableId)
      return table ? { ...item, table: withGame(table) } : null
    })
    .filter(Boolean)
  return fakeRequest({
    playing: rows.filter((row) => row.status === 'playing').sort((a, b) => b.isMyTurn - a.isMyTurn),
    queued: rows.filter((row) => row.status === 'queued'),
  })
}

export function leaveTable(tableId) {
  saveStored(
    KEY,
    loadStored(KEY, initialMyTables).filter((item) => item.tableId !== tableId),
  )
  return fakeRequest({ tableId })
}
