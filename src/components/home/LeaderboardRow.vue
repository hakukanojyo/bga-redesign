<script setup>
import { computed } from 'vue'
import { formatCountry, formatScore } from '@/utils/format'
import { flagUrl } from '@/utils/flags'
import UserAvatar from '@/components/UserAvatar.vue'
import medal1 from '@/assets/icons/medal-1.svg'
import medal2 from '@/assets/icons/medal-2.svg'
import medal3 from '@/assets/icons/medal-3.svg'

const props = defineProps({
  // { rank, name, avatar, isPremium, countryCode, score }；isPremium 的頭像有黃框（尊榮會員）
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
    <!-- min-w-0：flex 子元素預設不會比內容窄，不加的話名字太長時 truncate 不會生效 -->
    <div class="flex min-w-0 items-center gap-8">
      <img
        v-if="medal"
        :src="medal"
        :alt="`第 ${entry.rank} 名`"
        width="29"
        height="36"
        class="shrink-0"
      />
      <span
        v-else
        class="shrink-0 rounded-16 type-en-body-13-strong"
        :class="
          self
            ? 'bg-surface-brand px-12 text-text-inverse'
            : 'bg-selection-bg px-8 py-4 text-text-brand-strong inset-ring-2 inset-ring-action-primary'
        "
      >
        <span class="sr-only">第</span>{{ entry.rank }}<span class="sr-only">名</span>
      </span>
      <UserAvatar :user="entry" :size="36" />
      <div class="flex min-w-0 flex-col">
        <span
          class="truncate text-text-body"
          :class="self ? 'type-en-body-13' : 'type-en-body-13-strong'"
        >
          {{ entry.name }}
        </span>
        <span class="flex items-center gap-4 type-en-caption-11 text-text-body">
          <img :src="flagUrl(entry.countryCode)" alt="" width="16" height="12" />
          {{ formatCountry(entry.countryCode) }}
        </span>
      </div>
    </div>
    <span class="shrink-0 type-en-body-13 text-text-body">{{ formatScore(entry.score) }}</span>
  </div>
</template>
