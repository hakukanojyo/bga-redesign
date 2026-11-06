<script setup>
import { ref } from 'vue'

defineProps({
  game: { type: Object, required: true },
})

const failed = ref(false)
</script>

<!-- 面板卡片左邊的遊戲盒子圖（74×74）。圖是裝飾，alt 留空；沒有圖或載入失敗留灰底，尺寸不變（產品規則 5.3） -->
<template>
  <div
    class="size-[74px] shrink-0 rounded-4"
    :class="(!game.images.box || failed) && 'bg-surface-placeholder'"
    aria-hidden="true"
  >
    <img
      v-if="game.images.box && !failed"
      :src="game.images.box"
      alt=""
      width="74"
      height="74"
      loading="lazy"
      class="size-full object-contain"
      @error="failed = true"
    />
  </div>
</template>
