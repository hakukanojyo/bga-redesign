import { fakeRequest, loadStored, saveStored, scenario } from './fake'
import { findGame, matchesQuery } from './games'
import { games } from './data/games'
import { hosts } from './data/people'
import { initialMyTables, makeTable, openTables } from './data/tables'

// v2（2026-11-07）：假資料的規則改過（即時制同時只能進行一桌），換名稱讓瀏覽器裡的舊資料自動作廢，不用手動清
const KEY = 'bga:myTables:v2'

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
  // 即時制同時只能進行一桌（MYTBL-12，2026-11-07）：已經有一桌即時制在對戰，就不能再排即時制——
  // 人在對局裡，人到齊時一定按不到確認，會拖累別桌。回合制不限
  const playingRealtime = mine.some(
    (item) => item.status === 'playing' && known.get(item.tableId)?.pace === 'realtime',
  )
  if (table.pace === 'realtime' && playingRealtime) {
    await fakeRequest(null)
    throw Object.assign(new Error('即時制對戰中'), { code: 'busy' })
  }
  if (!mine.some((item) => item.tableId === tableId)) {
    const now = Date.now()
    mine.unshift({
      tableId,
      status: 'queued',
      isMyTurn: false,
      joinedAt: new Date(now).toISOString(),
      // 假資料：加入後固定 30 秒人到齊（2026-11-06 決定，展示和可用性測試每次都一樣）
      fillsAt: new Date(now + FILL_AFTER_MS).toISOString(),
    })
    saveStored(KEY, mine)
  }
  return fakeRequest(withGame(table))
}

// 進行中的順序（MYTBL-04，2026-11-06）：現在需要你的在前——輪到你的回合制 → 即時制 → 其他回合制；同一組新加入的在前
const urgency = (row) => (row.isMyTurn ? 0 : row.table.pace === 'realtime' ? 1 : 2)
const byUrgency = (a, b) => urgency(a) - urgency(b) || b.joinedAt.localeCompare(a.joinedAt)

// 加入後多久人到齊（MYTBL-11）。一開始就在排隊中的桌沒有 fillsAt，一直排隊，給排隊中示範用
export const FILL_AFTER_MS = 30 * 1000
// 即時制人到齊後要在幾秒內確認（MYTBL-13、#49）
export const CONFIRM_MS = 20 * 1000

// 人到齊、開始等確認。decline 情境：有一位玩家一直不按（holdout），記在桌上，換頁後網址沒有 scenario 也一樣
function startConfirming(item, now) {
  item.status = 'confirming'
  item.confirmBy = new Date(now + CONFIRM_MS).toISOString()
  if (scenario() === 'decline') item.holdout = true
}

// ?scenario=ready、decline：一打開就有一桌即時制等你確認（不用等 30 秒）；decline 是有人一直沒確認
let demoSeeded = false
function seedReadyCheck(mine, now) {
  if (demoSeeded || !['ready', 'decline'].includes(scenario())) return false
  demoSeeded = true
  const taken = new Set(mine.map((item) => item.tableId))
  // 挑 4 人以上的桌，打勾和「共 N 位」比較看得出來
  const table = current.find(
    (item) => item.pace === 'realtime' && item.seats.max >= 4 && !taken.has(item.id),
  )
  if (!table) return false
  const item = { tableId: table.id, isMyTurn: false, joinedAt: new Date(now).toISOString() }
  startConfirming(item, now)
  mine.unshift(item)
  return true
}

// 同桌的其他玩家（假資料）：從桌主名單輪流取，人數是座位數減掉自己。
// 其他人在倒數的前 16 秒內平均分散、陸續確認（展示時看得到打勾一個一個出現）；holdout 時最後一位一直不按
function playersOf(item, now) {
  const table = known.get(item.tableId)
  const count = table.seats.max - 1
  const step = 16000 / count
  const startedAt = Date.parse(item.confirmBy) - CONFIRM_MS
  return Array.from({ length: count }, (_, i) => {
    const host = hosts[(Number(table.id.slice(2)) + i) % hosts.length]
    const player = i < hosts.length ? host : { ...host, name: `${host.name}_${i}` }
    const never = item.holdout && i === count - 1
    return { ...player, confirmed: !never && now >= startedAt + (i + 1) * step }
  })
}

// 等確認的桌怎麼收尾（產品規則 3.2、MYTBL-12、13）：
// - 我按了、其他人也都按了：開始，其他排隊中的即時制自動退出（同時只能進行一桌），退出幾桌記在 autoLeft
// - 時間到我沒按：視同退出，拿掉
// - 時間到我按了但有人沒按：回到排隊中、順位保留，30 秒後再到齊一次
function settleConfirming(mine, now) {
  let changed = false
  for (const item of [...mine]) {
    if (item.status !== 'confirming') continue
    const everyone = playersOf(item, now).every((player) => player.confirmed)
    if (item.accepted && everyone) {
      const others = mine.filter(
        (row) =>
          row !== item &&
          (row.status === 'queued' || row.status === 'confirming') &&
          known.get(row.tableId)?.pace === 'realtime',
      )
      others.forEach((row) => mine.splice(mine.indexOf(row), 1))
      // 假資料：之前進行中的即時制當作已經玩完（能確認進入新的一桌，代表上一桌結束了）。
      // 遊戲結束不在本輪範圍，不拿掉的話每測一次就多一桌進行中的即時制
      mine
        .filter(
          (row) =>
            row !== item && row.status === 'playing' && known.get(row.tableId)?.pace === 'realtime',
        )
        .forEach((row) => mine.splice(mine.indexOf(row), 1))
      Object.assign(item, { status: 'playing', autoLeft: others.length })
      delete item.confirmBy
      delete item.accepted
      delete item.holdout
      changed = true
    } else if (Date.parse(item.confirmBy) <= now) {
      if (item.accepted) {
        Object.assign(item, {
          status: 'queued',
          fillsAt: new Date(now + FILL_AFTER_MS).toISOString(),
        })
        delete item.confirmBy
        delete item.accepted
        delete item.holdout
      } else {
        mine.splice(mine.indexOf(item), 1)
      }
      changed = true
    }
  }
  return changed
}

// 人到齊（產品規則 3.2）：回合制直接開始；即時制先等每個人確認（confirming，20 秒）。存回去，下次拿也一樣
function startFilledTables() {
  const mine = loadStored(KEY, initialMyTables)
  const now = Date.now()
  let changed = seedReadyCheck(mine, now)
  if (settleConfirming(mine, now)) changed = true
  for (const item of mine) {
    if (item.status === 'queued' && item.fillsAt && Date.parse(item.fillsAt) <= now) {
      if (known.get(item.tableId)?.pace === 'realtime') startConfirming(item, now)
      else item.status = 'playing'
      delete item.fillsAt
      changed = true
    }
  }
  if (changed) saveStored(KEY, mine)
  return mine
}

// 我的牌桌（MYTBL）
export function getMyTables() {
  const mine = scenario() === 'empty' ? [] : startFilledTables()
  const rows = mine
    .map((item) => {
      const table = known.get(item.tableId)
      return table ? { ...item, table: withGame(table) } : null
    })
    .filter(Boolean)
  return fakeRequest({
    playing: rows.filter((row) => row.status === 'playing').sort(byUrgency),
    // 等確認的桌還算排隊中（還沒開始）
    queued: rows
      .filter((row) => row.status === 'queued' || row.status === 'confirming')
      .sort((a, b) => b.joinedAt.localeCompare(a.joinedAt)),
    // 等你確認的即時制，先到齊的先問（MYTBL-13）
    confirming: rows
      .filter((row) => row.status === 'confirming')
      .map((row) => ({ ...row, players: playersOf(row, Date.now()) }))
      .sort((a, b) => a.confirmBy.localeCompare(b.confirmBy)),
  })
}

export function leaveTable(tableId) {
  saveStored(
    KEY,
    loadStored(KEY, initialMyTables).filter((item) => item.tableId !== tableId),
  )
  return fakeRequest({ tableId })
}

// 按「進入遊戲」（MYTBL-13）：記下我確認了。其他人都按了才開始，結果由 getMyTables 收尾（settleConfirming）
export async function acceptTable(tableId) {
  const mine = loadStored(KEY, initialMyTables)
  const item = mine.find((row) => row.tableId === tableId && row.status === 'confirming')
  if (!item) {
    await fakeRequest(null)
    throw Object.assign(new Error('已經不在等確認'), { code: 'gone' })
  }
  item.accepted = true
  saveStored(KEY, mine)
  return fakeRequest({ tableId })
}
