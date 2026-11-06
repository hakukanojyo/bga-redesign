<script setup>
import { RouterLink } from 'vue-router'
import AppButton from '@/components/AppButton.vue'
import GameCard from '@/components/GameCard.vue'
import PageState from '@/components/PageState.vue'
import mascot from '@/assets/images/mascot-lost.svg'

defineProps({
  query: { type: String, required: true },
  // 也許你想找的是這些？3 款；還沒拿到時是空的，不顯示這一區
  suggestions: { type: Array, default: () => [] },
  // 標題層級：搜尋結果頁是 h1；放在別的頁面的區塊裡（尋找開放桌）照外層往下
  level: { type: Number, default: 1 },
})
defineEmits(['clear'])
</script>

<!--
  Figma：搜尋結果空狀態V2（303:2555，SRCH-06）。用整頁狀態的共用版型，下面加推薦。
  平板沿用同樣內容（PRD 7.2 例外）。尋找開放桌查無遊戲（TABLE-12）也用這個。許願（SRCH-07）本輪只放按鈕，連到佔位頁
-->
<template>
  <div class="flex flex-col items-center gap-48 pt-20">
    <PageState
      :image="mascot"
      :level="level"
      :title="`找不到「${query}」的相關結果`"
      description="檢查是否有錯字、嘗試輸入英文原名或減少關鍵字字數"
    >
      <div class="flex flex-col items-center gap-8">
        <AppButton variant="secondary" @click="$emit('clear')">清除搜尋條件</AppButton>
        <RouterLink to="/coming-soon" class="type-tc-caption-12 text-text-link hover:underline">
          向 BGA 許願引進此遊戲
        </RouterLink>
      </div>
    </PageState>

    <section v-if="suggestions.length" class="flex w-full flex-col gap-12">
      <component
        :is="`h${level + 1}`"
        class="p-8 text-center type-tc-heading-20 text-text-secondary"
      >
        也許你想找的是這些？
      </component>
      <ul class="grid grid-cols-3 gap-12 max-desktop:gap-16">
        <li v-for="game in suggestions" :key="game.slug">
          <GameCard :game="game" size="small" fluid />
        </li>
      </ul>
    </section>
  </div>
</template>
