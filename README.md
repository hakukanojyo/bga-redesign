# BGA Redesign

重新設計 [Board Game Arena](https://zh.boardgamearena.com/)（BGA）線上桌遊平台的 UX/UI 作品集專案。從使用者研究、設計稿一路做到可以操作的前端網站。

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

## 協作方式

每個改動都開 PR，由前端工程師 review 後合併。開發時用 [Claude Code](https://claude.com/claude-code) 協作寫程式，規格、設計和取捨由我決定。協作規則見 [`CLAUDE.md`](CLAUDE.md)。

## 版權

© 2026 [013](https://github.com/hakukanojyo)。本專案公開僅供瀏覽與作品集展示，未經同意不得複製、修改、散布或用於商業用途。

本專案為個人作品，與 Board Game Arena 無關。Board Game Arena 名稱、標誌，以及遊戲名稱、圖片與資料的版權屬於 Board Game Arena 與各遊戲的出版商。
