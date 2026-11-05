<script setup>
import HomeHero from '@/components/home/HomeHero.vue'
import HomeLeaderboard from '@/components/home/HomeLeaderboard.vue'
import HomePromo from '@/components/home/HomePromo.vue'
</script>

<!--
  Figma：首頁（625:3944，平板 857:4834）。桌面左邊 382 是快速搜尋和篩選欄（#25，之後做，先留位置），右邊是內容（854 寬＋左右 20）；
  平板沒有左欄，內容左右 24。7 個遊戲分區在 #24 的下一個 PR 加，中段橫幅之後會移到「輕鬆小品」和「經典遊戲」之間
-->
<template>
  <div class="flex">
    <div class="w-[382px] shrink-0 max-desktop:hidden" />
    <div class="flex flex-1 flex-col gap-24 px-20 pt-20 pb-40 max-desktop:px-24">
      <h1 class="sr-only">Board Game Arena 首頁</h1>
      <div class="flex gap-12 max-desktop:gap-24">
        <HomeHero />
        <HomeLeaderboard />
      </div>
      <HomePromo />
    </div>
  </div>
</template>
