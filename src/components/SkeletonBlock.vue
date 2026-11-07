<!--
  載入中的骨架（Figma Skeleton/Card 1124:2689、產品規則 5.1、FB-08）：品牌玻璃色，一道白色亮帶由左往右掃過，約 1.4 秒一次。
  只動 transform；開啟「減少動態效果」時亮帶不顯示。尺寸、圓角由使用的地方決定，要和真的內容一樣大，版面才不會跳
-->
<template>
  <div class="skeleton relative overflow-hidden bg-surface-glass-faint" aria-hidden="true" />
</template>

<style scoped>
.skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: var(--gradient-skeleton-shine);
  transform: translateX(-100%);
  animation: shine 1.4s ease-in-out infinite;
}

@keyframes shine {
  to {
    transform: translateX(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton::after {
    display: none;
  }
}
</style>
