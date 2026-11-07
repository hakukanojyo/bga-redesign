// 選項的代號 → 顯示文字（docs/data-model.md「選項代號」）。資料只存代號，改文案只改這裡
export const complexityLabels = {
  casual: '休閒小品',
  standard: '適合一般玩家',
  deep: '適合深度玩家',
}

export const typeLabels = {
  party: '派對遊戲',
  family: '家庭',
  original: '原創',
  classic: '經典',
  'turn-based': '回合制遊玩推薦',
  'board-sim': '棋盤模擬',
  realtime: '即時制遊玩推薦',
  award: '得獎遊戲',
  mobile: '手機遊玩推薦',
}

export const mechanicLabels = {
  coop: '合作',
  'social-deduction': '社交推理',
  bluffing: '吹牛',
  'push-your-luck': '推運氣',
  'engine-building': '引擎構築',
  'set-collection': '收集組合',
  'tile-placement': '拼放板塊',
  'roll-and-write': '翻牌劃記',
  dice: '擲骰',
  'area-control': '區域控制',
  deduction: '推理',
}

export const themeLabels = {
  zombie: '殭屍恐怖',
  'sci-fi': '科幻太空',
  fantasy: '奇幻',
  medieval: '中世紀',
  nature: '動物自然',
  city: '城市交通',
  detective: '偵探',
  economy: '經濟貿易',
  food: '美食飲品',
  abstract: '抽象',
}

// 玩家數篩選（FILT-01）：範圍有重疊就算符合
export const playerOptions = {
  1: { label: '1 人[單人模式]', min: 1, max: 1 },
  2: { label: '2 人[對決模式]', min: 2, max: 2 },
  '3-5': { label: '3-5 人', min: 3, max: 5 },
  '6-9': { label: '6-9 人', min: 6, max: 9 },
  '10+': { label: '10+人', min: 10, max: Infinity },
}

// 遊玩時間篩選（FILT-02）：簡短 ≤15、長度適中 16～30、耗時 >30
export const timeOptions = {
  short: { label: '簡短', min: 0, max: 15 },
  medium: { label: '長度適中', min: 16, max: 30 },
  long: { label: '耗時[>30 分鐘]', min: 31, max: Infinity },
}

export const modeLabels = { simple: '簡易', arena: '競技場' }
export const paceLabels = { realtime: '即時制', turn: '回合制' }

// 尋找開放桌的排序（TABLE-05）：第一個是預設；代號和 src/api/tables.js 的 sorters 一樣
export const tableSortLabels = {
  newest: '依開桌時間：新至舊',
  wait: '等候時間：短到長',
  'almost-full': '即將額滿優先',
}

// 搜尋結果的排序（SRCH-05）：第一個是預設
export const sortLabels = {
  popular: '依熱門程度排序',
  newest: '最新上線',
  duration: '遊玩時間：短到長',
  name: '遊戲名稱',
}

// 篩選的六類（PRD 7.3），順序照 Figma 左欄。key 和 matchesFilters 的參數、網址參數同名；
// color 對應 tokens.css 的 filter-*；multiple：標籤可多選（同一類裡是「或」），不然是單選
export const filterCategories = [
  {
    key: 'players',
    title: '玩家數',
    color: 'players',
    multiple: false,
    labels: Object.fromEntries(
      Object.entries(playerOptions).map(([key, { label }]) => [key, label]),
    ),
  },
  {
    key: 'time',
    title: '遊玩時間',
    color: 'time',
    multiple: false,
    labels: Object.fromEntries(Object.entries(timeOptions).map(([key, { label }]) => [key, label])),
  },
  {
    key: 'complexity',
    title: '遊戲複雜度',
    color: 'complexity',
    multiple: false,
    labels: complexityLabels,
  },
  {
    key: 'mechanics',
    title: '遊戲機制',
    color: 'mechanics',
    multiple: true,
    labels: mechanicLabels,
  },
  { key: 'themes', title: '主題', color: 'topic', multiple: true, labels: themeLabels },
  { key: 'types', title: '特定類型', color: 'type', multiple: true, labels: typeLabels },
]
