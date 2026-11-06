<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faScrewdriverWrench } from '@fortawesome/free-solid-svg-icons'
import FavoritesPanel from '@/components/favorites/FavoritesPanel.vue'

defineProps({
  panel: { type: String, default: null },
  // 卡片用觸控版（平板 Bottom Sheet，或不能懸停的裝置）
  touch: { type: Boolean, default: false },
})
</script>

<!-- 桌面側欄和平板 Bottom Sheet 共用的面板內容：依面板選內容，還沒做的面板放佔位文字 -->
<template>
  <FavoritesPanel v-if="panel === 'favorites'" :touch="touch" />
  <div v-else class="flex flex-1 flex-col items-center justify-center gap-8 text-text-secondary">
    <FontAwesomeIcon :icon="faScrewdriverWrench" class="text-[32px]" />
    <p class="type-tc-body-13">這張桌子還在佈置中</p>
  </div>
</template>
