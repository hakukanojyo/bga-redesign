// 開放桌的假資料：用固定的規則產生，每次載入都一樣，測試也才固定
import { hosts } from './people'

// 每款遊戲的版本選項（設定的第一項）
const editions = {
  werewolves: ['基礎版', '新月擴充'],
  splendor: ['基礎版', '城市擴充'],
  'terraforming-mars': ['基礎版', '前奏擴充'],
  catan: ['基礎版', '航海家擴充'],
}

const tableGames = [
  'werewolves',
  'splendor',
  'kingdomino',
  'sky-team',
  'zombicide-2e',
  'terraforming-mars',
  'catan',
  'skull',
  'wingspan',
  'cant-stop',
  'zenith',
  'patchwork',
]

const timeLimits = ['10 分鐘局', '15 分鐘局', '慢速局', '每步 1 分鐘']
const seating = ['隨機', '依加入順序']

// 2026-11-05 10:00（台灣時間）往前推，每桌差 3 分鐘
const base = Date.parse('2026-11-05T10:00:00+08:00')

// 40 桌：前 4 款遊戲（狼人、璀璨寶石、多米諾王國、Sky Team）各有 4 桌，遊戲頁才看得到「查看全部 N 桌」
export const openTables = Array.from({ length: 40 }, (_, i) => {
  const gameSlug = tableGames[i % tableGames.length]
  // 每輪完一次遊戲就錯開一格，同一款遊戲才會有不同的模式和制度
  const round = Math.floor(i / tableGames.length)
  const max =
    gameSlug === 'werewolves' ? 15 : gameSlug === 'sky-team' || gameSlug === 'patchwork' ? 2 : 4
  const taken = Math.max(1, max - 1 - (i % 3))
  return {
    id: `t-${1000 + i}`,
    gameSlug,
    host: hosts[i % hosts.length],
    mode: (i + round) % 4 === 3 ? 'arena' : 'simple',
    pace: (i + round) % 3 === 2 ? 'turn' : 'realtime',
    settings: [
      (editions[gameSlug] ?? ['基礎版'])[i % 2] ?? '基礎版',
      timeLimits[i % timeLimits.length],
      seating[i % 2],
    ],
    seats: { taken, max },
    // 每 5 桌有一桌沒資料，顯示「—」
    estimatedWaitMinutes: i % 5 === 4 ? null : 3 + ((i * 7) % 20),
    createdAt: new Date(base - i * 3 * 60 * 1000).toISOString(),
    status: 'waiting',
  }
})

// 我的牌桌一開始就有的幾桌（另外加入的存在 localStorage）
export const initialMyTables = [
  { tableId: 't-1002', status: 'playing', isMyTurn: true, joinedAt: '2026-11-04T20:00:00+08:00' },
  { tableId: 't-1005', status: 'playing', isMyTurn: false, joinedAt: '2026-11-04T18:30:00+08:00' },
  { tableId: 't-1009', status: 'queued', isMyTurn: false, joinedAt: '2026-11-05T09:40:00+08:00' },
]

export const initialFavorites = ['werewolves', 'splendor', 'sky-team']
