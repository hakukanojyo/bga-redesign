import { modeLabels, paceLabels } from '@/api/data/options'

// 全站統一的資料格式（產品規則 6.6）：每個畫面都用這裡的函式，不各自組字串

export function formatPlayers({ min, max }) {
  return min === max ? `${min} 人` : `${min}-${max} 人`
}

export function formatDuration(minutes) {
  return `${minutes} 分鐘`
}

// 預估等待是估算值，加「約」；沒有資料顯示「—」
export function formatWait(minutes) {
  return minutes == null ? '—' : `約 ${minutes} 分鐘`
}

export function formatSettings(settings) {
  return settings.join('／')
}

// 牌桌的制度、模式加設定（2026-11-06）：「回合制／簡易／基礎版／10 分鐘局／隨機」。
// 制度和模式會影響要不要選這桌，一律寫出來，不管篩選選了什麼。尋找開放桌、遊戲頁的開放桌、我的牌桌都用這個
export function formatTableInfo({ pace, mode, settings }) {
  return formatSettings([paceLabels[pace], modeLabels[mode], ...settings].filter(Boolean))
}

export function formatSeats({ taken, max }) {
  return `${taken}/${max} 人`
}

// 排行榜積分：9980000 → 9.98M PX
export function formatScore(score) {
  if (score < 1_000_000) return `${score} PX`
  return `${Number((score / 1_000_000).toFixed(2))}M PX`
}

// 開桌時間（產品規則 6.6）：近的用相對時間，7 天以上換成日期，不用自己換算「32 天前」是哪天
// 剛剛、15 分鐘前、3 小時前、2 天前、11/05
export function formatTimeAgo(iso, now = Date.now()) {
  const minutes = Math.max(0, Math.floor((now - Date.parse(iso)) / 60000))
  if (minutes < 1) return '剛剛'
  if (minutes < 60) return `${minutes} 分鐘前`
  if (minutes < 60 * 24) return `${Math.floor(minutes / 60)} 小時前`
  const days = Math.floor(minutes / 60 / 24)
  if (days < 7) return `${days} 天前`
  const date = new Date(iso)
  return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`
}

// 國家代碼 → 目前語言的國名（TW → 台灣）；瀏覽器內建，不用自己存國名表
const regionNames = new Intl.DisplayNames(['zh-TW'], { type: 'region' })

export function formatCountry(code) {
  return regionNames.of(code)
}

// 檔案大小：12 → 12 MB（數字和英文之間空半形）
export function formatFileSize(mb) {
  return `${mb} MB`
}

// 遊戲場數：2310455 → 2,310,455 場
export function formatPlays(count) {
  return `${count.toLocaleString('zh-TW')} 場`
}

// 版本紀錄標題：版本 1.4.2（2026-10-28）
export function formatVersion({ version, date }) {
  return `版本 ${version}（${date}）`
}
