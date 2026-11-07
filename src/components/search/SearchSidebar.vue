<script setup>
import { useMediaQuery } from '@vueuse/core'
import FilterPanel from '@/components/search/FilterPanel.vue'
import SearchInput from '@/components/search/SearchInput.vue'

// 和 max-desktop: 同一個斷點；桌面和平板的卡片數量、標題文字不同，用 v-if 換
const isTablet = useMediaQuery('(width < 1280px)')

// 底用 surface/glass-panel（白 56%，和其他放控制項的面板一樣；2026-11-06 從 surface/header 73% 改過來）
const card = 'rounded-8 bg-surface-glass-panel p-12 shadow-glass-nav backdrop-blur-[4px]'
</script>

<!--
  首頁和搜尋結果頁共用的快速搜尋和篩選（Figma 搜尋結果 584:10392、平板 908:8054、首頁｜Tablet｜篩選展開 903:8027）。
  桌面是左欄（382 寬：左 80、右 20）：快速搜尋、「OR」、篩選條件兩張卡片（搜尋和篩選擇一，PRD 7.3 第 9 條）。
  平板是內容上方的一張卡片：「快速搜尋：」「篩選條件：」左邊標題 95 寬對齊，右邊是搜尋框和分類（FILT-10）。
  標題用 p 不用 h2：它排在頁面的 h1 前面，用標題會讓標題層級顛倒；搜尋框本身有 role="search" 可以跳到。
  桌面整塊吸頂（產品規則 6.3）：往下捲時停在 Header 下方 20，捲到底時和右邊最後一排卡片一樣離頁尾 40。
  可以同時展開好幾類，展開多了會比畫面高，所以最多到畫面底部上方 20、超過就在左欄裡捲（規則 6.3 的例外）。
  overflow 會切掉卡片陰影，外面多留 8 的內距再用 -8 抵掉，位置不變。
  平板不吸頂：卡片展開面板後約 400 高，加上 Header 和底部導覽列會佔掉半個畫面
-->
<template>
  <aside
    aria-label="搜尋遊戲"
    class="w-[382px] shrink-0 pt-20 pr-20 pb-40 pl-80 max-desktop:w-auto max-desktop:px-24 max-desktop:pb-4"
  >
    <div
      class="flex flex-col"
      :class="
        isTablet
          ? [card, 'gap-12']
          : 'sticky top-[calc(var(--header-height)+12px)] -m-8 max-h-[calc(100dvh-var(--header-height)-24px)] overflow-y-auto p-8 [scrollbar-width:thin]'
      "
    >
      <div :class="isTablet ? 'flex items-center gap-12' : [card, 'flex flex-col gap-12']">
        <p v-if="isTablet" class="w-[95px] shrink-0 type-tc-title-16 text-text-primary">
          快速搜尋：
        </p>
        <p v-else class="type-tc-heading-20 text-text-primary">快速搜尋 SEARCH GAME</p>
        <SearchInput class="min-w-0 flex-1" />
      </div>
      <p
        v-if="!isTablet"
        class="py-12 text-center type-tc-body-13 text-text-secondary"
        aria-hidden="true"
      >
        OR
      </p>
      <div :class="isTablet ? '' : [card, 'flex flex-col gap-12']">
        <p v-if="!isTablet" class="type-tc-heading-20 text-text-primary">篩選條件 FILTERS</p>
        <FilterPanel />
      </div>
    </div>
  </aside>
</template>
