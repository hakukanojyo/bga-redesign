import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { sortLabels } from '@/api/data/options'
import { filtersFromQuery, filtersToQuery, hasFilters } from '@/utils/filters'

// 搜尋字、篩選條件、排序都放在網址（PRD 7.2 第 8 條、7.3 第 3 條），首頁和搜尋結果頁共用這一份規則：
// - 從別頁進搜尋結果是 push（上一頁回得去）；已經在搜尋結果頁就 replace（不多出瀏覽紀錄，決定見 #25）
// - 搜尋和篩選擇一：送出搜尋清掉篩選，套用篩選清掉搜尋字（PRD 7.3 第 9 條）
// - 搜尋字和篩選都清空時回首頁：從首頁進來的當作上一頁，直接貼連結進來的換成首頁（PRD 7.2 第 7 條）
export function useSearchQuery() {
  const route = useRoute()
  const router = useRouter()

  const query = computed(() => route.query.q ?? '')
  const filters = computed(() => filtersFromQuery(route.query))
  const sort = computed(() => (route.query.sort in sortLabels ? route.query.sort : 'popular'))

  function leaveSearch() {
    const back = window.history.state?.back
    if (back && router.resolve(back).name === 'home') router.back()
    else router.replace({ name: 'home', query: { scenario: route.query.scenario } })
  }

  function update(changes) {
    const next = { ...route.query, ...changes }
    const empty = !next.q && !hasFilters(filtersFromQuery(next))
    if (route.name !== 'search') {
      if (!empty) router.push({ name: 'search', query: next })
    } else if (empty) {
      leaveSearch()
    } else {
      router.replace({ query: next })
    }
  }

  const noFilters = () => filtersToQuery({})

  return {
    query,
    filters,
    sort,
    search: (q) => update({ q: q || undefined, ...noFilters() }),
    setFilters: (next) => update({ q: undefined, ...filtersToQuery(next) }),
    resetFilters: () => update(noFilters()),
    setSort: (value) => update({ sort: value === 'popular' ? undefined : value }),
  }
}
