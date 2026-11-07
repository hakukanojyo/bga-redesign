<script setup>
import { ref } from 'vue'

defineProps({
  game: { type: Object, required: true },
  // 寬高（px）：面板卡片 74、人到齊確認視窗 56
  size: { type: Number, default: 74 },
})

const failed = ref(false)
</script>

<!-- 遊戲盒子圖（面板卡片 74、確認視窗 56）。圖是裝飾，alt 留空；沒有圖或載入失敗留灰底，尺寸不變（產品規則 5.3） -->
<template>
  <div
    class="shrink-0 rounded-4"
    :style="{ width: `${size}px`, height: `${size}px` }"
    :class="(!game.images.box || failed) && 'bg-surface-placeholder'"
    aria-hidden="true"
  >
    <img
      v-if="game.images.box && !failed"
      :src="game.images.box"
      alt=""
      :width="size"
      :height="size"
      loading="lazy"
      class="size-full object-contain"
      @error="failed = true"
    />
  </div>
</template>
