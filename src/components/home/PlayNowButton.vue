<script setup>
import { RouterLink } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faGamepad } from '@fortawesome/free-solid-svg-icons'

defineProps({
  to: { type: [String, Object], required: true },
  // 主視覺圖片的主色（games/colors.json），已調到白字對比 ≥ 4.5:1
  color: { type: String, required: true },
})
</script>

<!--
  Figma：Button/CTA type=立即遊玩, size=md。顏色跟著主視覺換（docs/adr/0014）：
  --cta-accent 是內容的顏色，不是設計 token；漸層和 hover、按下的深淺由 tokens.css 的 cta-accent 從主色算出來
-->
<template>
  <RouterLink
    :to="to"
    :style="{ '--cta-accent': color }"
    class="inline-flex items-center gap-4 rounded-12 px-16 py-12 type-tc-title-18 text-text-inverse shadow-cta-md-strong inset-ring-3 inset-ring-border-subtle cta-accent hover:cta-accent-hover active:cta-accent-pressed"
  >
    <FontAwesomeIcon :icon="faGamepad" class="text-[20px]" />
    立即遊玩
  </RouterLink>
</template>
