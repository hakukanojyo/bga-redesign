<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getGames, getSearchSuggestions } from '@/api/games'
import { sortLabels } from '@/api/data/options'
import { useRequest } from '@/composables/useRequest'
import ConnectionError from '@/components/ConnectionError.vue'
import GameCard from '@/components/GameCard.vue'
import SkeletonBlock from '@/components/SkeletonBlock.vue'
import SearchEmpty from '@/components/search/SearchEmpty.vue'
import SearchSidebar from '@/components/search/SearchSidebar.vue'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const route = useRoute()
const router = useRouter()

// 條件都放在網址（PRD 7.2 第 8 條）：重新整理、上一頁、分享連結都保得住。預設的熱門排序不寫進網址
const query = computed(() => route.query.q ?? '')
const sort = computed(() => (route.query.sort in sortLabels ? route.query.sort : 'popular'))

const { data, status, retry } = useRequest(() => getGames({ query: query.value, sort: sort.value }))
watch([query, sort], retry)

const games = computed(() => data.value ?? [])

// 在搜尋結果頁裡換排序用 replace：按上一頁回到進來前的頁面（決定見 #25）
function changeSort(value) {
  router.replace({ query: { ...route.query, sort: value === 'popular' ? undefined : value } })
}

function clearSearch() {
  router.replace({ query: { ...route.query, q: undefined } })
}

// 沒結果時才拿「也許你想找的是這些？」；拿不到就不顯示那一區，不影響整頁
const suggestions = ref([])
watch([status, query], async () => {
  suggestions.value = []
  if (status.value !== 'success' || games.value.length || !query.value) return
  const q = query.value
  try {
    const result = await getSearchSuggestions(q)
    if (q === query.value) suggestions.value = result
  } catch {
    // 推薦是附加的，失敗就不顯示
  }
})

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
        @clear="clearSearch"
      />

      <template v-else>
        <div class="flex items-center justify-between gap-16 p-8 max-desktop:px-0">
          <!-- 換條件後結果數會變，螢幕閱讀器念出新的數字 -->
          <h1 class="type-tc-heading-20 text-text-primary" aria-live="polite">
            共 {{ games.length }} 個結果
          </h1>
          <Select :model-value="sort" @update:model-value="changeSort">
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
