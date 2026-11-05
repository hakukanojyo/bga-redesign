<script setup>
import { RouterLink } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faBook, faGamepad } from '@fortawesome/free-solid-svg-icons'

defineProps({
  // start：開始遊戲（藍）；learn：學習遊戲（紫）
  type: { type: String, required: true },
  // lg：桌面的開始遊戲、平板的兩顆；md：桌面的學習遊戲
  size: { type: String, default: 'lg' },
  to: { type: [String, Object], required: true },
})

const labels = { start: '開始遊戲', learn: '學習遊戲' }
const icons = { start: faGamepad, learn: faBook }
</script>

<!--
  Figma：Button/CTA type=開始遊戲、學習遊戲（409:7599）。立體按鈕：四段漸層、3px 淺灰內框、底下黑色陰影。
  hover、按下各深一階（tokens.css 的 cta-shade-*，和立即遊玩一樣）。本輪兩顆都連到佔位頁（GAME-03、04）
-->
<template>
  <RouterLink
    :to="to"
    class="inline-flex items-center justify-center gap-4 rounded-12 text-text-inverse inset-ring-3 inset-ring-border-subtle cta-gradient hover:cta-shade-hover active:cta-shade-pressed"
    :class="[
      type === 'learn' ? 'cta-learn' : 'cta-start',
      size === 'lg'
        ? 'px-20 py-16 type-tc-heading-20 shadow-cta-lg-strong'
        : 'px-16 py-12 type-tc-title-18 shadow-cta-md-strong',
    ]"
  >
    <FontAwesomeIcon
      :icon="icons[type]"
      :class="size === 'lg' ? 'text-[20px]' : 'text-[18px]'"
      aria-hidden="true"
    />
    {{ labels[type] }}
  </RouterLink>
</template>
