# 0003. Tailwind CSS v4 ＋ Figma Semantic token

- 狀態：已採用
- 日期：2026-11-03

## 背景

設計稿的顏色、間距、圓角、字級都綁了 Figma 變數，分三層：Primitives → Semantic → 元件家族色（規則見 Notion「顏色變數規則」）。程式要和設計稿用同一套數值，改一個變數兩邊一起變。

## 決定

- 用 Tailwind CSS v4（`@tailwindcss/vite`）
- Figma 的 Semantic 變數轉成 CSS 變數，接到 Tailwind 的 `@theme`
- 畫面只用 Semantic token，不直接用 Primitives，也不寫死數值。Figma 裡找不到 token 的值，要先問設計
- 半透明的顏色，透明度做進變數（和 Figma 的規則一樣）

## 考慮過的選項

- **一般 CSS 或 SCSS**：自由度高，但每個元件都要取 class 名稱，數值也容易各寫各的
- **UI 框架自帶的樣式**（Vuetify、Element Plus）：要覆寫成設計稿的樣子，比自己寫還麻煩

## 代價

HTML 裡的 class 會變長。重複出現的組合做成元件，不在每個地方重寫一次。
