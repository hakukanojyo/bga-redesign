<script setup>
import { computed } from 'vue'

const props = defineProps({
  // { playing, online }；載入中和失敗是 null
  stats: { type: Object, default: null },
  // rail：右側欄（兩行文字）；bar：底部導覽列（兩列，每列一個數字）
  layout: { type: String, default: 'rail' },
})

// 載入中和失敗都顯示「—」，不顯示錯誤（LAYOUT-05）
const playing = computed(() => props.stats?.playing.toLocaleString('zh-TW') ?? '—')
const online = computed(() => props.stats?.online.toLocaleString('zh-TW') ?? '—')
</script>

<template>
  <div v-if="layout === 'rail'">
    <div class="flex gap-4" aria-hidden="true">
      <span class="size-[7px] rounded-full bg-selection-accent shadow-glow-status-blue" />
      <span class="size-[7px] rounded-full bg-status-online shadow-glow-status-green" />
    </div>
    <p class="py-8 type-tc-body-13 text-text-secondary">
      <span class="text-selection-accent">對戰中</span> /
      <span class="text-status-online">上線人數</span><br />
      <span class="text-selection-accent">{{ playing }}</span> /
      <span class="text-status-online">{{ online }}</span>
    </p>
  </div>

  <div v-else class="flex flex-col gap-4">
    <p class="flex items-center gap-8 text-selection-accent">
      <span class="size-[7px] rounded-full bg-current shadow-glow-status-blue" />
      <span class="type-tc-caption-11">對戰中</span>
      <span class="type-en-caption-11">{{ playing }}</span>
    </p>
    <p class="flex items-center gap-8 text-status-online">
      <span class="size-[7px] rounded-full bg-current shadow-glow-status-green" />
      <span class="type-tc-caption-11">上線</span>
      <span class="type-en-caption-11">{{ online }}</span>
    </p>
  </div>
</template>
