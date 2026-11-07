# 0020. release PR 也自我檢查後合併

- 狀態：已採用
- 日期：2026-11-08
- 取代：[0006](0006-git-workflow.md)、[0011](0011-architecture-pr-review-after-merge.md) 的「release PR（`develop` → `main`）等 reviewer approve 才合」

## 背景

0006、0011 規定 release PR 要等 reviewer approve，`main` 的 Ruleset 也設成「1 個 approve＋CI 通過，沒有人可以繞過」。

第一次 release（#63）時遇到兩件事：

- reviewer 沒有時間 review，由專案負責人自己看
- GitHub 不允許 PR 的作者 approve 自己的 PR；release PR 是負責人開的，所以沒有人 approve 就永遠合不進去

## 決定

- release PR 和其他 PR 一樣：CI 通過、自我檢查後自己合併
- `main` 的 Ruleset：Required approvals 改成 0；保留「CI 通過」「不能刪除」「不能 force-push」「沒有人可以繞過」
- release 前一定跑 `docs/checklists/audit.md`，結果寫在 release PR 裡；reviewer 有空再事後看，有問題開新 PR 修
- `main` 只放 release 過的版本、合併時自動部署（[0019](0019-github-pages.md)）不變

## 考慮過的選項

- **維持 approve，請 reviewer 按一下**：規則不用改，但 reviewer 沒有真的看，文件寫的和實際做的對不上
- **在 Ruleset 加 bypass，讓負責人可以跳過**：連 CI 都能跳過，保護比現在更少
- **另開一個帳號來 approve**：等於自己 approve 自己，只是騙過規則

## 代價

- `main` 沒有第二個人把關；靠 CI、`docs/checklists/self-review.md`、release 前的 `audit.md` 補
- 之後如果有固定的 reviewer，可以再把 approve 加回來（新寫一篇 ADR）
