<script setup>
import { computed, ref, watch } from 'vue'
import { getFilterSuggestion, getGames, getSearchSuggestions } from '@/api/games'
import { sortLabels } from '@/api/data/options'
import { useRequest } from '@/composables/useRequest'
import { useSearchQuery } from '@/composables/useSearchQuery'
import { hasFilters } from '@/utils/filters'
import ConnectionError from '@/components/ConnectionError.vue'
import GameCard from '@/components/GameCard.vue'
import SkeletonBlock from '@/components/SkeletonBlock.vue'
import FilterEmpty from '@/components/search/FilterEmpty.vue'
import SearchEmpty from '@/components/search/SearchEmpty.vue'
import SearchSidebar from '@/components/search/SearchSidebar.vue'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// 條件都放在網址，換條件的規則（push／replace、擇一、清空回首頁）在 useSearchQuery
const { query, filters, sort, search, setFilters, resetFilters, setSort } = useSearchQuery()

const { data, status, retry } = useRequest(() =>
  getGames({ query: query.value, filters: filters.value, sort: sort.value }),
)
watch([query, filters, sort], retry)

const games = computed(() => data.value ?? [])

// 沒結果時才拿推薦：搜尋沒結果是「也許你想找的是這些？」，篩選沒結果是建議移除的條件和替代推薦。
// 推薦是附加的，拿不到就不顯示那一區，不影響整頁
const suggestions = ref([])
const relaxed = ref(null)
watch([status, query, filters], async () => {
  suggestions.value = []
  relaxed.value = null
  if (status.value !== 'success' || games.value.length) return
  const key = JSON.stringify([query.value, filters.value])
  try {
    if (query.value) {
      const result = await getSearchSuggestions(query.value)
      if (key === JSON.stringify([query.value, filters.value])) suggestions.value = result
    } else {
      const result = await getFilterSuggestion(filters.value)
      if (key === JSON.stringify([query.value, filters.value])) relaxed.value = result
    }
  } catch {
    // 推薦失敗就不顯示
  }
})

function applyRelax() {
  setFilters({ ...filters.value, [relaxed.value.remove.key]: [] })
}

// 第一次載入顯示骨架；之後換條件時舊結果留著，新的回來再換（產品規則 5.1）
const firstLoad = computed(() => status.value === 'loading' && data.value === null)
</script>

<!--
  Figma：搜尋結果（584:10392）、平板（908:8054）。版面和首頁一樣：桌面左欄 382、右邊內容；平板快速搜尋在內容上方。
  結果卡片 3 欄，小卡固定 175 高、寬度跟著欄寬（桌面 277、平板約 229）。
  失敗時整頁換成連線錯誤，搜尋字還在網址和搜尋框裡，重新嘗試後一樣（產品規則 5.3）
-->
<template>
  <div class="flex max-desktop:flex-col">
    <SearchSidebar />
    <div class="flex min-w-0 flex-1 flex-col gap-12 px-20 pt-20 pb-40 max-desktop:px-24">
      <div v-if="status === 'error'" class="flex flex-1 items-center justify-center">
        <ConnectionError @retry="retry" />
      </div>

      <template v-else-if="firstLoad">
        <SkeletonBlock class="h-[44px] w-full rounded-8" />
        <div class="grid grid-cols-3 gap-12 max-desktop:gap-16">
          <SkeletonBlock v-for="n in 9" :key="n" class="h-[175px] rounded-8" />
        </div>
      </template>

      <SearchEmpty
        v-else-if="!games.length && query"
        :query="query"
        :suggestions="suggestions"
        @clear="search('')"
      />
      <FilterEmpty
        v-else-if="!games.length && hasFilters(filters)"
        :remove="relaxed?.remove"
        :games="relaxed?.games"
        @apply="applyRelax"
        @reset="resetFilters"
      />

      <template v-else>
        <div class="flex items-center justify-between gap-16 p-8 max-desktop:px-0">
          <!-- 換條件後結果數會變，螢幕閱讀器念出新的數字 -->
          <h1 class="type-tc-heading-20 text-text-primary" aria-live="polite">
            共 {{ games.length }} 個結果
          </h1>
          <Select :model-value="sort" @update:model-value="setSort">
            <SelectTrigger class="w-[192px]" aria-label="排序方式">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="(label, key) in sortLabels" :key="key" :value="key">
                {{ label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ul
          class="grid grid-cols-3 gap-12 transition-opacity max-desktop:gap-16"
          :class="status === 'loading' && 'opacity-60'"
          :aria-busy="status === 'loading'"
        >
          <li v-for="game in games" :key="game.slug">
            <GameCard :game="game" size="small" fluid />
          </li>
        </ul>
      </template>
    </div>
  </div>
</template>
