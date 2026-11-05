# 資料模型

第一階段的假資料照這份寫；第二階段換 Supabase 時，每一種資料變成一張資料表，欄位不變。規則的正本在 Notion「產品規則」和「PRD｜找遊戲到加入牌桌」，這裡只寫資料長什麼樣子。

## 原則

- **能算出來的不存**：「存」是寫進資料裡（假資料檔案，之後是 Supabase 的欄位）。首頁分區、遊玩時間的級距、為你推薦不寫進資料，畫面要用時從遊戲的欄位算出來
- **名稱依語言顯示**：存各語言的官方名稱，畫面只顯示目前語言的；沒有官方中文名的遊戲顯示英文名。搜尋時所有名稱和別名一起比對
- **用代稱（slug）當主鍵**：遊戲用 `kingdomino` 這種英文代稱，網址（`/game/kingdomino`）和圖片檔名都用它
- **選項存代號，畫面再換成中文**：例如複雜度存 `casual`，顯示「休閒小品」。改文案不用改資料
- **時間存 ISO 字串**：`2026-11-05T10:30:00+08:00`，畫面再換成「15 分鐘前」

## 遊戲 `Game`

| 欄位 | 型別 | 例子 | 用在 |
| --- | --- | --- | --- |
| `slug` | string | `kingdomino` | 網址、圖片檔名 |
| `name` | `{ 'zh-TW', en }` | `{ 'zh-TW': '璀璨寶石', en: 'Splendor' }` | 顯示目前語言的；沒有 `zh-TW` 時顯示 `en`。搜尋時兩個都比對 |
| `aliases` | string[] | `['寶石商人']` | 只給搜尋用，不顯示（SRCH-03） |
| `images` | `{ box, banner, logo }` | 圖片網址；沒有的是 `null` | 卡片、遊戲頁、主視覺 |
| `accentColor` | string | `#cd4636` | 主視覺「立即遊玩」的顏色。不手動填，`npm run images` 從橫幅算出來（ADR 0014），沒有橫幅是品牌藍 |
| `players` | `{ min, max }` | `{ min: 2, max: 4 }` | 卡片「2-4 人」、玩家數篩選 |
| `duration` | number（分鐘） | `15` | 卡片「15 分鐘」、時間篩選、排序 |
| `complexity` | `casual` \| `standard` \| `deep` | `casual` | 複雜度篩選、首頁分區 |
| `types` | string[]（特定類型） | `['family', 'classic']` | 篩選、標籤、首頁分區 |
| `mechanics` | string[]（機制） | `['tile-placement']` | 篩選、標籤 |
| `themes` | string[]（主題） | `['medieval']` | 篩選、標籤 |
| `isPremium` | boolean | `false` | VIP 標記 |
| `description` | string | 自己寫；長短都有，分段用 `\n\n` | 遊戲頁簡介、卡片懸停 |
| `releasedAt` | string（日期） | `2025-03-12` | 「最新上線」排序 |
| `playsLast30Days` | number | `48210` | 「現正熱門」、預設排序 |
| `totalPlays` | number | `2310455` | 遊戲資訊「遊戲場數」 |
| `credits` | `{ designers, artists, publisher, year, developer }` | | 遊戲資訊 |
| `versions` | `{ version, date, notes }[]` | | 版本更新紀錄 |
| `rules` | `{ title, sizeMB }[]` | `{ title: '繁體中文官方手冊', sizeMB: 12 }` | 規則手冊卡片 |
| `videos` | `{ title, kind }[]` | `kind`：`tutorial` \| `strategy` | 影音教學 |

**不存、用算的**：

| 算什麼 | 怎麼算 |
| --- | --- |
| 遊玩時間級距 | `duration` ≤ 15 簡短、16～30 長度適中、> 30 耗時 |
| 首頁「輕鬆小品」「適合深度玩家」 | `complexity` 是 `casual`、`deep` |
| 首頁「經典遊戲」「適合家庭」 | `types` 包含 `classic`、`family` |
| 首頁「最新上線」「現正熱門」 | 依 `releasedAt`、`playsLast30Days` 排序 |
| 為你推薦 | 和收藏、遊玩紀錄的 `types`／`mechanics`／`themes` 重疊最多的遊戲；沒有紀錄時用熱門 |

### 選項代號

| 類別 | 代號 → 顯示文字 |
| --- | --- |
| 複雜度 | `casual` 休閒小品、`standard` 適合一般玩家、`deep` 適合深度玩家 |
| 特定類型 | `party` 派對遊戲、`family` 家庭、`original` 原創、`classic` 經典、`turn-based` 回合制遊玩推薦、`board-sim` 棋盤模擬、`realtime` 即時制遊玩推薦、`award` 得獎遊戲、`mobile` 手機遊玩推薦 |
| 機制 | `coop` 合作、`social-deduction` 社交推理、`bluffing` 吹牛、`push-your-luck` 推運氣、`engine-building` 引擎構築、`set-collection` 收集組合、`tile-placement` 拼放板塊、`roll-and-write` 翻牌劃記、`dice` 擲骰、`area-control` 區域控制、`deduction` 推理 |
| 主題 | `zombie` 殭屍恐怖、`sci-fi` 科幻太空、`fantasy` 奇幻、`medieval` 中世紀、`nature` 動物自然、`city` 城市交通、`detective` 偵探、`economy` 經濟貿易、`food` 美食飲品、`abstract` 抽象 |

## 開放桌 `OpenTable`

| 欄位 | 型別 | 例子 | 用在 |
| --- | --- | --- | --- |
| `id` | string | `t-1024` | |
| `gameSlug` | string | `werewolves` | 遊戲名稱、封面 |
| `host` | `{ name, avatar }` | | 桌主 |
| `mode` | `simple` \| `arena` | | 遊戲模式篩選（簡易、競技場） |
| `pace` | `realtime` \| `turn` | | 遊戲制度篩選；回合制才有「你的回合！」 |
| `settings` | string[] | `['基礎版', '10 分鐘局', '隨機']` | 依序：版本、時間限制、座位；顯示時用「／」串接 |
| `seats` | `{ taken, max }` | `{ taken: 14, max: 15 }` | 「14/15 人」 |
| `estimatedWaitMinutes` | number \| null | `13` | 「約 13 分鐘」；`null` 顯示「—」 |
| `createdAt` | string（時間） | | 「15 分鐘前」、預設排序 |
| `status` | `waiting` \| `full` | | 已額滿 |

已開始、已取消的牌桌不在列表裡，所以沒有這兩種狀態。

## 我的牌桌 `MyTable`

| 欄位 | 型別 | 說明 |
| --- | --- | --- |
| `tableId` | string | 對到開放桌的 `id`，遊戲、桌主、設定都從那裡來 |
| `status` | `queued` \| `playing` | 排隊中、進行中 |
| `isMyTurn` | boolean | 只有 `pace` 是 `turn` 時才可能是 `true` |
| `joinedAt` | string（時間） | |

## 收藏

存成遊戲代稱的清單 `string[]`，新收藏的放在最前面，畫面照順序顯示，最新的在最上面。不存收藏時間。

畫面從 Pinia 的 `useFavoritesStore`（`src/stores/favorites.js`）讀，不直接呼叫 API：首頁卡片、遊戲主畫面、收藏面板同一份。加入、取消用樂觀更新，失敗時改回原狀並提示「操作失敗，請再試一次」。

## 最近看過

進遊戲主畫面就記一筆，給「為你推薦」用（PRD 7.1 第 8 條）。存成遊戲代稱的清單 `string[]`，新的放最前面、同一款只留一筆，最多 20 筆。

為你推薦的權重：玩過 ×3、收藏 ×2、看過 ×1，乘上和那款遊戲相同的類型、機制、主題個數後加總。玩過、收藏的不再推薦。

## 我 `Me`

本輪都是登入狀態，只有一位使用者。

| 欄位 | 型別 | 例子 |
| --- | --- | --- |
| `name` | string | |
| `avatar` | string | 圖片網址 |
| `isPremium` | boolean | 尊榮標記 |
| `reputation` | number（0～100） | `80` →「80 / 100」 |
| `rank` | number | 排行榜名次 |
| `statusMessage` | string | 空字串時顯示預設文字 |
| `playHistory` | `{ gameSlug, playedAt }[]` | 遊玩紀錄 |

## 排行榜 `LeaderboardEntry`

全站排行榜，首頁顯示前 6 名和自己。

| 欄位 | 型別 | 例子 |
| --- | --- | --- |
| `rank` | number | `1` |
| `name` | string | 虛構的玩家名稱 |
| `avatar` | string | |
| `countryCode` | string | `TW`（ISO 3166-1，國旗用 `flag-icons`，ADR 0009） |
| `score` | number | `9980000` →「9.98M PX」 |

## 假資料放哪裡

| 資料 | 放法 |
| --- | --- |
| 遊戲、排行榜、我 | 寫在 `src/api/data/`，固定不變 |
| 開放桌 | 寫在 `src/api/data/`；每 10 秒刷新時，假 API 隨機改人數、讓幾桌變成已額滿 |
| 收藏、我的牌桌、最近看過 | 存在 localStorage，模擬伺服器；重新整理還在 |

畫面只呼叫 `src/api/` 的函式，不直接 import 資料（ADR 0005）。網址加 `?scenario=slow`、`error`、`empty` 可以看到載入中、失敗、空的。

## 圖片

原圖放在 `design-source/games/`（不進 git），命名 `代稱_banner`、`代稱_box`、`代稱_logo`。壓縮成 WebP 後放進 `src/assets/images/games/`，只有壓縮過的進 repo 和網站。

頭像（排行榜、桌主）是 8 張 Unsplash 的動物照片，原圖和來源在 `design-source/avatars/`，壓縮後放 `src/assets/images/avatars/`，由 `src/api/data/people.js` 輪流分配。自己的頭像是 `avatar-demo.jpg`。
