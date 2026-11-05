<script setup>
import FilterPanel from '@/components/search/FilterPanel.vue'
import SearchInput from '@/components/search/SearchInput.vue'
</script>

<!--
  首頁和搜尋結果頁共用的快速搜尋和篩選（Figma 搜尋結果 584:10392、平板 908:8054）。
  桌面是左欄（382 寬：左 80、右 20）：快速搜尋、「OR」、篩選條件兩張卡片（搜尋和篩選擇一，PRD 7.3 第 9 條）。
  平板改成內容上方的一張卡片、標題和搜尋框排成一列；平板的篩選卡片是 PR ③，先只在桌面顯示。
  同一份 DOM 用 CSS 換版面，搜尋框只有一個，不會兩個一起收網址的變化。
  標題用 p 不用 h2：它排在頁面的 h1 前面，用標題會讓標題層級顛倒；搜尋框本身有 role="search" 可以跳到。
  桌面整塊吸頂（產品規則 6.3）：往下捲時停在 Header 下方 20，捲到底時和右邊最後一排卡片一樣離頁尾 40。
  可以同時展開好幾類，展開多了會比畫面高，所以最多到畫面底部上方 20、超過就在左欄裡捲（規則 6.3 的例外）。
  overflow 會切掉卡片陰影，外面多留 8 的內距再用 -8 抵掉，位置不變
-->
<template>
  <aside
    aria-label="搜尋遊戲"
    class="w-[382px] shrink-0 pt-20 pr-20 pb-40 pl-80 max-desktop:w-auto max-desktop:px-24 max-desktop:pb-4"
  >
    <div
      class="sticky top-[calc(var(--header-height)+12px)] -m-8 max-h-[calc(100dvh-var(--header-height)-24px)] overflow-y-auto p-8 [scrollbar-width:thin] max-desktop:static max-desktop:m-0 max-desktop:max-h-none max-desktop:overflow-visible max-desktop:p-0"
    >
      <div
        class="flex flex-col gap-12 rounded-8 bg-surface-header p-12 shadow-glass-nav backdrop-blur-[4px] max-desktop:flex-row max-desktop:items-center"
      >
        <p
          class="type-tc-heading-20 text-text-primary max-desktop:shrink-0 max-desktop:type-tc-title-16"
        >
          快速搜尋<span class="max-desktop:hidden"> SEARCH GAME</span
          ><span class="desktop:hidden" aria-hidden="true">：</span>
        </p>
        <SearchInput class="max-desktop:flex-1" />
      </div>
      <div class="max-desktop:hidden">
        <p class="py-12 text-center type-tc-body-13 text-text-secondary" aria-hidden="true">OR</p>
        <div
          class="flex flex-col gap-12 rounded-8 bg-surface-header p-12 shadow-glass-nav backdrop-blur-[4px]"
        >
          <p class="type-tc-heading-20 text-text-primary">篩選條件 FILTERS</p>
          <FilterPanel />
        </div>
      </div>
    </div>
  </aside>
</template>
