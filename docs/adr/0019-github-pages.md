# 0019. 部署到 GitHub Pages，只部署 main

- 狀態：已採用（「reviewer approve 過的版本」改為自我檢查過的版本，見 [0020](0020-release-self-review.md)）
- 日期：2026-11-08

## 背景

作品集要有一個線上網址給人看，release 前的稽核清單（`docs/checklists/audit.md`）也有幾項要用部署後的網址測（直接開內頁、Lighthouse、乾淨的瀏覽器）。

限制：

- 網站是純前端的 SPA，第一階段沒有後端，假資料存在瀏覽器的 localStorage
- 路由用 HTML5 history 模式（[0008](0008-folders-and-routing.md)），直接開 `/game/catan` 這種內頁時，伺服器要回傳 `index.html`
- repo 是公開的，CI 已經用 GitHub Actions

## 決定

- 部署到 GitHub Pages，網址 `https://hakukanojyo.github.io/bga-redesign/`
- `.github/workflows/deploy.yml`：推進 `main` 時打包、部署；也可以在 Actions 頁面手動觸發。只部署 `main`，線上永遠是 reviewer approve 過的版本（[0006](0006-git-workflow.md)）
- 網站在子路徑底下：`vite.config.js` 打包時 `base: '/bga-redesign/'`，開發伺服器維持根目錄。Vue Router 用 `import.meta.env.BASE_URL`，RouterLink 和 `router.push` 會自動加上子路徑；**不要寫死 `<a href="/...">`**，要用 RouterLink（`target="_blank"` 也可以）
- 直接開內頁：打包後把 `index.html` 複製成 `404.html`。GitHub Pages 找不到檔案時回傳 `404.html`，Vue 載入後 router 依網址顯示正確的頁面

## 考慮過的選項

- **Vercel**：一個設定檔就能把所有網址導到 `index.html`、每個 PR 自動有預覽網址；但要另外的帳號，網站和程式不在同一個地方
- **轉址 script 處理內頁**（spa-github-pages 的做法）：`404.html` 把網址塞進查詢參數轉回首頁，`index.html` 再還原，狀態碼是 200；但網址會先跳一次，也多兩段要維護的 script
- **hash 模式**（網址有 `#`）：不用處理 404，但網址不好看，也要改掉 0008 的決定

## 代價

- 直接開內頁時 HTTP 狀態碼是 404（瀏覽器和使用者看不出來；作品集不需要 SEO）
- 只有 `main` 有線上網址，PR 沒有預覽；要看還沒 release 的改動，在本機跑
- GitHub Pages 要在 repo 設定裡把來源設成 GitHub Actions；`github-pages` 環境的部署分支要允許 `main`（預設分支是 `develop`）
- 第二階段接 Supabase 時，金鑰用 `VITE_` 開頭會被打包進網站（所有人都看得到），只能放公開的 anon key
