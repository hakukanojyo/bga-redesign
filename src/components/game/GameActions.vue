<script setup>
import { ref } from 'vue'
import GameCtaButton from '@/components/game/GameCtaButton.vue'

defineProps({
  game: { type: Object, required: true },
})

const failed = ref(false)
</script>

<!--
  Figma：主視覺右邊（桌面 303:2127）、平板 Sticky Actions 的按鈕列（908:9812）。盒子是裝飾，alt 留空。
  - 寬：盒子在上、兩顆按鈕上下排（開始遊戲在上、比較高），GameView 把它疊在主視覺右邊
  - 窄：盒子和兩顆等寬按鈕排一列（學習遊戲在左、開始遊戲在右，PRD 7.4 第 2 條），和章節分頁列一起吸頂
-->
<template>
  <div
    class="flex items-center gap-32 @min-[1000px]:w-[256px] @min-[1000px]:flex-col @min-[1000px]:justify-end @min-[1000px]:py-32"
  >
    <div
      class="h-[194px] w-[208px] shrink-0 @max-[999px]:h-[93px] @max-[999px]:w-[99px]"
      aria-hidden="true"
    >
      <img
        v-if="game.images.box && !failed"
        :src="game.images.box"
        alt=""
        class="size-full object-contain"
        @error="failed = true"
      />
    </div>
    <!-- 寬：開始遊戲在上；窄：row-reverse 讓學習遊戲在左。Tab 順序都是開始遊戲先（主要動作） -->
    <div class="flex w-full flex-col gap-12 @max-[999px]:flex-1 @max-[999px]:flex-row-reverse">
      <GameCtaButton
        type="start"
        to="/coming-soon"
        class="h-[81px] @max-[999px]:h-[93px] @max-[999px]:flex-1"
      />
      <GameCtaButton
        type="learn"
        size="md"
        to="/coming-soon"
        class="@max-[999px]:h-[93px] @max-[999px]:flex-1 @max-[999px]:type-tc-heading-20"
      />
    </div>
  </div>
</template>
