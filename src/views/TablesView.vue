<script setup>
import { computed, ref, watch } from 'vue'
import { modeLabels, paceLabels, tableSortLabels } from '@/api/data/options'
import { getSearchSuggestions } from '@/api/games'
import { getEmptyReason, getOpenTables, TABLES_PAGE_SIZE } from '@/api/tables'
import { useJoinTable } from '@/composables/useJoinTable'
import { usePolling } from '@/composables/usePolling'
import { useRequest } from '@/composables/useRequest'
import { useTableQuery } from '@/composables/useTableQuery'
import { toast } from '@/utils/toast'
import AppButton from '@/components/AppButton.vue'
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

// data：{ total, tables }，tables 是已經載入的（一開始 20 桌，按「載入更多」再接 20 桌）
const { data, status, retry } = useRequest(() => getOpenTables(params.value))
const { removed, stateOf, join, afterRefresh, clear } = useJoinTable()

// 條件一變就從第一批重拿；比較晚回來的舊結果不會蓋掉新的（useRequest）
watch(params, () => {
  clear()
  retry()
})

const rows = computed(() => (data.value?.tables ?? []).filter((table) => !removed.has(table.id)))
// 剛加入、已經拿掉的桌也不算（伺服器那邊它已經不在列表裡了）
const total = computed(() => (data.value ? data.value.total - removed.size : 0))
const remaining = computed(() => Math.max(0, total.value - rows.value.length))

// 載入更多（#40）：接著已經載入的往下拿 20 桌，接在後面；重複的不再放（刷新時可能已經往前移）
const loadingMore = ref(false)
async function loadMore() {
  loadingMore.value = true
  try {
    const next = await getOpenTables(params.value, { offset: rows.value.length })
    const known = new Set(data.value.tables.map((table) => table.id))
    data.value = {
      total: next.total,
      tables: [...data.value.tables, ...next.tables.filter((table) => !known.has(table.id))],
    }
  } catch {
    toast.error('操作失敗 請再試一次')
  } finally {
    loadingMore.value = false
  }
}

// 每 10 秒刷新（TABLE-06）：只重拿已經載入的數量，不會因為刷新又縮回 20 桌；
// 失敗時保留上一次的資料、不顯示錯誤（產品規則 5.3）；已額滿的這時候拿掉
usePolling(async () => {
  if (status.value !== 'success' || loadingMore.value) return
  try {
    const limit = Math.max(TABLES_PAGE_SIZE, rows.value.length)
    const next = await getOpenTables(params.value, { refresh: true, limit })
    afterRefresh()
    data.value = next
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
  卡片底 surface/glass-panel（白 56%，和遊戲頁章節導覽一樣；2026-11-06 從 73% 調淡）。
  一次載入 20 桌，底部「載入更多（還有 N 桌）」再接 20 桌；刷新時重拿已載入的數量。沒有結果時分三種（TablesEmpty）
-->
<template>
  <div class="flex flex-col gap-12 pt-20 pr-20 pb-40 pl-80 max-desktop:px-24 max-desktop:pt-20">
    <h1 class="sr-only">尋找開放桌</h1>

    <!--
      撐滿整張卡（2026-11-06）：桌面第一排模式、制度各佔一半（間隔 40），第二排搜尋框整排；
      平板一組一排，不然每個選項只剩 71 寬、文字會被擠成兩行
    -->
    <section
      aria-label="篩選開放桌"
      class="grid grid-cols-2 gap-x-40 gap-y-16 rounded-8 bg-surface-glass-panel p-20 max-desktop:grid-cols-1"
    >
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
      <div class="col-span-full flex items-center gap-4">
        <span class="shrink-0 type-tc-heading-20 text-text-primary" aria-hidden="true">
          進階搜尋：
        </span>
        <SearchField
          :query="query"
          label="用遊戲名稱搜尋開放桌"
          class="flex-1"
          @search="setQuery"
        />
      </div>
    </section>

    <section aria-labelledby="tables-title" class="flex flex-col gap-8">
      <div class="flex flex-wrap items-center justify-between gap-x-20 gap-y-8 p-8">
        <h2 id="tables-title" class="type-tc-heading-24 text-text-primary">
          現正開桌：共 {{ status === 'success' ? total : '—' }} 個結果
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

      <div v-if="status === 'loading' && !data" class="flex flex-col gap-8" aria-busy="true">
        <SkeletonBlock class="h-[52px] w-full rounded-t-8" />
        <SkeletonBlock
          v-for="n in 5"
          :key="n"
          class="h-[88px] w-full rounded-8 max-desktop:h-[104px]"
        />
      </div>
      <BlockError v-else-if="status === 'error'" @retry="retry" />
      <!-- 上下 32：吉祥物和標題列拉開、按鈕和頁尾拉開（PageState 本身不帶外圍內距） -->
      <div v-else-if="!rows.length" class="py-32">
        <TablesEmpty
          v-if="empty"
          :reason="empty.reason"
          :query="query"
          :suggestions="empty.suggestions"
          @clear-search="setQuery('')"
          @reset-filters="resetFilters"
        />
      </div>
      <template v-else>
        <OpenTablesList
          :tables="rows"
          :state-of="stateOf"
          :class="status === 'loading' && 'opacity-60'"
          :aria-busy="status === 'loading'"
          @join="join"
        />
        <!--
          用按鈕不用捲到底自動載入：這頁有頁尾、會定時刷新，使用者是來挑一桌的（決定見 #40）。
          和列表一樣寬：看得出是這張列表的一部分，也比較好按。
          載入中只換文字、不能再按，維持次要按鈕的樣子（AppButton 的 aria-busy 是給主要按鈕的「按下」樣式）
        -->
        <AppButton
          v-if="remaining"
          variant="secondary"
          class="mt-12 w-full"
          :aria-disabled="loadingMore || undefined"
          @click="!loadingMore && loadMore()"
        >
          {{ loadingMore ? '載入中…' : `載入更多（還有 ${remaining} 桌）` }}
        </AppButton>
      </template>
    </section>
  </div>
</template>
