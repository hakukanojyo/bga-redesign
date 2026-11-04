# 0010. 平板面板用 shadcn-vue 的 Sheet

- 狀態：已採用
- 日期：2026-11-04

## 背景

平板點底部導覽列要從下往上打開 Bottom Sheet（固定高 480），點頭像要從右側滑出個人面板（寬 375），兩種都蓋在主內容上、導覽列保持露出（PRD 7.10）。照 [0004](0004-shadcn-vue-complex-components.md)，這類有焦點、Esc、遮罩行為的元件用 shadcn-vue。

## 決定

- 用 shadcn-vue 的 **Sheet**（底層 Reka UI 的 Dialog），`side="bottom"` 做 Bottom Sheet、`side="right"` 做個人面板，包成 `src/components/layout/TabletPanel.vue`
- `npx shadcn-vue init` 產生 `components.json`、`src/lib/utils.js`；`add sheet` 把元件放在 `src/components/ui/sheet/`
- 只留用到的 `Sheet`、`SheetContent`、`SheetOverlay`、`SheetTitle`；樣式改成設計稿的 token，拿掉內建的關閉按鈕（設計稿沒有，用 Esc、點遮罩、再點同一個按鈕關閉），所以也不用 Lucide 圖示
- CLI 改到的 `style.css`（Inter 字型、它自己的顏色變數）還原，只加 `tw-animate-css`
- 留下的套件：
  - `reka-ui`：Dialog 的行為（鎖焦點、Esc、關掉後焦點回到原本的按鈕、鎖捲動）
  - `cn`：合併 class，後面傳進來的 class 會蓋掉元件預設的（例：`bottom-0` 被 `bottom-[72px]` 取代）
  - `@vueuse/core`：Sheet 元件用它的 `reactiveOmit`；版型也用它的 `useMediaQuery` 判斷桌面或平板
  - `tw-animate-css`（devDependencies）：進場、離場動畫。Reka 等 CSS 動畫跑完才移除元件，關閉時才看得到滑出去
- shadcn-vue 的元件檔名是單字（`Sheet.vue`），ESLint 對 `src/components/ui/` 關掉名稱至少兩個字的規則，之後用 CLI 更新才對得上
- 桌面的側欄面板（`SidePanel`）維持原生 `<dialog>`，不改用 Reka：它是側欄自己從 164 寬長成 421 寬、圖示和底色一起變化的變形動畫，用 CSS transition 最自然；Reka 關閉時只等 CSS animation 跑完、不等 transition，換過去要把每個元素都改寫成 keyframes。平板是標準的 Sheet 從邊緣滑進來，正好是 shadcn-vue 現成的做法。依互動類型選工具，不為了統一而重寫
- 原生 `<dialog>` 不會鎖背景捲動，在 `style.css` 用 `html:has(dialog[open])` 鎖住，和平板的 Sheet 一致

## 考慮過的選項

- **Drawer**（底層 vaul-vue）：可以手指往下拖來關閉，但設計稿和 PRD 都沒有拖曳，還要多裝一個套件；個人面板從右側出來也用不到
- **平板也用原生 `<dialog>`、全部手寫**：不用裝套件，但 `showModal()` 會把面板放在畫面最上層，導覽列蓋在下面點不到，要在面板裡再放一份導覽列；也違反 0004
- **桌面也改用 Reka，全站統一**：行為完全一致，但最精緻的變形動畫要重寫，風險最高、使用者看不出差別

## 代價

- 桌面和平板是兩種寫法，改面板行為時兩邊都要看
- 多 4 個套件。`src/components/ui/` 的檔案是複製進來改過的，之後用 CLI 更新要自己合併改動
- 面板開著時 Reka 會讓其他地方不能點、螢幕閱讀器讀不到。底部導覽列另外設成可以點，並在點到它時不關閉面板，交給導覽列切換；但鍵盤焦點鎖在面板裡，鍵盤使用者要先按 Esc 關掉才回得到導覽列
