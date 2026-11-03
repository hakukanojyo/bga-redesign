# 0007. 工具設定沿用 create-vue 的預設

- 狀態：已採用
- 日期：2026-11-03

## 背景

需要排版、檢查、測試和 CI。每個工具都有很多設定可以選，每一條都要能說明理由。

## 決定

- 用 `npm create vue@latest` 建專案時只勾 Router、Pinia；Prettier、ESLint、Vitest 之後各開一個 PR 加，每個 PR 說明那個工具
- 設定沿用 create-vue 勾選時會產生的內容：
  - Prettier：不加分號、單引號、一行最多 100 字；版本寫死；只排 `src/`
  - ESLint：JS 建議規則＋`eslint-plugin-vue` 的 `flat/essential`，最後用 `eslint-config-prettier` 關掉排版規則
  - Vitest：沿用 `vite.config.js`，用 jsdom
- 兩處不同：測試指令叫 `test`（沒有 E2E，不用 `test:unit`）；Vitest 設定拿掉 `e2e/**` 的排除
- CI 用只檢查、不修改的指令：`format:check`、`lint:check`、`test -- --run`、`build`

## 考慮過的選項

- **建專案時全部勾選**：最快，但所有工具混在第一個 commit，看不出每個工具帶來什麼
- **自己挑規則**：每一條都要說明理由，而且會改動現有程式碼

## 代價

create-vue 的預設不一定最適合這個專案。遇到不合用的規則再改，並在這裡補一篇 ADR。
