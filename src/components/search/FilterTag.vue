<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

defineProps({
  // filterCategories 的 color：players、time、complexity、mechanics、topic、type
  color: { type: String, required: true },
  // 有 × 可以移除（已套用條件）；沒有的話只是顯示（篩選沒結果的「移除『…』」）
  removable: { type: Boolean, default: false },
})
defineEmits(['remove'])

// Tailwind 要看得到完整的 class 名稱才會產生，所以不用字串拼接
const colors = {
  players: 'bg-filter-players-bg text-filter-players-ink',
  time: 'bg-filter-time-bg text-filter-time-ink',
  complexity: 'bg-filter-complexity-bg text-filter-complexity-ink',
  mechanics: 'bg-filter-mechanics-bg text-filter-mechanics-ink',
  topic: 'bg-filter-topic-bg text-filter-topic-ink',
  type: 'bg-filter-type-bg text-filter-type-ink',
}
const hovers = {
  players: 'hover:bg-filter-players-bg-hover',
  time: 'hover:bg-filter-time-bg-hover',
  complexity: 'hover:bg-filter-complexity-bg-hover',
  mechanics: 'hover:bg-filter-mechanics-bg-hover',
  topic: 'hover:bg-filter-topic-bg-hover',
  type: 'hover:bg-filter-type-bg-hover',
}
</script>

<!--
  Figma：Filter/Active Tag（540:1062）。底色和文字用各類的 filter/*；time 的文字 Figma 原本是 text/body，
  和其他五類不一致，改成 filter/time/ink（Figma 已同步）。可以移除時整顆是按鈕，螢幕閱讀器念「移除條件：…」
-->
<template>
  <button
    v-if="removable"
    type="button"
    class="inline-flex min-h-(--tap-tag-min-height) items-center gap-4 rounded-4 px-8 py-4 type-tc-body-13"
    :class="[colors[color], hovers[color]]"
    @click="$emit('remove')"
  >
    <span class="sr-only">移除條件：</span>
    <slot />
    <FontAwesomeIcon :icon="faXmark" class="text-[10px]" aria-hidden="true" />
  </button>
  <span
    v-else
    class="inline-flex min-h-(--tap-tag-min-height) items-center rounded-4 px-8 py-4 type-tc-body-13"
    :class="colors[color]"
  >
    <slot />
  </span>
</template>
