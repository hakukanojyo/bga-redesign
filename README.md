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
npm test        # 測試
```

遊戲圖片的原圖不在 repo 裡；有原圖（`design-source/games/`）時，`npm run images` 會壓縮成 WebP 放進 `src/assets/images/games/`，並從橫幅算出按鈕顏色（`colors.json`）。

## 開發流程

每個改動開 PR，CI 自動檢查排版、lint、測試、打包，通過後以 squash merge 合併。分支、commit、PR 規則見 [`CLAUDE.md`](CLAUDE.md)。

## 版權

© 2026 [013](https://github.com/hakukanojyo)。本專案公開僅供瀏覽，未經同意不得複製、修改、散布或用於商業用途。

本專案為個人作品，與 Board Game Arena 無關。Board Game Arena 名稱、標誌，以及遊戲名稱、圖片與資料的版權屬於 Board Game Arena 與各遊戲的出版商。

### 資料來源

- 遊戲名稱、人數、遊玩時間、製作群：各遊戲公開的盒裝資訊（2026 年 11 月整理），共 25 款
- 遊戲封面、橫幅插畫、標準字：版權屬於各遊戲的出版商，僅作展示用途
- Board Game Arena 標誌與木紋背景：Board Game Arena 的品牌素材，改版沿用原有品牌
- 玩家頭像：[Unsplash](https://unsplash.com/license) 的動物照片（Unsplash License）
- 國旗：[flag-icons](https://github.com/lipis/flag-icons)（MIT License）
- 遊戲介紹：依遊戲內容自行撰寫，不是 Board Game Arena 或出版商的原文
- 熱門度、上架日期、玩家、牌桌、排行榜、遊玩紀錄：全部為虛構的示範資料，不對應任何真實帳號
