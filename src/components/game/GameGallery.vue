<script setup>
import { gameName } from '@/api/games'
import GameCarousel from '@/components/GameCarousel.vue'

defineProps({
  game: { type: Object, required: true },
})
</script>

<!--
  Figma：遊戲圖片（303:2335）、Card/Game Image（798:5765）。
  沒有圖時整個章節和章節導覽的項目都不顯示（PRD 7.4 第 4 條），由 GameView 判斷；這裡只管有圖的時候。
  圖片尺寸固定，載入前、載入失敗都留灰底（產品規則 5.3）
-->
<template>
  <GameCarousel label="遊戲圖片">
    <li v-for="(src, index) in game.gallery" :key="src" class="snap-start">
      <img
        :src="src"
        :alt="`${gameName(game)}遊戲畫面 ${index + 1}`"
        width="351"
        height="212"
        loading="lazy"
        class="h-[212px] w-[351px] rounded-8 bg-surface-placeholder object-cover"
      />
    </li>
  </GameCarousel>
</template>
