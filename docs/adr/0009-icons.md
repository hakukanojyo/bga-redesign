# 0009. 圖示用 Font Awesome，自製圖示從 Figma 匯出

- 狀態：已採用
- 日期：2026-11-03

## 背景

設計稿的圖示是實心風格，來源混了好幾套（hugeicons、eva icons、Font Awesome）。從 Figma 一個一個匯出 SVG 容易出錯：顏色會寫死在檔案裡，沒辦法跟著文字顏色變。

## 決定

- 一般圖示用 **Font Awesome 免費版**（`@fortawesome/vue-fontawesome`＋`free-solid-svg-icons`；之後頁尾的社群圖示用 `free-brands-svg-icons`）
- 每個元件自己 import 用到的圖示（例：`import { faPlus } from '@fortawesome/free-solid-svg-icons'`），只打包有用到的
- 大小用 `font-size` 調（例：`text-[14px]`），顏色跟著文字色（例：`text-icon-inverse`）
- 套件裡沒有的（BGA logo、精靈圖示）從 Figma 匯出，放 `src/assets/`
- 國旗之後用 `flag-icons`，資料只存 ISO 3166-1 兩碼國家代碼（例：`TW`），做到排行榜時再加

## 考慮過的選項

- **Lucide**：shadcn-vue 的預設，但只有線條風格，和設計稿的實心風格不同
- **Phosphor**：有實心版，但沒有品牌圖示
- **全部從 Figma 匯出**：設計稿是正本，但每次都要匯出、顏色寫死，來源不一致時風格也不一致

## 代價

- 要裝 3～4 個套件
- shadcn-vue 的元件內建 Lucide 圖示，之後加進專案時要換成 Font Awesome（只有關閉、箭頭、勾選幾個）
- Figma 的一般圖示要逐步換成 Font Awesome，設計稿和程式才會完全一致
- Font Awesome 的 CSS 不在 Tailwind 的 layer 裡，會蓋過 Tailwind 的 `size-*`，所以大小一定要用 `font-size`
