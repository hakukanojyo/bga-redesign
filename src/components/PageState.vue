<script setup>
defineProps({
  image: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>

<!--
  整頁狀態的共用版型：Figma State/Not Found（1189:2575），和 State/Connection Error 同一個版型。
  找不到頁面、佔位頁、連線錯誤用；按鈕放在 slot。圖片是裝飾，意思由標題表達，所以 alt 留空
-->
<template>
  <section class="flex w-[480px] flex-col items-center gap-24 px-24 py-32 text-center">
    <img :src="image" alt="" width="136" height="136" />
    <div class="flex flex-col gap-12">
      <h1 class="type-tc-heading-24 text-text-primary">{{ title }}</h1>
      <p v-if="description" class="type-tc-body-16 text-text-body">{{ description }}</p>
    </div>
    <!-- 連線錯誤的「你可以試試」等補充內容 -->
    <slot name="details" />
    <div class="flex gap-12">
      <slot />
    </div>
  </section>
</template>
