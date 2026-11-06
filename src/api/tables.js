import { fakeRequest, loadStored, saveStored, scenario } from './fake'
import { findGame, matchesQuery } from './games'
import { games } from './data/games'
import { initialMyTables, makeTable, openTables } from './data/tables'

const KEY = 'bga:myTables'

// 開放桌每 10 秒刷新（TABLE-06），模擬真的網站：
// - 有幾桌人數加一，坐滿就變已額滿；已額滿的下一次刷新消失
// - 一直有人開新桌：每次補上消失的桌數，再多或少一桌，總數在 34～46 之間起伏，不會越刷越少
let refreshCount = 0
let nextIndex = openTables.length
const current = structuredClone(openTables)
// 開過的每一桌（含刷新時新開的），我的牌桌用來查遊戲、桌主、設定；開放桌列表拿掉的還查得到
const known = new Map(openTables.map((table) => [table.id, table]))

function simulateRefresh() {
  refreshCount += 1
  let removed = 0
  for (let i = current.length - 1; i >= 0; i -= 1) {
    const table = current[i]
    if (table.status === 'full') {
      current.splice(i, 1)
      removed += 1
    } else if ((i + refreshCount) % 6 === 0) {
      table.seats.taken = Math.min(table.seats.max, table.seats.taken + 1)
      if (table.seats.taken === table.seats.max) table.status = 'full'
    }
  }
  const wanted = removed + ((refreshCount % 3) - 1)
  const target = Math.min(46, Math.max(34, current.length + wanted))
  while (current.length < target) {
    // 剛開的桌只有桌主一個人
    const table = makeTable(nextIndex, new Date().toISOString())
    table.seats.taken = 1
    current.push(table)
    known.set(table.id, table)
    nextIndex += 1
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

const joinedIds = () => loadStored(KEY, initialMyTables).map((item) => item.tableId)

// 尋找開放桌一次拿幾桌（#40，載入更多）
export const TABLES_PAGE_SIZE = 20

// 分批拿（PRD 7.5）：從第 offset 桌開始拿 limit 桌，另外回傳總共幾桌（「還有 N 桌」、標題的「共 N 個結果」）。
// 第二階段接 Supabase 時對應 range(offset, offset + limit - 1) 和 count。
// refresh：自動刷新時傳 true，假資料才會變化。自己已經加入的不放進來（它在我的牌桌裡，2026-11-06）
export function getOpenTables(
  params,
  { refresh = false, offset = 0, limit = TABLES_PAGE_SIZE } = {},
) {
  if (refresh) simulateRefresh()
  const mine = joinedIds()
  const list =
    scenario() === 'empty'
      ? []
      : filterTables(
          current.filter((table) => !mine.includes(table.id)),
          params,
        )
  return fakeRequest({ total: list.length, tables: list.slice(offset, offset + limit) })
}

// 尋找開放桌沒有結果時，是哪一種（PRD 7.5 第 8、9 條、#40）：
// - no-game：搜尋字對不到任何遊戲（TABLE-12）
// - no-tables：遊戲有，但不管篩選都沒有開放桌（TABLE-11）
// - filtered：有開放桌，但被遊戲模式、制度篩光了
export function emptyReason({ query = '' } = {}) {
  if (query && !games.some((game) => matchesQuery(game, query))) return 'no-game'
  const mine = joinedIds()
  const open = current.filter((table) => !mine.includes(table.id))
  return filterTables(open, { query }).length ? 'filtered' : 'no-tables'
}

export function getEmptyReason(params) {
  return fakeRequest(scenario() === 'empty' ? 'no-tables' : emptyReason(params))
}

// 遊戲主畫面的開放桌（GAME-07、PRD 7.4）：這款遊戲最新開的 3 桌＋總共幾桌。
// 自己已經加入的不放進來：它在我的牌桌裡，留在列表上也不能再加入
export const GAME_TABLES_LIMIT = 3

export function getGameTables(slug, { refresh = false } = {}) {
  if (refresh) simulateRefresh()
  const mine = joinedIds()
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

// 進行中的順序（MYTBL-04，2026-11-06）：現在需要你的在前——輪到你的回合制 → 即時制 → 其他回合制；同一組新加入的在前
const urgency = (row) => (row.isMyTurn ? 0 : row.table.pace === 'realtime' ? 1 : 2)
const byUrgency = (a, b) => urgency(a) - urgency(b) || b.joinedAt.localeCompare(a.joinedAt)

// 我的牌桌（MYTBL）
export function getMyTables() {
  const mine = scenario() === 'empty' ? [] : loadStored(KEY, initialMyTables)
  const rows = mine
    .map((item) => {
      const table = known.get(item.tableId)
      return table ? { ...item, table: withGame(table) } : null
    })
    .filter(Boolean)
  return fakeRequest({
    playing: rows.filter((row) => row.status === 'playing').sort(byUrgency),
    queued: rows
      .filter((row) => row.status === 'queued')
      .sort((a, b) => b.joinedAt.localeCompare(a.joinedAt)),
  })
}

export function leaveTable(tableId) {
  saveStored(
    KEY,
    loadStored(KEY, initialMyTables).filter((item) => item.tableId !== tableId),
  )
  return fakeRequest({ tableId })
}
