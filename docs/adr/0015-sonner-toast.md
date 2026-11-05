# 0015. 提示（Toast）用 shadcn-vue 的 Sonner

- 狀態：已採用
- 日期：2026-11-05

## 背景

加入收藏、退出這桌、加入這桌、加入失敗都要跳提示（Figma `Toast`，neutral／success／error）。提示要讓螢幕閱讀器讀到（`aria-live`）、滑鼠移上去暫停倒數、好幾個同時出現時要排好。照 [0004](0004-shadcn-vue-complex-components.md)，這類行為複雜的元件用 shadcn-vue。

## 決定

- 用 shadcn-vue 的 **Sonner**（`vue-sonner`）。shadcn-vue 舊的 Toast 已不再推薦，改推 Sonner
- `npx shadcn-vue add sonner` 放在 `src/components/ui/sonner/`；`unstyled` 拿掉 Sonner 的外觀，只留位置、疊放、動畫，樣式改成設計稿的 token，圖示換成 Font Awesome
- 畫面只呼叫 `src/utils/toast.js` 的 `toast.neutral`、`toast.success`、`toast.error`，不直接用 Sonner。設計稿的規則寫在這裡，呼叫的人不用記：
  - neutral 只能附「復原」，success 只能附「查看」，error 不附動作（一個提示最多一個動作）
  - 附「復原」停 5 秒，其他停 3 秒
- `<Toaster>` 放在 `AppLayout`：畫面下方置中，離底部 16；平板在底部導覽列（72）上方，離 88
- 好幾個提示同時出現時用 Sonner 預設：疊成一疊，最多 3 個，滑鼠移上去展開。連續收藏好幾款時，前面的「復原」還按得到
- 陰影新增 `--shadow-card`（Figma 效果樣式 `cardShadow`）。數值和 `--shadow-glass-nav` 一樣，但用途不同，分開才不會改一個動到另一個

## 考慮過的選項

- **Reka UI 的 Toast**：不用加套件，但提示的佇列、從任何地方呼叫的方式要自己寫
- **一次只顯示一個、新的取代舊的**（Material Design 的 Snackbar）：畫面最乾淨，但前一個提示的「復原」會跟著消失

## 代價

- 多一個套件 `vue-sonner`
- Sonner 的 CSS 沒有放在 Tailwind 的 layer 裡，和它衝突的樣式（位置、透明度、transform）Tailwind 蓋不過，只能改它沒有設定的屬性
- 提示依文字長度決定寬度：疊起來時，比較窄的會被前面比較寬的擋住
