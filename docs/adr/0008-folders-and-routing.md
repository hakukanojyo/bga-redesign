# 0008. 資料夾結構與路由

- 狀態：已採用
- 日期：2026-11-03

## 背景

開始做版面骨架，需要決定頁面、版型、元件各放哪裡，以及每一頁的網址。

## 決定

資料夾：

| 資料夾 | 放什麼 |
| --- | --- |
| `src/views/` | 一個網址一個頁面元件，名稱 `XxxView.vue` |
| `src/layouts/` | 整頁版型（頂部、內容、側欄、頁尾），目前只有 `AppLayout.vue` |
| `src/components/layout/` | 版型用的元件：`AppHeader`、`FindTableButton`、右側欄（`SideRail`）、底部導覽列（`BottomNav`）、側欄面板（`SidePanel`），之後的頁尾 |
| `src/components/` | 其他共用元件 |
| `src/assets/images/`、`src/assets/icons/` | 從 Figma 匯出的圖片、圖示 |

路由（`src/router/index.js`）：

| 網址 | 頁面 |
| --- | --- |
| `/` | 首頁 |
| `/search` | 搜尋結果 |
| `/game/:slug` | 遊戲主畫面，用遊戲的英文代稱（例：`/game/avalon`，見 PRD 7.9） |
| `/tables` | 尋找開放桌 |
| `/news`、`/forum` | 佔位頁 |

- 用 HTML5 history 模式（網址沒有 `#`），部署時伺服器要把找不到的網址都回傳 `index.html`
- 首頁直接載入，其他頁面用 `() => import()` 分開打包，用到才下載
- 每頁在 `meta.title` 寫標題，換頁時更新分頁標題；換頁捲回頂端，按上一頁回到原本的位置

## 考慮過的選項

- **頁面放 `pages/`**：Nuxt 的慣例；這裡用 Vue Router 自己設定路由，沿用 create-vue 和 Vue 官方範例的 `views/`
- **遊戲網址用編號**（`/game/123`）：比較好查資料，但網址看不出是哪款遊戲，也不好分享

## 代價

`/game/:slug` 要保證每款遊戲的代稱不重複；資料模型（第 8 步）要有這個欄位。
