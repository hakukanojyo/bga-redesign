# 0017. 確認彈窗用原生 `<dialog>`

- 狀態：已採用
- 日期：2026-11-06

## 背景

「退出這桌」要先跳確認彈窗（產品規則 4.2、MYTBL-08）。按鈕在我的牌桌面板裡：桌面是原生 `<dialog>` 做的側欄面板（[0010](0010-shadcn-vue-sheet.md)），平板是 shadcn-vue 的 Sheet。照 [0004](0004-shadcn-vue-complex-components.md)，Modal 這類元件原本要用 shadcn-vue。

問題：側欄面板用 `showModal()` 打開，放在瀏覽器的最上層（top layer），面板以外的地方都不能點。shadcn-vue 的 AlertDialog（Reka UI）是一般元素，就算 `z-index` 再大也會被蓋在面板下面、點不到。

## 決定

- 確認彈窗用原生 `<dialog>` 的 `showModal()`，做成 `src/components/ConfirmDialog.vue`，桌面和平板共用
- 後打開的 top layer 元素會疊在先打開的上面，所以彈窗會在側欄面板上面；鎖焦點、Esc 關閉、關掉後焦點回到原本的「退出這桌」都是瀏覽器內建，不用另外寫
- 打開時焦點在「返回」（`autofocus`），按 Enter 不會誤退
- 平板的 Sheet 是 Reka：點在彈窗上會被 Sheet 當成「點到外面」而關掉，所以 `TabletPanel` 的 `onInteractOutside` 遇到 `dialog` 不關；彈窗的 Esc 不往外傳，不然 Sheet 也會一起關
- 提示（Toast）也有同樣的層級問題：桌面側欄面板開著時，提示被蓋在面板的模糊後面、「復原」按不到。面板開著時用 `<Teleport>` 把提示移進面板的 `<dialog>` 裡，關掉再移回 `body`；提示一樣用 fixed 定位，位置不變
- 0004「Modal 用 shadcn-vue」這條，確認彈窗是例外：只要會從側欄面板裡打開，就要用原生 `<dialog>`

## 考慮過的選項

- **shadcn-vue 的 AlertDialog**：照 0004，但在桌面會被側欄面板蓋住；要嘛先關掉面板再跳彈窗（按「返回」後面板已經不見，使用者要重新打開），要嘛把側欄面板改寫成 Reka（0010 已經評估過，變形動畫要重寫）
- **把彈窗做進面板裡面（不是彈窗，是面板裡的一塊確認區）**：不用處理層級，但和 Figma 的 Modal/Confirm、產品規則 4.2 不一樣，平板和桌面的位置也不同

## 代價

- 彈窗和平板 Sheet 是兩種寫法疊在一起，要靠 `onInteractOutside` 和擋 Esc 讓它們不打架；之後如果平板也改原生 `<dialog>`，這兩段可以拿掉
- 原生 `<dialog>` 沒有內建開關動畫，彈窗目前直接出現
