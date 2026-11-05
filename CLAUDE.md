# AI 協作規範

給 Claude Code 和其他協作者看的專案規則。專案有改動（工具、流程、資料夾結構、PR 規則）時，要在同一個 PR 裡更新這份文件。

## 這是什麼

重新設計 [Board Game Arena](https://zh.boardgamearena.com/)（BGA）線上桌遊平台的作品集專案，把 Figma 設計稿做成前端網站。

- **範圍**：找遊戲（搜尋、篩選、分類、遊戲主畫面）→ 立即遊玩（尋找開放桌、加入／排隊、我的牌桌），到按下「開始遊戲」之前為止
- **本輪也做**：首頁排行榜
- **佔位頁**：建立對局、新聞、討論區、教學模式、遊戲結束等，用共用的佔位版型，文案「這張桌子還在佈置中」加吉祥物圖片（不用 emoji）。404 頁另外做
- **裝置**：桌面 1440、平板 768，斷點 768／1280。不做手機版：寬度小於 768 時縮放顯示平板版，頂部加 banner

## 技術選擇（已決定）

每項的理由、考慮過的選項和代價見 `docs/adr/`。

- Vue 3 ＋ Vite ＋ Vue Router ＋ Pinia，**純 JavaScript，不用 TypeScript**
- 套件管理器 npm，Node.js 24 LTS
- Tailwind CSS v4：Figma 的 Semantic 變數轉成 CSS token
- 元件只有兩種：
  - **shadcn-vue**（底層 Reka UI）：只用在行為複雜的元件（Modal、Select、Toast、Bottom Sheet），樣式改成設計稿的樣子。放在 `src/components/ui/`；用 CLI 加元件後先看 `git status`，還原它改的 `style.css`、拿掉用不到的套件（例：`@lucide/vue`），內建圖示換成 Font Awesome。例外：桌面側欄面板是變形動畫，用原生 `<dialog>`（見 `docs/adr/0010`）
  - **自己寫的**：其他元件照 Figma 寫
- 資料：第一階段用假資料，畫面只透過 `src/api/` 拿資料；第二階段換 Supabase
- 遊戲圖片：原圖放 `design-source/games/`（不進 git），`npm run images` 用 sharp 壓縮成 WebP 到 `src/assets/images/games/`（`docs/adr/0013`），同時從橫幅算出「立即遊玩」的顏色（`colors.json`，`docs/adr/0014`）
- 頭像：Unsplash 的動物照片，原圖和來源在 `design-source/avatars/`；國旗用 `flag-icons`，`src/utils/flags.js` 換成網址
- Pinia：收藏（`src/stores/favorites.js`）；之後放我的牌桌、篩選條件
- 遊戲資料從 BGA 取 20–30 款，遵守 robots.txt 和使用條款，README 和作品集標註版權（頁尾照正式網站的寫法，不另外標註）
- 排版：Prettier（版本寫死），規則在 `.prettierrc.json`，`npm run format` 排 `src/`
- 本機的 `format`、`lint` 會自動修；`format:check`、`lint:check` 只檢查不修改，給 CI 用
- 檢查：ESLint（JS 建議規則＋`eslint-plugin-vue` 的 `flat/essential`，排版規則交給 Prettier），規則在 `eslint.config.js`，`npm run lint` 檢查並自動修
- 測試：Vitest＋`@vue/test-utils`（jsdom 模擬瀏覽器），測試檔放 `__tests__/`、檔名 `*.spec.js`，`npm test`
- 之後加：Storybook

## 資料在哪（正本）

規則只寫在正本，這裡和 issue 只放連結，不重抄。

| 資料 | 位置 |
|---|---|
| 功能清單（功能編號、優先級、規則） | Google 試算表，檔名有 `_real` 的是新版 |
| PRD | Notion「產品規則（共用）」v0.3、「PRD｜找遊戲到加入牌桌」v0.3 |
| 設計決策 | Notion「Design Decision Record」 |
| 技術決策 | `docs/adr/`（加套件、改架構、改開發流程時，在同一個 PR 新增） |
| 資料模型 | `docs/data-model.md`（欄位、選項代號、假資料放哪） |
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

- 顏色只用 Semantic token，不直接用 Primitives（規則見「顏色變數規則」）。唯一例外：依遊戲變色的 CTA 用 `--cta-accent`（`docs/adr/0014`）
- Token 在 `src/styles/tokens.css`，名稱和 Figma 變數一樣，Tailwind 內建的主題已清掉：
  - 顏色：`bg-surface-default`、`text-text-body`、`border-border-default`（Figma 的 `surface/default`、`text/body`…）
  - 間距、圓角：只有 Figma 的級距，`p-16` 是 16px、`rounded-8` 是 8px
  - 文字：用 `type-` 開頭的 class 對應 Figma 文字樣式（例：`type-tc-heading-24`），不要自己組字級和行高
  - 觸控尺寸：`min-h-(--tap-button-min-height)`；字級、觸控尺寸的 Tablet 模式由 CSS 自動切換
  - 效果、漸層：用到的元件才加進 `tokens.css`（例：`shadow-cta-sm`、`bg-(image:--gradient-cta-find)`）
  - 寬高沒有 token（Figma 只有 padding、gap、圓角綁變數），照 Figma 的數值寫（例：`h-[72px]`）
- 斷點：桌面優先，預設寫桌面版，平板（768～1279）用 `max-desktop:` 改寫（例：`p-24 max-desktop:p-16`）。沒有 768 以下的斷點：手機由 `index.html` 的 script 縮放成 768 寬，CSS 永遠看到 768 以上
- 要判斷「是不是手機」時看 `screen.width < 768`（裝置寬度），不要看 `innerWidth` 或 media query，縮放後它們都是 768
- Figma 變數改了：用 Figma MCP 重新讀變數，更新 `tokens.css`；`npm test` 會檢查每個 Semantic 都接到 Primitive
- 資料夾和路由見 `docs/adr/0008`：頁面放 `src/views/`（`XxxView.vue`），版型放 `src/layouts/`，版型用的元件放 `src/components/layout/`
- 圖示用 Font Awesome（`docs/adr/0009`）：元件裡 import 用到的圖示，大小用 `text-[14px]` 這種 font-size 調（`size-*` 會被 Font Awesome 的 CSS 蓋掉）；BGA logo 等自製圖示從 Figma 匯出
- 從 Figma 匯出圖片後，確認背景是透明的；`download_assets` 的 export 可能把底色一起輸出，這時改用原始圖片
- 導覽連結的「目前這頁」用 `aria-[current=page]:` 寫樣式，RouterLink 會自動加 `aria-current`
- 畫面不直接 import 假資料，一律透過 `src/api/`
- 人數、時間、等待、牌桌設定、積分的顯示格式一律用 `src/utils/format.js`，不在元件裡組字串；遊戲名稱用 `gameName()`
- 元件名稱至少兩個字（例：`AppHeader.vue`，不要 `Header.vue`），ESLint 會擋單字的名稱
- 跨頁面共用的資料放 Pinia（`src/stores/`），只有一頁用的放元件裡
- 幾乎一定會成功、失敗也不嚴重的操作（收藏、取消收藏）用樂觀更新：先改畫面，失敗再改回原狀並提示「操作失敗，請再試一次」；結果要看別人狀態的（加入這桌）要等回應，中間顯示「加入中…」
- 整張可點的卡片裡還有按鈕時，不要把按鈕放進連結（HTML 不允許）：用 stretched link，連結只包名稱、用 `after:absolute after:inset-0` 撐滿卡片，按鈕加 `relative z-10` 疊在上面，焦點框用 `has-[a:focus-visible]:` 畫在整張卡上（例：`GameCard.vue`）

### 照設計稿做畫面

- Figma 是設計意圖的參考，專案的寫法是正本：照意圖做，不逐像素照抄，新畫面要和其他畫面像同一個產品
- Figma 和功能清單、PRD 對不上，或 Figma 的值找不到對應的 token 時，先問，不要自己選一個
- 先找現有的元件；載入中（`SkeletonBlock`）、區塊失敗（`BlockError`）、空的用共用的元件，不複製一份；提示用 `src/utils/toast.js`（`docs/adr/0015`）；拿資料用 `useRequest`（`src/composables/`）；搜尋字、篩選條件、排序改網址用 `useSearchQuery`（push／replace、搜尋和篩選擇一、清空回首頁都在裡面）。按鈕用 `AppButton`，整頁狀態（找不到頁面、佔位頁、連線錯誤）用 `PageState`
- 用原生的結構：`button`、`a`、`label`、`ul`、標題照層級；Figma 的絕對定位改寫成 flex 或 grid
- 要對齊的一組東西（一排等高的卡片）做成一個元件，不分開擺位置
- 圖片設寬高避免版面跳動，`alt` 寫有意義的文字（純裝飾才留空）
- 做完在 1440 和 768 截圖，和 Figma 並排比對；不一樣的地方標「刻意」或「要修」

### 檢查清單（`docs/checklists/`）

- `states.md`：開功能 issue、對照功能清單和 PRD 找缺漏時，逐項想每種狀態
- `self-review.md`：開 PR 前，從程式規範、規格、UX 三個角度看一遍
- `audit.md`：release PR 前、展示前跑一次

## Git 與 PR 規則

| 規則 | 狀態 |
|---|---|
| 分支命名：`feat/`、`fix/`、`chore/`、`docs/`、`refactor/` 加內容，可以帶 issue 編號（例：`feat/12-search-bar`） | 使用中 |
| Commit 用 [Conventional Commits](https://www.conventionalcommits.org/)，英文、簡短（例：`feat: add search bar`）；不加 `Co-Authored-By` 之類的 AI 署名 | 使用中 |
| 只有功能開 issue，用範本（`.github/ISSUE_TEMPLATE/feature.md`）：標題帶功能編號（例：`[SYS-09] 設計 token`），一個 issue 可以包一組功能，內容只放連結和狀態表；標籤 `enhancement`＋功能清單的優先級（`P0`／`P1`／`P2`）；開好後把 issue 編號填回功能清單的「Issue」欄。工具設定、文件直接開 PR，不開 issue | 使用中 |
| 每個改動都開 PR；功能、修 bug、文件、工具設定的 PR 自我檢查後自己合併，reviewer 有空再事後看 | 使用中 |
| 自我檢查：在「Files changed」看完整個 diff、CI 通過、PR 描述寫清楚做了什麼／為什麼／怎麼確認 | 使用中 |
| 動到架構的 PR（資料模型、Pinia store 設計、共用元件寫法）也自己合併，留言請 reviewer 事後看（`docs/adr/0011`） | 使用中 |
| release PR（`develop` → `main`）等 reviewer approve 才合併 | 使用中 |
| PR 範本（`.github/pull_request_template.md`）：做了什麼／為什麼／怎麼確認／相關／截圖／自我檢查 | 使用中 |
| CI（`.github/workflows/ci.yml`）：PR 和推進 `main`、`develop` 時自動跑 `format:check`、`lint:check`、`test`、`build` | 使用中 |
| 只允許壓縮合併（squash merge），合併後自動刪掉遠端分支 | 使用中 |
| 分支保護（Rulesets）：`main` 要 1 個 approve＋CI 通過；`develop` 要 CI 通過；兩條都不能刪除、不能 force-push，沒有人可以繞過 | 使用中 |
| 預設分支是 `develop`：新分支從 `develop` 開，功能 PR 合進 `develop`，再從 `develop` 開 release PR 合進 `main` | 使用中 |

## 目前進度

- ✅ 用 create-vue 建立專案（Router、Pinia）
- ✅ AI 協作規範、README（#1）
- ✅ Prettier（#2）
- ✅ ESLint（#3）
- ✅ Vitest（#4）
- ✅ CI（#5）
- ✅ GitHub 設定：壓縮合併、`develop`、分支保護、PR 範本（#7）
- ✅ Issue 範本（#8）
- ✅ 技術決策紀錄 `docs/adr/`（#9）
- ✅ 檢查清單 `docs/checklists/`、照設計稿做畫面的規則（#10）
- ✅ Tailwind CSS v4（#11）
- ✅ 設計 token（#16）
- ✅ 斷點、手機縮放、裝置建議橫幅（#17）
- ✅ 版面骨架 #14，拆 4 個 PR：① 路由、整頁版型、木紋背景、頂部導覽列（#18）② 右側欄、底部導覽列、側欄面板（#19）③ 平板 Bottom Sheet、個人面板（shadcn-vue Sheet，#20）④ 頁尾、build 時帶入推出時間（#21）
- ✅ 佔位頁、找不到頁面 #15（#22）：共用 `PageState`、`AppButton`、全站鍵盤焦點框
- ✅ 資料模型與假資料（#23）：`docs/data-model.md`、`src/api/`、25 款遊戲、圖片壓縮
- ✅ 首頁 #24，拆 3 個 PR：① 主視覺、排行榜、中段橫幅，共用 `SkeletonBlock`、`BlockError`、`useRequest`（#26）② 7 個遊戲分區、大卡和小卡（`GameCard`）、輪播（scroll-snap）、連線錯誤頁（#28、卡片修正 #29）③ 懸停預覽、加入收藏（Pinia）、最近看過、為你推薦權重（#30）
- ⏳ 搜尋與篩選 #25，拆 3 個 PR：① 搜尋框、搜尋結果頁、排序（shadcn-vue Select）、搜尋沒結果 ② 桌面篩選欄、已套用條件、篩選沒結果 ③ 平板篩選卡片
- ✅ 提示 Toast（shadcn-vue Sonner，`src/utils/toast.js`）
- 接下來：開 issue → 設計 token、路由、版面骨架、佔位頁 → PRD 完成後定資料模型，再寫 Pinia store 和頁面功能
