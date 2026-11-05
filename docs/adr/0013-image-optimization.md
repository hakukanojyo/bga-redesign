# 0013. 遊戲圖片用 sharp 壓縮成 WebP

- 狀態：已採用
- 日期：2026-11-05

## 背景

25 款遊戲的封面、橫幅、標準字共 67 張，原圖 7.4 MB，標準字一張就是 2000×2000。全部直接放進網站，首頁會載入很慢；放進 git，repo 也會越來越大（刪掉的檔案也一直留在歷史裡）。

## 決定

- 原圖放 `design-source/games/`，**不進 git**（`.gitignore`）；命名 `代稱_banner`、`代稱_box`、`代稱_logo`
- `npm run images`（`scripts/optimize-images.js`）用 **sharp** 轉成 WebP、縮到畫面需要的大小（約 2 倍，給 Retina 螢幕），輸出到 `src/assets/images/games/`，只有這份進 git 和網站
- 最大寬度：橫幅 1400、封面 280、標準字 800；比原圖小的不放大。標準字保留透明背景
- 圖片由 `src/api/games.js` 依代稱找到（`import.meta.glob`），沒有的那種是 `null`
- 套件放在 `devDependencies`：只有整理圖片時用到，網站本身不需要

## 考慮過的選項

- **原圖直接放進 `src/assets/`**：最簡單，但 7.4 MB 都會進 git 和網站
- **用 Python 或線上工具轉一次**：不用加套件，但之後補圖、換圖時沒有固定的指令可以重跑
- **vite-imagetools 在打包時壓縮**：不用另外跑指令，但每次打包都要重新處理，原圖也要進 repo

## 代價

- 多一個開發用的套件；補圖後要記得跑 `npm run images`
- 原圖只在這台電腦，換電腦要另外備份 `design-source/`
