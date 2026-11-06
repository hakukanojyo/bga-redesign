<script setup>
import { RouterLink } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
</script>

<!--
  Figma：Button/CTA type=尋找開放桌, size=sm（LAYOUT-02）。
  在尋找開放桌頁時維持 hover 的樣子，看得出現在在這頁（和導覽列連結用 hover 的底線表示目前頁一樣；2026-11-06）
-->
<template>
  <RouterLink
    to="/tables"
    class="inline-flex items-center gap-4 rounded-8 bg-(image:--gradient-cta-find) px-12 py-8 type-tc-title-16 text-text-inverse shadow-cta-sm inset-ring-2 inset-ring-border-subtle hover:bg-(image:--gradient-cta-find-hover) hover:text-text-brand-strong active:bg-(image:--gradient-cta-find-pressed) active:text-text-brand-strong aria-[current=page]:bg-(image:--gradient-cta-find-hover) aria-[current=page]:text-text-brand-strong"
  >
    <!-- 圖示跟著文字顏色：預設白色，hover／按下和文字一樣是 text/brand-strong -->
    <FontAwesomeIcon :icon="faPlus" class="text-[14px]" />
    尋找開放桌
  </RouterLink>
</template>
