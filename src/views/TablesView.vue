<script setup>
import { computed, ref, watch } from 'vue'
import { modeLabels, paceLabels, tableSortLabels } from '@/api/data/options'
import { getSearchSuggestions } from '@/api/games'
import { getEmptyReason, getOpenTables } from '@/api/tables'
import { useJoinTable } from '@/composables/useJoinTable'
import { usePolling } from '@/composables/usePolling'
import { useRequest } from '@/composables/useRequest'
import { useTableQuery } from '@/composables/useTableQuery'
import BlockError from '@/components/BlockError.vue'
import SearchField from '@/components/SearchField.vue'
import SegmentedControl from '@/components/SegmentedControl.vue'
import SkeletonBlock from '@/components/SkeletonBlock.vue'
import OpenTablesList from '@/components/tables/OpenTablesList.vue'
import TablesEmpty from '@/components/tables/TablesEmpty.vue'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const { query, mode, pace, sort, params, setQuery, setMode, setPace, setSort, resetFilters } =
  useTableQuery()

const { data: tables, status, retry } = useRequest(() => getOpenTables(params.value))
const { removed, stateOf, join, afterRefresh, clear } = useJoinTable()

// 條件一變就重拿；比較晚回來的舊結果不會蓋掉新的（useRequest）
watch(params, () => {
  clear()
  retry()
})

const rows = computed(() => (tables.value ?? []).filter((table) => !removed.has(table.id)))

// 每 10 秒刷新（TABLE-06）：失敗時保留上一次的資料、不顯示錯誤（產品規則 5.3）；已額滿的這時候拿掉
usePolling(async () => {
  if (status.value !== 'success') return
  try {
    const next = await getOpenTables(params.value, { refresh: true })
    afterRefresh()
    tables.value = next
  } catch {
    // 下次再試
  }
}, 10_000)

// 沒有結果時是哪一種（查無遊戲、沒有開放桌、篩選後沒有），查無遊戲時再拿「也許你想找的是這些？」
const empty = ref(null)
let emptyRequest = 0
watch([status, () => rows.value.length], async ([state, count]) => {
  const id = ++emptyRequest
  if (state !== 'success' || count) {
    empty.value = null
    return
  }
  let reason = 'no-tables'
  let suggestions = []
  try {
    reason = await getEmptyReason(params.value)
    if (reason === 'no-game') suggestions = await getSearchSuggestions(params.value.query)
  } catch {
    // 拿不到原因時，當作沒有開放桌
  }
  if (id === emptyRequest) empty.value = { reason, suggestions }
})

const withAll = (labels) => [
  { value: '', label: '全部' },
  ...Object.entries(labels).map(([value, label]) => ({ value, label })),
]
const modeOptions = withAll(modeLabels)
const paceOptions = withAll(paceLabels)
</script>

<!--
  Figma：尋找開放桌（303:900、平板 908:8999）。
  篩選卡片：遊戲模式、遊戲制度（加了「全部」並預設選中，不做錦標賽，2026-11-06）、進階搜尋；條件都在網址（useTableQuery）。
  卡片底 Figma 綁 white-a73，改綁一樣顏色的 surface/header。
  列表先全部顯示（假資料 40 桌），真資料太多時再加「載入更多」。沒有結果時分三種（TablesEmpty）
-->
<template>
  <div class="flex flex-col gap-12 pt-20 pr-20 pb-40 pl-80 max-desktop:px-24 max-desktop:pt-20">
    <h1 class="sr-only">尋找開放桌</h1>

    <section
      aria-label="篩選開放桌"
      class="flex flex-wrap items-center justify-between gap-x-64 gap-y-16 rounded-8 bg-surface-header p-20"
    >
      <div class="flex flex-wrap items-center gap-x-40 gap-y-16">
        <SegmentedControl
          :model-value="mode"
          legend="遊戲模式"
          :options="modeOptions"
          @update:model-value="setMode"
        />
        <SegmentedControl
          :model-value="pace"
          legend="遊戲制度"
          :options="paceOptions"
          @update:model-value="setPace"
        />
      </div>
      <div class="flex items-center gap-4">
        <span class="type-tc-heading-20 text-text-primary" aria-hidden="true">進階搜尋：</span>
        <SearchField
          :query="query"
          label="用遊戲名稱搜尋開放桌"
          class="w-[259px]"
          @search="setQuery"
        />
      </div>
    </section>

    <section aria-labelledby="tables-title" class="flex flex-col gap-8">
      <div class="flex flex-wrap items-center justify-between gap-x-20 gap-y-8 p-8">
        <h2 id="tables-title" class="type-tc-heading-24 text-text-primary">
          現正開桌：共 {{ status === 'success' ? rows.length : '—' }} 個結果
        </h2>
        <div class="flex items-center gap-12">
          <p class="type-tc-body-13 text-text-secondary">每 10 秒自動刷新開桌情形</p>
          <Select :model-value="sort" @update:model-value="setSort">
            <SelectTrigger class="w-[192px]" aria-label="排序方式">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="(label, key) in tableSortLabels" :key="key" :value="key">
                {{ label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div v-if="status === 'loading' && !tables" class="flex flex-col gap-8" aria-busy="true">
        <SkeletonBlock class="h-[52px] w-full rounded-t-8" />
        <SkeletonBlock
          v-for="n in 5"
          :key="n"
          class="h-[88px] w-full rounded-8 max-desktop:h-[104px]"
        />
      </div>
      <BlockError v-else-if="status === 'error'" @retry="retry" />
      <template v-else-if="!rows.length">
        <TablesEmpty
          v-if="empty"
          :reason="empty.reason"
          :query="query"
          :suggestions="empty.suggestions"
          @clear-search="setQuery('')"
          @reset-filters="resetFilters"
        />
      </template>
      <OpenTablesList
        v-else
        :tables="rows"
        :state-of="stateOf"
        :class="status === 'loading' && 'opacity-60'"
        :aria-busy="status === 'loading'"
        @join="join"
      />
    </section>
  </div>
</template>
