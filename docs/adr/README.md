# 技術決策紀錄（ADR）

每個技術決策一個檔案：為什麼這樣選、考慮過什麼、代價是什麼。產品和設計的決策記在 Notion「Design Decision Record」，不寫在這裡。

## 什麼時候要寫

- 加套件（`dependencies` 或 `devDependencies`）
- 改架構：資料夾結構、路由、資料怎麼拿、狀態放哪
- 改開發流程：Git、CI、分支保護

和改動放在同一個 PR。

## 決策被推翻時

不改舊的那篇。新寫一篇，在舊的那篇把狀態改成「已被 [00NN](00NN-xxx.md) 取代」。

## 格式

檔名 `00NN-短名稱.md`，編號照順序。

```md
# 00NN. 標題

- 狀態：已採用
- 日期：YYYY-MM-DD

## 背景
要解決什麼問題、有什麼限制。

## 決定
選了什麼。

## 考慮過的選項
其他做法，以及沒選的原因。

## 代價
這個決定帶來的限制，以及怎麼補。
```

## 清單

| 編號 | 決策 |
| --- | --- |
| [0001](0001-vue-javascript.md) | Vue 3 ＋ JavaScript，不用 TypeScript |
| [0002](0002-pinia-shared-state.md) | 跨頁面的資料放 Pinia |
| [0003](0003-tailwind-figma-tokens.md) | Tailwind CSS v4 ＋ Figma Semantic token |
| [0004](0004-shadcn-vue-complex-components.md) | shadcn-vue 只用在行為複雜的元件 |
| [0005](0005-fake-api-layer.md) | 假資料放在 `src/api/` 後面，之後換 Supabase |
| [0006](0006-git-workflow.md) | develop ＋ release PR、壓縮合併 |
| [0007](0007-tooling-create-vue-defaults.md) | 工具設定沿用 create-vue 的預設 |
