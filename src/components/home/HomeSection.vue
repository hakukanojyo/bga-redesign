<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import GameCard from '@/components/GameCard.vue'
import GameCarousel from '@/components/GameCarousel.vue'

defineProps({
  title: { type: String, required: true },
  icon: { type: Object, required: true },
  games: { type: Array, required: true },
  // large：大卡（Card/Game Cover）；small：小卡（Card/Game Result）
  size: { type: String, default: 'large' },
})
</script>

<!-- Figma：首頁的一個分區＝Layout/Section Title（540:1104）＋一排卡片（HOME-03～06） -->
<template>
  <section class="flex flex-col gap-8">
    <h2 class="flex items-center gap-4 p-8 type-tc-heading-24 text-text-primary">
      <span class="flex size-[32px] items-center justify-center" aria-hidden="true">
        <FontAwesomeIcon :icon="icon" class="text-[24px]" />
      </span>
      {{ title }}
    </h2>
    <GameCarousel :label="title">
      <li v-for="game in games" :key="game.slug" class="snap-start">
        <GameCard :game="game" :size="size" />
      </li>
    </GameCarousel>
  </section>
</template>
