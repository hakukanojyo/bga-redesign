# 0021. release PR 用合併 commit，功能 PR 維持壓縮合併

- 狀態：已採用
- 日期：2026-11-08
- 取代：[0006](0006-git-workflow.md) 的「只允許壓縮合併」（release PR 的部分）

## 背景

0006 規定所有 PR 都用壓縮合併。第一次 release（#63）把 `develop` 的 45 個 commit 壓成 `main` 上的一個 commit 之後，`main` 和 `develop` 就沒有共同的歷史了：

- 第二次 release 直接從 `develop` 開 PR（#66），GitHub 從 11-03 的舊 `main` 開始比，列出整個專案，而且 `games.js` 這種兩邊都「新增」但內容不同的檔案變成衝突
- 當時改用「從 `main` 開 release 分支、內容換成 `develop` 的」繞過（#67），但每次 release 都要多做兩步，`main` 和 `develop` 的歷史也永遠對不上

## 決定

- **release PR（`develop` → `main`）用「Create a merge commit」合併**，`main` 會帶著 `develop` 的歷史，下一次 release 只會列出新的改動
- 功能、修正、文件的 PR 合進 `develop` 維持壓縮合併，`develop` 上一個 PR 一個 commit
- repo 設定開啟 Allow merge commits；`main` 的 Ruleset 只允許 Merge（不能再用壓縮合併，避免歷史又斷開），`develop` 的 Ruleset 只允許 Squash
- 接回歷史：#67 合併後兩邊內容一樣，再開一次 `develop` → `main` 用合併 commit 合併，之後直接從 `develop` 開 release PR

## 考慮過的選項

- **每次都開 release 分支**（#67 的做法）：不用改設定，但每次多兩步，容易忘
- **release 也壓縮合併，合完再把 `main` 合回 `develop`**：`develop` 只允許壓縮合併，合回去一樣會斷；要開例外反而更複雜
- **rebase 合併**：`develop` 的 commit 會在 `main` 上被重寫成新的 commit，一樣對不上

## 代價

- `main` 的歷史會出現 `develop` 的所有 commit 和 release 的合併 commit，比較長；看 release 紀錄時用 `git log --first-parent main`
- `main` 不能壓縮合併，緊急修正也要走 `develop` → `main`（目前也是這樣）
