<script setup>
import SearchInput from '@/components/search/SearchInput.vue'
</script>

<!--
  首頁和搜尋結果頁共用的快速搜尋（Figma 搜尋結果 584:10392、平板 908:8054）。
  桌面是左欄（382 寬：左 80、右 20），平板改成內容上方的一張卡片、標題和搜尋框排成一列。
  同一份 DOM 用 CSS 換版面，搜尋框只有一個，不會兩個一起收網址的變化。篩選（PR ②、③）之後放進來。
  標題用 p 不用 h2：它排在頁面的 h1 前面，用標題會讓標題層級顛倒；搜尋框本身有 role="search" 可以跳到
-->
<template>
  <aside
    aria-label="搜尋遊戲"
    class="w-[382px] shrink-0 pt-20 pr-20 pl-80 max-desktop:w-auto max-desktop:px-24 max-desktop:pb-4"
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
  </aside>
</template>
