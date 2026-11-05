<script setup>
import { computed, nextTick, ref, useTemplateRef } from 'vue'
import { filterCategories } from '@/api/data/options'
import { filtersToQuery } from '@/utils/filters'
import FilterTag from '@/components/search/FilterTag.vue'

const props = defineProps({
  game: { type: Object, required: true },
})

// 只顯示多選類（特定類型、機制、主題），單選類（人數、時間、複雜度）不當標籤（GAME-01、產品規則 3.4）
const LIMIT = 5
const tags = computed(() =>
  ['types', 'mechanics', 'themes'].flatMap((key) => {
    const category = filterCategories.find((item) => item.key === key)
    return props.game[key].map((value) => ({
      key: `${key}:${value}`,
      color: category.color,
      label: category.labels[value],
      // 點標籤：前往已套用這個條件的搜尋結果（從別頁進搜尋結果是 push，上一頁回得來）
      to: { name: 'search', query: filtersToQuery({ [key]: [value] }) },
    }))
  }),
)

const expanded = ref(false)
const shown = computed(() => (expanded.value ? tags.value : tags.value.slice(0, LIMIT)))

// 按「+N」後按鈕不見了，焦點移到第一個剛展開的標籤，鍵盤使用者才不會跳回頁首
const list = useTemplateRef('list')
async function expand() {
  expanded.value = true
  await nextTick()
  list.value.querySelectorAll('a')[LIMIT]?.focus()
}
</script>

<!--
  Figma：Filter/Active Tag 的六種顏色和 category=more（「+N」：半透明玻璃底、白字，hover 變亮）。
  最多 5 個，超過時第 6 個位置是「+N」，點了在原處展開全部（GAME-01）
-->
<template>
  <ul ref="list" class="flex flex-wrap gap-8" aria-label="遊戲標籤">
    <li v-for="tag in shown" :key="tag.key">
      <FilterTag :color="tag.color" :to="tag.to">{{ tag.label }}</FilterTag>
    </li>
    <li v-if="!expanded && tags.length > LIMIT">
      <button
        type="button"
        class="inline-flex min-h-(--tap-tag-min-height) items-center rounded-4 bg-surface-glass-nav px-8 py-4 type-tc-body-13 text-text-inverse backdrop-blur-[10px] hover:bg-surface-glass-light"
        @click="expand"
      >
        +{{ tags.length - LIMIT }}
        <span class="sr-only">，顯示全部標籤</span>
      </button>
    </li>
  </ul>
</template>
