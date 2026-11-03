# BGA Redesign

[Board Game Arena](https://zh.boardgamearena.com/)（BGA）線上桌遊平台的改版，重新設計從「找遊戲」到「加入牌桌」的流程。

> 🚧 開發中：目前只有專案骨架，畫面陸續完成。

## 範圍

找遊戲 → 立即遊玩，到按下「開始遊戲」之前為止：

- **找遊戲**：搜尋、篩選、分類、遊戲主畫面
- **立即遊玩**：尋找開放桌、加入／排隊、我的牌桌

裝置支援桌面（1440）和平板（768）。寬度小於 768 時縮放顯示平板版。

## 技術

- Vue 3（JavaScript）＋ Vite
- Vue Router、Pinia
- Tailwind CSS v4、shadcn-vue
- 資料：目前是假資料，之後換成 Supabase

## 在自己的電腦跑

需要 Node.js 24（LTS）。

```bash
npm install
npm run dev     # 開發伺服器，http://localhost:5173
npm run build   # 打包
```

## 開發流程

每個改動開 PR，CI 自動檢查排版、lint、測試、打包，通過後以 squash merge 合併。分支、commit、PR 規則見 [`CLAUDE.md`](CLAUDE.md)。

## 版權

© 2026 [013](https://github.com/hakukanojyo)。本專案公開僅供瀏覽，未經同意不得複製、修改、散布或用於商業用途。

本專案為個人作品，與 Board Game Arena 無關。Board Game Arena 名稱、標誌，以及遊戲名稱、圖片與資料的版權屬於 Board Game Arena 與各遊戲的出版商。
