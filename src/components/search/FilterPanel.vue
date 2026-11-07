<script>
import { ref } from 'vue'

// 展開哪幾類：放在元件外面，首頁點了條件換到搜尋結果頁（新的一個篩選欄）時還是一樣。
// 桌面可以同時開好幾類（預設玩家數），平板一次一類、預設都收起（PRD 7.3 第 6 條）
const expanded = ref(['players'])
const tabletOpen = ref(null)
// 從首頁點條件換頁後，把鍵盤焦點接回剛剛按的那個選項
let focusTarget = null
</script>

<script setup>
import { nextTick, onMounted, useTemplateRef } from 'vue'
import { useRoute } from 'vue-router'
import { useMediaQuery } from '@vueuse/core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faBrain,
  faChessRook,
  faClock,
  faClone,
  faDiceFive,
  faUserGroup,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { filterCategories } from '@/api/data/options'
import { useSearchQuery } from '@/composables/useSearchQuery'
import { hasFilters } from '@/utils/filters'
import FilterOptions from '@/components/search/FilterOptions.vue'
import FilterTag from '@/components/search/FilterTag.vue'

const route = useRoute()
const { filters, setFilters, resetFilters } = useSearchQuery()

// 桌面和平板的版面不同（直的收合列表／橫的分類加一個面板），用同一個斷點二選一渲染；
// 兩份都放在頁面上再用 CSS 藏的話，同名的 radio 會互相影響，螢幕閱讀器也會讀到兩次
const isTablet = useMediaQuery('(width < 1280px)')

const icons = {
  players: faUserGroup,
  time: faClock,
  complexity: faBrain,
  mechanics: faClone,
  themes: faChessRook,
  types: faDiceFive,
}

// 每類的顏色；Tailwind 要看得到完整的 class 名稱。
// head：桌面標題列、平板分類標籤；body：選項的底色
// open：平板分類標籤的厚度和展開中的外框（Figma Filter/Category Chip state=selected）。用內陰影不用 border：
// border 左右透明、底部有色時，圓角處會斜切得不順；內陰影跟著圓角走，也不佔版面，展開時不會跳（2026-11-07）
const colors = {
  players: {
    head: 'border-b-filter-players-ink bg-filter-players-bg text-filter-players-ink hover:bg-filter-players-bg-hover',
    open: 'shadow-[inset_0_-2px_0_var(--color-filter-players-ink)] aria-expanded:bg-filter-players-bg-hover aria-expanded:shadow-[inset_0_0_0_2px_var(--color-filter-players-ink)]',
    body: 'bg-filter-players-surface',
  },
  time: {
    head: 'border-b-filter-time-ink bg-filter-time-bg text-filter-time-ink hover:bg-filter-time-bg-hover',
    open: 'shadow-[inset_0_-2px_0_var(--color-filter-time-ink)] aria-expanded:bg-filter-time-bg-hover aria-expanded:shadow-[inset_0_0_0_2px_var(--color-filter-time-ink)]',
    body: 'bg-filter-time-surface',
  },
  complexity: {
    head: 'border-b-filter-complexity-ink bg-filter-complexity-bg text-filter-complexity-ink hover:bg-filter-complexity-bg-hover',
    open: 'shadow-[inset_0_-2px_0_var(--color-filter-complexity-ink)] aria-expanded:bg-filter-complexity-bg-hover aria-expanded:shadow-[inset_0_0_0_2px_var(--color-filter-complexity-ink)]',
    body: 'bg-filter-complexity-surface',
  },
  mechanics: {
    head: 'border-b-filter-mechanics-ink bg-filter-mechanics-bg text-filter-mechanics-ink hover:bg-filter-mechanics-bg-hover',
    open: 'shadow-[inset_0_-2px_0_var(--color-filter-mechanics-ink)] aria-expanded:bg-filter-mechanics-bg-hover aria-expanded:shadow-[inset_0_0_0_2px_var(--color-filter-mechanics-ink)]',
    body: 'bg-filter-mechanics-surface',
  },
  topic: {
    head: 'border-b-filter-topic-ink bg-filter-topic-bg text-filter-topic-ink hover:bg-filter-topic-bg-hover',
    open: 'shadow-[inset_0_-2px_0_var(--color-filter-topic-ink)] aria-expanded:bg-filter-topic-bg-hover aria-expanded:shadow-[inset_0_0_0_2px_var(--color-filter-topic-ink)]',
    body: 'bg-filter-topic-surface',
  },
  type: {
    head: 'border-b-filter-type-ink bg-filter-type-bg text-filter-type-ink hover:bg-filter-type-bg-hover',
    open: 'shadow-[inset_0_-2px_0_var(--color-filter-type-ink)] aria-expanded:bg-filter-type-bg-hover aria-expanded:shadow-[inset_0_0_0_2px_var(--color-filter-type-ink)]',
    body: 'bg-filter-type-surface',
  },
}

function toggleCategory(key) {
  expanded.value = expanded.value.includes(key)
    ? expanded.value.filter((item) => item !== key)
    : [...expanded.value, key]
}

// 平板：點另一類就換過去，再點一次同一類收起；選了選項不收（多選常常連選好幾個）
function toggleTablet(key) {
  tabletOpen.value = tabletOpen.value === key ? null : key
}

// 單選再點一次已選的就取消（PRD 7.3 第 1 條）；多選切換加入或移除
function toggle({ key, multiple }, value) {
  const current = filters.value[key]
  const next = current.includes(value)
    ? current.filter((item) => item !== value)
    : multiple
      ? [...current, value]
      : [value]
  if (route.name !== 'search') focusTarget = `${key}:${value}`
  setFilters({ ...filters.value, [key]: next })
}

// 已套用的條件，依類別順序排；移除最後一個時回首頁（useSearchQuery）
const activeTags = () =>
  filterCategories.flatMap((category) =>
    filters.value[category.key].map((value) => ({ category, value })),
  )

const openCategory = () => filterCategories.find((category) => category.key === tabletOpen.value)

const panel = useTemplateRef('panel')
onMounted(async () => {
  if (!focusTarget) return
  const target = focusTarget
  focusTarget = null
  await nextTick()
  panel.value.querySelector(`[data-option="${target}"]`)?.focus()
})
</script>

<!--
  Figma：桌面搜尋結果左欄「篩選條件 FILTERS」、Filter/Players～Topic（389:6719 等）、Filter/Active Tag（540:1062）；
  平板 Filter/Category Chip（872:9124）、Filter/Options Panel（872:9092）、首頁｜Tablet｜篩選展開（903:8027）。
  標題列、分類標籤是按鈕，aria-expanded 告訴螢幕閱讀器展開了沒有。
  不用 h3：整個左欄排在頁面的 h1 前面，用標題會讓層級顛倒（和「快速搜尋」一樣）。
  分類標籤平常只有底線、展開時四邊外框：四邊都先留 2 的透明框，展開時才上色，寬度不會跳
-->
<template>
  <div ref="panel" class="flex flex-col gap-12">
    <!-- 平板：「篩選條件：」＋一排可以左右滑的分類，點了在下面展開那一類的選項 -->
    <div v-if="isTablet" class="flex gap-12">
      <p class="w-[95px] shrink-0 pt-12 type-tc-title-16 text-text-primary">篩選條件：</p>
      <div class="flex min-w-0 flex-1 flex-col gap-12">
        <ul class="flex gap-12 overflow-x-auto [scrollbar-width:none]">
          <li v-for="category in filterCategories" :key="category.key" class="shrink-0">
            <button
              type="button"
              class="flex h-[48px] items-center gap-4 rounded-12 px-16 type-tc-title-16 whitespace-nowrap"
              :class="[colors[category.color].head, colors[category.color].open]"
              :aria-expanded="tabletOpen === category.key"
              aria-controls="filter-tablet-panel"
              @click="toggleTablet(category.key)"
            >
              <FontAwesomeIcon :icon="icons[category.key]" class="text-[16px]" aria-hidden="true" />
              {{ category.title }}
            </button>
          </li>
        </ul>
        <div
          v-if="openCategory()"
          id="filter-tablet-panel"
          class="rounded-12 px-16 py-12"
          :class="colors[openCategory().color].body"
        >
          <FilterOptions
            :category="openCategory()"
            :selected="filters[openCategory().key]"
            @toggle="toggle(openCategory(), $event)"
          />
        </div>
      </div>
    </div>

    <!--
      目前套用條件（FILT-08）：有條件時才出現，沒有條件時整區不顯示（PRD 7.3 第 4 條）。桌面在分類上面、平板在下面。
      桌面和下面的分類列表多隔 4（共 16），比分類之間的 12 寬一點，看得出是兩組
      因為搜尋和篩選擇一、清空時回首頁，同一頁裡從 0 變 1 只有「搜尋模式點第一個條件」一種情況，那時結果本來就整個換掉
    -->
    <div
      v-if="hasFilters(filters)"
      class="flex flex-col gap-8"
      :class="isTablet ? '' : 'border-t border-border-subtle pt-12 pb-4'"
    >
      <div class="flex items-center justify-between gap-8">
        <p class="type-tc-title-16 text-text-primary">目前套用條件</p>
        <button
          type="button"
          class="flex min-h-(--tap-tag-min-height) items-center gap-4 type-tc-body-13 text-text-danger hover:underline"
          @click="resetFilters"
        >
          <FontAwesomeIcon :icon="faXmark" class="text-[12px]" aria-hidden="true" />
          重設所有條件
        </button>
      </div>
      <ul class="flex flex-wrap gap-8" aria-label="目前套用條件">
        <li v-for="{ category, value } in activeTags()" :key="`${category.key}:${value}`">
          <FilterTag :color="category.color" removable @remove="toggle(category, value)">
            {{ category.labels[value] }}
          </FilterTag>
        </li>
      </ul>
    </div>

    <!-- 桌面：直的收合列表，可以同時展開好幾類 -->
    <template v-if="!isTablet">
      <section
        v-for="category in filterCategories"
        :key="category.key"
        class="overflow-hidden rounded-12 border-b-2"
        :class="colors[category.color].head"
      >
        <button
          type="button"
          class="flex w-full items-center gap-4 px-16 py-12 type-tc-title-16"
          :aria-expanded="expanded.includes(category.key)"
          :aria-controls="`filter-${category.key}`"
          @click="toggleCategory(category.key)"
        >
          <span class="flex size-[20px] items-center justify-center" aria-hidden="true">
            <FontAwesomeIcon :icon="icons[category.key]" class="text-[16px]" />
          </span>
          {{ category.title }}
        </button>
        <div
          v-show="expanded.includes(category.key)"
          :id="`filter-${category.key}`"
          class="px-16 py-12"
          :class="colors[category.color].body"
        >
          <FilterOptions
            :category="category"
            :selected="filters[category.key]"
            @toggle="toggle(category, $event)"
          />
        </div>
      </section>
    </template>
  </div>
</template>
