<script setup>
defineProps({
  // 章節導覽連到這裡（#id），scroll spy 也看這個 id
  id: { type: String, required: true },
  title: { type: String, required: true },
})
</script>

<!--
  Figma：遊戲頁的章節卡片（桌面 303:2156、平板 908:9847）：毛玻璃底、卡片陰影，標題下方 2px 藍線。
  標題統一 text/link（Figma 原本有三種藍，2026-11-05 統一）。
  scroll-margin-top：點章節導覽捲過來時，標題停在吸頂的東西下面（GameView 設 --sticky-offset）
-->
<template>
  <section
    :id="id"
    :aria-labelledby="`${id}-title`"
    class="flex scroll-mt-(--sticky-offset) flex-col gap-32 rounded-12 bg-surface-glass-light px-20 pt-4 pb-20 shadow-card max-desktop:rounded-8"
  >
    <h2
      :id="`${id}-title`"
      class="border-b-2 border-action-primary py-12 type-tc-heading-24 text-text-link"
    >
      {{ title }}
    </h2>
    <slot />
  </section>
</template>
