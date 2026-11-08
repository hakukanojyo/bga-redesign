# 0006. develop ＋ release PR、壓縮合併

- 狀態：已採用（「動到架構的 PR 等 reviewer 回覆」已被 [0011](0011-architecture-pr-review-after-merge.md) 取代；「release PR 等 reviewer approve」已被 [0020](0020-release-self-review.md) 取代；「只允許壓縮合併」的 release PR 部分已被 [0021](0021-release-merge-commit.md) 取代）
- 日期：2026-11-03

## 背景

一個人開發，一位前端工程師 review，但他時間有限，沒辦法每個 PR 都看。`main` 要一直是確認過、可以展示的版本。

## 決定

- 兩條長期分支：`main`（正式）、`develop`（開發中，預設分支）
- 功能 PR 從 `develop` 開、合回 `develop`：CI 通過、自我檢查後自己合併
- 動到架構的 PR，留言請 reviewer 看，等回覆再合
- 累積幾個功能後，開 release PR（`develop` → `main`），等 reviewer approve 才合
- 只允許壓縮合併，一個 PR 在目標分支上只留一個 commit
- 用 GitHub Rulesets 設定，沒有人可以繞過（細節見 `CLAUDE.md`「Git 與 PR 規則」）

## 考慮過的選項

- **每個 PR 都等 review**：最安全，但會一直卡住
- **只有 `main`（trunk-based），不 review**：最快，但沒有人把關
- **一般 merge**：保留每個小 commit，但紀錄很亂，撤回一個 PR 要撤好幾個 commit

## 代價

- reviewer 事後才看功能 PR，問題可能晚一點才發現；靠 CI 和自我檢查補
- 壓縮合併後，找問題（git bisect）只能找到是哪個 PR，所以 PR 要保持小
- release PR 合進 `main` 後，兩條分支的紀錄不同（內容一樣）
