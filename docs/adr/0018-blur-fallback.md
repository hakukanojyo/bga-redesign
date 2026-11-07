# 0018. 背景模糊降級：全站一條 CSS 規則＋開頁時判斷裝置

- 狀態：已採用
- 日期：2026-11-07

## 背景

Header、右側欄、側欄面板、Bottom Sheet、遮罩、遊戲頁章節導覽等 13 處用了 `backdrop-filter: blur()`（4～15px）。模糊每一格畫面都要重算背後的內容，捲動或面板動畫時在舊電腦、平價平板上容易掉格。產品規則 6.4、SYS-10 要求：系統開「減少透明度」，或低效能裝置時，拿掉模糊、只留半透明底色；模糊上限維持現在最大的 15px。

限制：

- `prefers-reduced-transparency` 只有 Chromium 支援，Safari、Firefox 沒有
- 瀏覽器沒有「這台裝置效能好不好」的 API，只能看規格：`navigator.deviceMemory`（GB，只有 Chromium，而且是概略值）和 `navigator.hardwareConcurrency`（邏輯核心數，各家都有）
- 要在第一次畫面出現前就決定，不然會先模糊再突然變清楚

## 決定

- **判斷**：`index.html` 的 inline script（和手機縮放的寫法一樣，在 Vue 載入前執行），記憶體 ≤ 4GB 或核心數 ≤ 4 時，在 `<html>` 加 `reduce-blur`。Safari 沒有 `deviceMemory`，只看核心數。瀏覽器什麼都沒回報時保留模糊
- **減少透明度**：直接用 CSS `@media (prefers-reduced-transparency: reduce)`，不用 JS，使用者開關系統設定時立刻生效
- **套用**：`src/style.css` 一條全站規則，把所有元素、`::before`、`::after`、`::backdrop`（原生 dialog 的遮罩）的 `backdrop-filter` 和 `-webkit-backdrop-filter` 設成 `none`
- 規則放在 `@layer` 外面：沒有 layer 的樣式一定贏過 Tailwind 放在 `@layer utilities` 的 class，不用 `!important`，元件也不用各自加東西；之後新加的模糊會自動降級
- 玻璃底色不加深：拿掉模糊不會改變背景的平均亮度，文字對比和原本一樣（Header 白 73% 最差 7.18:1）。面板底加深會讓桌面側欄面板裡的白色圖示看不到，所以維持半透明（2026-11-07 截圖比對後決定）
- 遮罩壓深：沒有模糊時，Bottom Sheet、側欄面板後面的頁面會清楚透出來、很雜，所以降級時遮罩從黑 40%（`overlay/backdrop`）換成黑 76%（新增 `overlay/backdrop-strong`，Figma 同名變數）。做法是在同一條規則裡把 `--color-overlay-backdrop` 指到它，所有遮罩（Sheet、側欄面板、彈窗的 `::backdrop`）一起換，元件不用改。遮罩越深，面板裡的白色圖示反而越清楚（約 1.83:1 → 2.5:1）（2026-11-08 在瀏覽器比較 56%、76% 後決定）

## 考慮過的選項

- **每個元件各自加 Tailwind 自訂 variant**（`reduce-blur:backdrop-blur-none`）：寫法比較明確，但 13 處都要改，之後新元件容易漏
- **Vue 啟動後再判斷（例如寫在 `main.js` 或 Pinia）**：第一次畫面會先有模糊再拿掉，看得到跳一下
- **量實際畫面速度（FPS）再決定**：比較準，但要先跑一段動畫才知道，判斷前已經卡過了；也比較複雜
- **降級時面板底改白 90%**：背景比較不雜，但桌面側欄面板的白色圖示對比會從約 1.83:1 掉到約 1.14:1
- **遮罩黑 56%**：比較接近原本的 40%，但要新增 Primitive；76% 已經有現成的 `base/black-a76`，壓雜訊的效果也比較明顯

## 代價

- 規格不等於效能：核心數少但很快的裝置也會被降級；有些瀏覽器為了防止追蹤會回報比較少的核心數，可能誤判。之後如果誤判太多，再改門檻或改成量 FPS
- 判斷寫在 `index.html`，不能 import，測試用讀檔的方式執行那段 script（`src/__tests__/blurFallback.spec.js`）
- 降級後沒有遮罩的玻璃（Header、右側欄）後面的圖和字會透出來，比較雜；文字對比不受影響
- 降級時遮罩黑 76% 比平常暗很多，背後的頁面比較不明顯（11-06 改成黑 40% 就是為了看得出頁面還在），用「不雜」換「看得到後面」
- 遮罩有 `duration-300`、預設轉場所有屬性，開著網頁時切換系統的「減少透明度」，遮罩會用 0.3 秒漸漸變深
