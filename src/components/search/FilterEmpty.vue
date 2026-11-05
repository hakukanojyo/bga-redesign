<script setup>
import AppButton from '@/components/AppButton.vue'
import GameCard from '@/components/GameCard.vue'
import PageState from '@/components/PageState.vue'
import FilterTag from '@/components/search/FilterTag.vue'
import { filterCategories } from '@/api/data/options'
import { filterLabel } from '@/utils/filters'
import mascot from '@/assets/images/mascot-lost.svg'

defineProps({
  // 建議移除的條件 { key, values, count }；沒有可以移除的（只選了人數、時間）是 null
  remove: { type: Object, default: null },
  // 替代推薦 3 款；還沒拿到時是空的
  games: { type: Array, default: () => [] },
})
defineEmits(['apply', 'reset'])

const colorOf = (key) => filterCategories.find((category) => category.key === key).color
</script>

<!--
  Figma：篩選結果空狀態V2（303:2578，FILT-11）。用整頁狀態的共用版型，下面加替代推薦。
  只建議移除複雜度、類型、機制、主題（PRD 7.3 第 8 條）；沒有可以移除的條件時不顯示建議那行，下面改推為你推薦。
  平板沿用同樣內容（PRD 7.3 例外）
-->
<template>
  <div class="flex flex-col items-center gap-48 pt-20">
    <PageState :image="mascot" title="查無符合條件的遊戲">
      <template v-if="remove" #details>
        <p class="flex flex-wrap items-center justify-center gap-8 type-tc-body-16 text-text-body">
          移除
          <FilterTag :color="colorOf(remove.key)">{{
            filterLabel(remove.key, remove.values)
          }}</FilterTag>
          可顯示另外 {{ remove.count }} 款遊戲
        </p>
      </template>
      <div class="flex flex-col items-center gap-8">
        <AppButton v-if="remove" @click="$emit('apply')">採納並移除條件</AppButton>
        <AppButton variant="secondary" @click="$emit('reset')">重設所有條件</AppButton>
      </div>
    </PageState>

    <section v-if="games.length" class="flex w-full flex-col gap-12">
      <div class="flex flex-col items-center gap-8 p-8 text-center">
        <h2 class="type-tc-heading-20 text-text-secondary">
          {{ remove ? '近似條件替代推薦' : '為你推薦' }}
        </h2>
        <p v-if="remove" class="type-tc-body-16 text-text-secondary">
          移除「{{ filterLabel(remove.key, remove.values) }}」後的熱門遊戲
        </p>
      </div>
      <ul class="grid grid-cols-3 gap-12 max-desktop:gap-16">
        <li v-for="game in games" :key="game.slug">
          <GameCard :game="game" size="small" fluid />
        </li>
      </ul>
    </section>
  </div>
</template>
