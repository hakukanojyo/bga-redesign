<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCrown } from '@fortawesome/free-solid-svg-icons'

defineProps({
  // tab：上圓角、下平，貼在卡片資訊面板上；pill：四角圓角，單獨放在文字旁邊（Figma Badge/VIP 1342:3234）
  shape: { type: String, default: 'tab' },
})
</script>

<!-- 尊榮遊戲標籤（GAME-14）。皇冠是裝飾，螢幕閱讀器讀「尊榮遊戲」 -->
<template>
  <span
    class="flex h-[22px] w-[60px] shrink-0 items-center justify-center bg-badge-vip text-text-primary shadow-bevel-button-gold"
    :class="shape === 'pill' ? 'rounded-16' : 'rounded-t-16 pt-2'"
  >
    <FontAwesomeIcon :icon="faCrown" class="text-[14px]" aria-hidden="true" />
    <span class="sr-only">尊榮遊戲</span>
  </span>
</template>
