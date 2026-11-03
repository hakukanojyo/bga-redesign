<script setup>
import DeviceBanner from '@/components/DeviceBanner.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
</script>

<!-- 整頁版型：右側欄、底部導覽列、頁尾在 #14 之後的 PR 加 -->
<template>
  <DeviceBanner />
  <AppHeader />
  <main>
    <slot />
  </main>
</template>
