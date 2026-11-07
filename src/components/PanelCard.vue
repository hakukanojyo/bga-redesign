<script setup>
defineProps({
  // 觸控裝置和平板 Bottom Sheet：按鈕常駐在卡片底部（產品規則 6.2）；滑鼠裝置：懸停才出現
  touch: { type: Boolean, default: false },
  // 現在需要你的牌桌加外框（MYTBL-04）：turn 輪到你（青）、live 即時制對戰中（橘）
  highlight: { type: String, default: '' },
})

const rings = {
  turn: 'inset-ring-2 inset-ring-rail-table',
  live: 'inset-ring-2 inset-ring-status-live',
}
</script>

<!--
  側欄面板和 Bottom Sheet 裡的卡片共用的外殼：收藏、我的牌桌（之後的遊玩紀錄也用）。
  - 懸停：底色不變、只加陰影（2026-11-06）；actions 的按鈕條從卡片底部滑上來（200ms，只動 translate），減少動態效果時直接出現
  - 按鈕條藏著時是 invisible，Tab 不會停在看不到的按鈕上；visibility 也跟著過場，出現時一開始就能按、消失時滑完才藏
  - 整張可點用 stretched link（連結寫在內容裡，after 撐滿）；按鈕條本身不擋點擊，裡面的連結和按鈕 z-10 疊在上面
  - 被按鈕條蓋住的那一行用 panelClasses.js 的 fadeOnHover 淡出，懸停才出現的「›」用 showOnHover
  - 外框用 inset-ring，不佔版面，有沒有外框卡片大小都一樣
-->
<template>
  <article
    class="group/panel-card relative overflow-hidden rounded-8 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-action-primary"
    :class="[
      touch
        ? 'flex flex-col shadow-card'
        : 'bg-surface-glass-card hover:shadow-card focus-within:shadow-card',
      rings[highlight],
    ]"
  >
    <div
      class="flex items-center gap-12 p-12"
      :class="touch && ['bg-surface-glass-card', $slots.actions && 'pb-8']"
    >
      <slot />
    </div>
    <div
      v-if="$slots.actions"
      class="pointer-events-none flex items-center justify-between gap-20 px-12 py-8 [&_a,&_button]:pointer-events-auto [&_a,&_button]:relative [&_a,&_button]:z-10"
      :class="
        !touch &&
        'invisible absolute inset-x-0 bottom-0 h-[44px] translate-y-full bg-surface-glass-card transition-[translate,visibility] duration-200 ease-[cubic-bezier(0.2,0,0,1)] group-focus-within/panel-card:visible group-focus-within/panel-card:translate-y-0 group-hover/panel-card:visible group-hover/panel-card:translate-y-0 motion-reduce:transition-none'
      "
    >
      <slot name="actions" />
    </div>
  </article>
</template>
