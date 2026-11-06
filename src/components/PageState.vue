<script setup>
defineProps({
  image: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  // 標題層級：整頁時是 h1；放在章節裡（例如遊戲頁的開放桌空狀態）照外層的層級往下
  level: { type: Number, default: 1 },
})
</script>

<!--
  整頁狀態的共用版型：Figma State/Not Found（1189:2575），和 State/Connection Error 同一個版型。
  找不到頁面、佔位頁、連線錯誤、區塊的空狀態用；按鈕放在 slot。圖片是裝飾，意思由標題表達，所以 alt 留空
  不帶外圍內距（2026-11-06 拿掉 Figma 的上下 32、左右 24）：外面要空多少由放它的地方決定，不然上下置中時會偏一邊。
  寬度 432 是原本 480 扣掉左右 24，文字換行和以前一樣
-->
<template>
  <section class="flex w-[432px] flex-col items-center gap-24 text-center">
    <img :src="image" alt="" width="136" height="136" />
    <div class="flex flex-col gap-12">
      <component :is="`h${level}`" class="type-tc-heading-24 text-text-primary">
        {{ title }}
      </component>
      <p v-if="description" class="type-tc-body-16 text-text-body">{{ description }}</p>
    </div>
    <!-- 連線錯誤的「你可以試試」等補充內容 -->
    <slot name="details" />
    <!-- 按鈕和上面的說明多拉開 8（共 32），左右排、主要按鈕放右邊（2026-11-06） -->
    <div class="mt-8 flex gap-12">
      <slot />
    </div>
  </section>
</template>
