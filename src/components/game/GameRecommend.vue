<script setup>
import { watch } from 'vue'
import { getSimilarGames } from '@/api/games'
import { useRequest } from '@/composables/useRequest'
import BlockError from '@/components/BlockError.vue'
import GameCard from '@/components/GameCard.vue'
import GameCarousel from '@/components/GameCarousel.vue'
import SkeletonBlock from '@/components/SkeletonBlock.vue'

const props = defineProps({
  slug: { type: String, required: true },
})

// 推薦自己拿資料：失敗只影響這一區（產品規則 5.3）；換一款遊戲時重拿
const { data: games, status, retry } = useRequest(() => getSimilarGames(props.slug))
watch(() => props.slug, retry)
</script>

<!-- Figma：推薦（303:2355）：小卡 Card/Game Result 一排輪播，5 款（PRD 7.4 第 4 條） -->
<template>
  <div v-if="status === 'loading'" class="flex gap-12 overflow-hidden pb-12">
    <SkeletonBlock v-for="n in 3" :key="n" class="h-[190px] w-[300px] shrink-0 rounded-8" />
  </div>
  <BlockError v-else-if="status === 'error'" @retry="retry" />
  <GameCarousel v-else label="推薦遊戲">
    <li v-for="game in games" :key="game.slug" class="snap-start">
      <GameCard :game="game" size="small" />
    </li>
  </GameCarousel>
</template>
