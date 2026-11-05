<script>
import { ref } from 'vue'

// 展開哪幾類：放在元件外面，首頁點了條件換到搜尋結果頁（新的一個篩選欄）時還是一樣（預設只展開玩家數）
const expanded = ref(['players'])
// 從首頁點條件換頁後，把鍵盤焦點接回剛剛按的那個選項
let focusTarget = null
</script>

<script setup>
import { nextTick, onMounted, useTemplateRef } from 'vue'
import { useRoute } from 'vue-router'
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
import FilterTag from '@/components/search/FilterTag.vue'

const route = useRoute()
const { filters, setFilters, resetFilters } = useSearchQuery()

const icons = {
  players: faUserGroup,
  time: faClock,
  complexity: faBrain,
  mechanics: faClone,
  themes: faChessRook,
  types: faDiceFive,
}

// 每類的標題列、展開後的底色；Tailwind 要看得到完整的 class 名稱
const colors = {
  players: {
    head: 'border-filter-players-ink bg-filter-players-bg text-filter-players-ink hover:bg-filter-players-bg-hover',
    body: 'bg-filter-players-surface',
  },
  time: {
    head: 'border-filter-time-ink bg-filter-time-bg text-filter-time-ink hover:bg-filter-time-bg-hover',
    body: 'bg-filter-time-surface',
  },
  complexity: {
    head: 'border-filter-complexity-ink bg-filter-complexity-bg text-filter-complexity-ink hover:bg-filter-complexity-bg-hover',
    body: 'bg-filter-complexity-surface',
  },
  mechanics: {
    head: 'border-filter-mechanics-ink bg-filter-mechanics-bg text-filter-mechanics-ink hover:bg-filter-mechanics-bg-hover',
    body: 'bg-filter-mechanics-surface',
  },
  topic: {
    head: 'border-filter-topic-ink bg-filter-topic-bg text-filter-topic-ink hover:bg-filter-topic-bg-hover',
    body: 'bg-filter-topic-surface',
  },
  type: {
    head: 'border-filter-type-ink bg-filter-type-bg text-filter-type-ink hover:bg-filter-type-bg-hover',
    body: 'bg-filter-type-surface',
  },
}

function toggleCategory(key) {
  expanded.value = expanded.value.includes(key)
    ? expanded.value.filter((item) => item !== key)
    : [...expanded.value, key]
}

const isSelected = (key, value) => filters.value[key].includes(value)

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
  Figma：搜尋結果左欄「篩選條件 FILTERS」、Filter/Players～Topic（389:6719 等）、Form/Radio（1153:19265）、
  Form/Tag Chip（393:7231）、Filter/Active Tag（540:1062）。
  單選用原生 radio（方向鍵換選項、螢幕閱讀器念「選項 2/5」）；原生 radio 不能取消，所以用 click 自己判斷。
  多選用按鈕加 aria-pressed。標題列是按鈕，aria-expanded 告訴螢幕閱讀器展開了沒有；
  不用 h3：整個左欄排在頁面的 h1 前面，用標題會讓層級顛倒（和「快速搜尋」一樣）
-->
<template>
  <div ref="panel" class="flex flex-col gap-12">
    <div class="flex flex-col gap-8 border-t border-border-subtle pt-12">
      <div class="flex items-center justify-between gap-8">
        <p class="type-tc-title-16 text-text-primary">目前套用條件</p>
        <button
          v-if="hasFilters(filters)"
          type="button"
          class="flex items-center gap-4 type-tc-body-13 text-text-danger hover:underline"
          @click="resetFilters"
        >
          <FontAwesomeIcon :icon="faXmark" class="text-[12px]" aria-hidden="true" />
          重設所有條件
        </button>
      </div>
      <ul v-if="hasFilters(filters)" class="flex flex-wrap gap-8" aria-label="目前套用條件">
        <li v-for="{ category, value } in activeTags()" :key="`${category.key}:${value}`">
          <FilterTag :color="category.color" removable @remove="toggle(category, value)">
            {{ category.labels[value] }}
          </FilterTag>
        </li>
      </ul>
      <p v-else class="type-tc-body-13 text-text-secondary">目前無套用條件</p>
    </div>

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
        class="px-16 py-12 text-text-body"
        :class="colors[category.color].body"
      >
        <!-- 多選：標籤 -->
        <ul v-if="category.multiple" class="flex flex-wrap gap-x-12 gap-y-8">
          <li v-for="(label, value) in category.labels" :key="value">
            <button
              type="button"
              :data-option="`${category.key}:${value}`"
              :aria-pressed="isSelected(category.key, value)"
              class="min-h-(--tap-tag-min-height) rounded-4 border border-border-default bg-surface-default px-12 py-4 type-tc-body-13 text-text-body hover:bg-selection-bg aria-pressed:border-selection-accent aria-pressed:bg-selection-accent aria-pressed:text-text-inverse"
              @click="toggle(category, value)"
            >
              {{ label }}
            </button>
          </li>
        </ul>
        <!-- 單選：radio -->
        <fieldset v-else class="flex flex-col gap-(--tap-checkbox-gap)">
          <legend class="sr-only">{{ category.title }}</legend>
          <label
            v-for="(label, value) in category.labels"
            :key="value"
            class="group/radio flex min-h-(--tap-checkbox-min-height) cursor-pointer items-center gap-8 type-tc-body-13 has-checked:text-selection-accent"
          >
            <input
              type="radio"
              :name="`filter-${category.key}`"
              :value="value"
              :checked="isSelected(category.key, value)"
              :data-option="`${category.key}:${value}`"
              class="size-[18px] shrink-0 cursor-pointer appearance-none rounded-full border border-border-default bg-surface-default group-hover/radio:border-selection-accent group-hover/radio:bg-selection-bg checked:border-selection-accent checked:bg-surface-default checked:bg-[image:radial-gradient(var(--color-selection-accent)_4px,transparent_5px)]"
              @click="toggle(category, value)"
            />
            {{ label }}
          </label>
        </fieldset>
      </div>
    </section>
  </div>
</template>
