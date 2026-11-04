# 0011. 動到架構的 PR 也自己合併，reviewer 事後看

- 狀態：已採用
- 日期：2026-11-05
- 取代：[0006](0006-git-workflow.md) 的「動到架構的 PR，留言請 reviewer 看，等回覆再合」

## 背景

0006 規定動到架構的 PR（資料模型、Pinia store 設計、共用元件寫法）要等 reviewer 回覆才合併。reviewer 最近沒有時間，第一個共用元件（`AppButton`、`PageState`，#15）就會卡住，後面的頁面又都要用到它們。

## 決定

- 動到架構的 PR 和其他功能 PR 一樣：CI 通過、自我檢查後自己合併
- PR 裡留言請 reviewer 有空再事後看，說明這個 PR 動到哪個共用的寫法
- release PR（`develop` → `main`）維持等 reviewer approve 才合，這是最後一道把關

## 考慮過的選項

- **照 0006 繼續等**：最安全，但進度會被 reviewer 的時間卡住
- **完全不請 reviewer 看**：最快，但共用寫法沒有人確認過，錯了會擴散到每一頁

## 代價

- 共用元件的寫法如果有問題，可能已經被好幾頁用了才發現，改起來範圍比較大
- 補救：reviewer 事後提的問題開新 PR 修；release PR 前跑 `docs/checklists/audit.md`
