import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { modeLabels, paceLabels, tableSortLabels } from '@/api/data/options'

// 尋找開放桌的搜尋字、遊戲模式、遊戲制度、排序都放在網址（PRD 7.5、產品規則 6.3 上一頁保留條件）。
// 都在同一頁裡改，用 replace：不多出瀏覽紀錄，從遊戲頁按上一頁回來條件還在。
// 不認得的值當作沒有（「全部」、預設排序不寫進網址）
export function useTableQuery() {
  const route = useRoute()
  const router = useRouter()

  const pick = (value, labels) => (value in labels ? value : '')

  const query = computed(() => route.query.q ?? '')
  const mode = computed(() => pick(route.query.mode, modeLabels))
  const pace = computed(() => pick(route.query.pace, paceLabels))
  const sort = computed(() => pick(route.query.sort, tableSortLabels) || 'newest')

  // 換網址要等一下才生效；連續改兩個條件時，第二個要接在第一個後面，不能從舊網址算
  let pending = null

  function update(changes) {
    const next = { ...(pending ?? route.query), ...changes }
    for (const key of Object.keys(next)) if (!next[key]) delete next[key]
    pending = next
    router.replace({ query: next }).finally(() => {
      if (pending === next) pending = null
    })
  }

  return {
    query,
    mode,
    pace,
    sort,
    // 給 API 用的參數
    params: computed(() => ({
      query: query.value,
      mode: mode.value ? [mode.value] : [],
      pace: pace.value ? [pace.value] : [],
      sort: sort.value,
    })),
    setQuery: (q) => update({ q }),
    setMode: (value) => update({ mode: value }),
    setPace: (value) => update({ pace: value }),
    setSort: (value) => update({ sort: value === 'newest' ? '' : value }),
    resetFilters: () => update({ mode: '', pace: '' }),
  }
}
