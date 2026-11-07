<script setup>
import { computed } from 'vue'
import { formatPlays, formatVersion } from '@/utils/format'

const props = defineProps({
  game: { type: Object, required: true },
})

// 沒有資料的那一列整列不顯示（2026-11-05 決定），不放一排破折號
const rows = computed(() => {
  const { designers, artists, publisher, year, developer } = props.game.credits
  return [
    { label: '設計師', value: designers.join(', ') },
    { label: '美術設計', value: artists.join(', ') },
    { label: '出版商', value: publisher },
    { label: '年份', value: year ? String(year) : '' },
    { label: '開發者', value: developer },
    { label: '遊戲場數', value: formatPlays(props.game.totalPlays) },
  ].filter((row) => row.value)
})
</script>

<!--
  Figma：遊戲資訊與版本更新（303:2287）。
  刻意和 Figma 不同：Figma 標籤和值之間固定隔 139，標籤長短不同時值對不齊，這裡把值對齊成一欄；
  版本紀錄的白底框 Figma 沒有內距、綁的是 Primitive（white-a73），這裡加 16 內距、改用一樣顏色的 surface/header
-->
<template>
  <div class="flex flex-col gap-32">
    <div class="flex flex-col gap-12">
      <h3 class="type-tc-heading-20 text-text-primary">遊戲資訊</h3>
      <dl class="flex flex-col gap-16">
        <div
          v-for="row in rows"
          :key="row.label"
          class="grid grid-cols-[120px_1fr] items-baseline gap-16 border-b border-border-default py-8"
        >
          <dt class="type-tc-body-16 text-text-body">{{ row.label }}</dt>
          <dd class="type-tc-body-13 text-text-body">{{ row.value }}</dd>
        </div>
      </dl>
    </div>

    <div class="flex flex-col gap-12">
      <h3 class="type-tc-heading-20 text-text-primary">版本更新</h3>
      <ol class="flex flex-col gap-12">
        <li
          v-for="entry in game.versions"
          :key="entry.version"
          class="flex flex-col gap-12 rounded-8 bg-surface-glass-card p-16"
        >
          <h4 class="type-tc-title-18 text-text-body">{{ formatVersion(entry) }}</h4>
          <ul class="flex flex-col gap-8 type-tc-label-14 text-text-body">
            <li v-for="note in entry.notes" :key="note">{{ note }}</li>
          </ul>
        </li>
      </ol>
    </div>
  </div>
</template>
