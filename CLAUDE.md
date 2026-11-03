# AI 協作規範

給 Claude Code 和其他協作者看的專案規則。專案有改動（工具、流程、資料夾結構、PR 規則）時，要在同一個 PR 裡更新這份文件。

## 這是什麼

重新設計 [Board Game Arena](https://zh.boardgamearena.com/)（BGA）線上桌遊平台的作品集專案，把 Figma 設計稿做成前端網站。

- **範圍**：找遊戲（搜尋、篩選、分類、遊戲主畫面）→ 立即遊玩（尋找開放桌、加入／排隊、我的牌桌），到按下「開始遊戲」之前為止
- **本輪也做**：首頁排行榜
- **佔位頁**：建立對局、新聞、討論區、教學模式、遊戲結束等，用共用的佔位版型，文案「這張桌子還在佈置中」加吉祥物圖片（不用 emoji）。404 頁另外做
- **裝置**：桌面 1440、平板 768，斷點 768／1280。不做手機版：寬度小於 768 時縮放顯示平板版，頂部加 banner

## 技術選擇（已決定）

- Vue 3 ＋ Vite ＋ Vue Router ＋ Pinia，**純 JavaScript，不用 TypeScript**
- 套件管理器 npm，Node.js 24 LTS
- Tailwind CSS v4：Figma 的 Semantic 變數轉成 CSS token
- 元件只有兩種：
  - **shadcn-vue**（底層 Reka UI）：只用在行為複雜的元件（Modal、Select、Toast、Bottom Sheet），樣式改成設計稿的樣子
  - **自己寫的**：其他元件照 Figma 寫
- 資料：第一階段用假資料，畫面只透過 `src/api/` 拿資料；第二階段換 Supabase
- Pinia 預計放：收藏、我的牌桌、篩選條件
- 遊戲資料從 BGA 取 20–30 款，遵守 robots.txt 和使用條款，頁尾標註版權
- 之後加：ESLint、Prettier、Vitest、Storybook

## 資料在哪（正本）

規則只寫在正本，這裡和 issue 只放連結，不重抄。

| 資料 | 位置 |
|---|---|
| 功能清單（功能編號、優先級、規則） | Google 試算表，檔名有 `_real` 的是新版 |
| PRD | Notion「產品規則（共用）」、「PRD｜找遊戲到加入牌桌」（撰寫中） |
| 設計決策 | Notion「Design Decision Record」 |
| 顏色／尺寸變數規則 | Notion「顏色變數規則」 |
| 設計稿 | Figma fileKey `YLgv7ISZngFsPRMqVxs8Aj`：hifi 頁 `303:395`、Components 頁 `539:1140` |
| 設計交接 | Notion「交接｜Stage 9 Mockup 進度」 |

## 工作方式

1. 一次只做一步，做完說明改了什麼、為什麼、怎麼確認
2. 改動盡量小，跟著現有的寫法，不要過度設計；註解只寫不明顯的地方
3. 只在明確要求時才 commit，絕不 force-push 到 `main`
4. 回覆用繁體中文
5. 文案：中文與英文、數字之間加半形空格（例：2-4 人、BGA 桌遊）

## 寫程式的規則

- 顏色只用 Semantic token，不直接用 Primitives（規則見「顏色變數規則」）
- 畫面不直接 import 假資料，一律透過 `src/api/`
- 跨頁面共用的資料放 Pinia（`src/stores/`），只有一頁用的放元件裡

## Git 與 PR 規則

| 規則 | 狀態 |
|---|---|
| 分支命名：`feat/`、`fix/`、`chore/`、`docs/`、`refactor/` 加內容，可以帶 issue 編號（例：`feat/12-search-bar`） | 使用中 |
| Commit 用 [Conventional Commits](https://www.conventionalcommits.org/)，英文、簡短（例：`feat: add search bar`） | 使用中 |
| Issue 標題帶功能編號（例：`[FIND-03] 搜尋列`），內容連到功能清單或 PRD | 尚未開始 |
| 每個改動都開 PR，由 reviewer 看過再合併 | 使用中 |
| PR 範本 | 尚未設定 |
| CI：PR 自動跑 lint、test、build | 尚未設定 |
| 分支保護、只允許壓縮合併（squash merge） | 尚未設定 |
| 功能 PR 合進 `develop`，再從 `develop` 開 release PR 合進 `main` | 尚未設定（目前 PR 直接合進 `main`） |

## 目前進度

- ✅ 用 create-vue 建立專案（Router、Pinia）
- ⏳ AI 協作規範、README
- 接下來：Prettier、ESLint、Vitest、CI 各一個 PR → GitHub 設定（PR 範本、分支保護、壓縮合併、`develop`）→ 設計 token、路由、版面骨架、佔位頁 → PRD 完成後定資料模型，再寫 Pinia store 和頁面功能
