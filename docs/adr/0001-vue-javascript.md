# 0001. Vue 3 ＋ JavaScript，不用 TypeScript

- 狀態：已採用
- 日期：2026-11-03

## 背景

要把 Figma 設計稿做成可以操作的網站，開發者是設計背景，上過 Vue、Vue Router、Pinia 的課，不會 TypeScript。

## 決定

Vue 3（Composition API、`<script setup>`）＋ Vite，純 JavaScript。框架直接用已經會的 Vue，和上一個專案同一套。

## 考慮過的選項

- **TypeScript**：有型別檢查，業界越來越普遍；但要同時學 TS 和這個專案的東西，門檻太高

## 代價

少了型別檢查，例如把數字寫成字串，加總時不會被擋下來。用 ESLint、Vitest 和 CI 補一部分。之後要加 TypeScript，Vite 和 Vue 都支援逐步改寫。
