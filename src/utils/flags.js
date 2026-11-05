// 國旗（flag-icons，ADR 0009）：資料只存 ISO 3166-1 兩碼（TW），這裡換成圖片網址
// 只打包假資料用到的國家；假資料加了新國家要補進來（測試會檢查）
const flagFiles = import.meta.glob('/node_modules/flag-icons/flags/4x3/{at,br,de,fr,jp,tw}.svg', {
  eager: true,
  import: 'default',
})

export function flagUrl(code) {
  return flagFiles[`/node_modules/flag-icons/flags/4x3/${code.toLowerCase()}.svg`] ?? null
}
