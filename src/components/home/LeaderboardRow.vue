<script setup>
import { computed } from 'vue'
import { formatCountry, formatScore } from '@/utils/format'
import { flagUrl } from '@/utils/flags'
import medal1 from '@/assets/icons/medal-1.svg'
import medal2 from '@/assets/icons/medal-2.svg'
import medal3 from '@/assets/icons/medal-3.svg'

const props = defineProps({
  // { rank, name, avatar, countryCode, score }
  entry: { type: Object, required: true },
  // 自己那一列：名次用實心藍底，名字不加粗
  self: { type: Boolean, default: false },
})

const medals = { 1: medal1, 2: medal2, 3: medal3 }
const medal = computed(() => (props.self ? null : medals[props.entry.rank]))
</script>

<!-- Figma：List/Leaderboard Row（rank=1～3 獎牌、rank=default 數字圈、rank=self 自己） -->
<template>
  <div class="flex items-center justify-between gap-8 rounded-8 bg-surface-default px-8 py-4">
    <div class="flex items-center gap-8">
      <img v-if="medal" :src="medal" :alt="`第 ${entry.rank} 名`" width="29" height="36" />
      <span
        v-else
        class="rounded-16 type-en-body-13-strong"
        :class="
          self
            ? 'bg-surface-brand px-12 text-text-inverse'
            : 'bg-selection-bg px-8 py-4 text-text-brand-strong inset-ring-2 inset-ring-action-primary'
        "
      >
        <span class="sr-only">第</span>{{ entry.rank }}<span class="sr-only">名</span>
      </span>
      <img
        :src="entry.avatar"
        alt=""
        width="36"
        height="36"
        class="size-[36px] rounded-full bg-surface-placeholder object-cover"
        :class="medal && 'ring-2 ring-border-accent'"
      />
      <div class="flex flex-col">
        <span class="text-text-body" :class="self ? 'type-en-body-13' : 'type-en-body-13-strong'">
          {{ entry.name }}
        </span>
        <span class="flex items-center gap-4 type-en-caption-11 text-text-body">
          <img :src="flagUrl(entry.countryCode)" alt="" width="16" height="12" />
          {{ formatCountry(entry.countryCode) }}
        </span>
      </div>
    </div>
    <span class="type-en-body-13 text-text-body">{{ formatScore(entry.score) }}</span>
  </div>
</template>
