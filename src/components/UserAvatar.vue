<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  user: { type: Object, required: true },
  // 寬高（px）：開放桌的桌主 40、排行榜 36、我的牌桌卡片 20
  size: { type: Number, default: 40 },
})
</script>

<!--
  玩家頭像（Figma User/Avatar）。黃色外框是尊榮會員（VIP）的標記，一般玩家沒有（2026-11-06）；
  一般玩家用透明外框，頭像大小和 VIP 一樣，排在一起才對齊。
  點頭像到玩家個人頁（本輪佔位頁）；滑鼠移上或 Tab 到時有黃色外光暈（Figma state=hover、glow/avatar-hover）。
  放在整張可點的卡片裡也能點：relative z-10 疊在卡片的 stretched link 上面。
  圖本身是裝飾，連結的名稱由 sr-only 文字表達
-->
<template>
  <RouterLink
    to="/coming-soon"
    class="group/avatar relative z-10 inline-flex shrink-0 rounded-full"
  >
    <img
      :src="user.avatar"
      alt=""
      :width="size"
      :height="size"
      :style="{ width: `${size}px`, height: `${size}px` }"
      class="rounded-full border-2 bg-surface-placeholder object-cover transition-shadow duration-200 group-hover/avatar:shadow-glow-avatar-hover group-focus-visible/avatar:shadow-glow-avatar-hover motion-reduce:transition-none"
      :class="user.isPremium ? 'border-border-accent' : 'border-transparent'"
    />
    <span class="sr-only">{{ user.name }} 的個人頁</span>
  </RouterLink>
</template>
