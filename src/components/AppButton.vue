<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  // Figma Button 的 type；目前只做用到的 primary、secondary，尺寸只有 md
  variant: { type: String, default: 'primary' },
  // 有 to 就是連結（RouterLink），沒有就是一般按鈕
  to: { type: [String, Object], default: null },
})

const variants = {
  primary:
    'border-border-brand bg-surface-brand text-text-inverse hover:border-border-brand-strong hover:bg-action-primary-hover active:border-action-primary-pressed active:bg-action-primary-pressed',
  secondary:
    'border-border-brand-subtle bg-surface-default text-selection-accent shadow-inner-button-secondary hover:border-selection-accent hover:bg-selection-bg hover:shadow-inner-button-secondary-hover active:border-selection-accent active:bg-selection-bg active:shadow-inner-button-secondary-press',
}

const tag = computed(() => (props.to ? RouterLink : 'button'))
</script>

<!--
  Figma：Button（573:655）size=md 的 primary、secondary。
  刻意和 Figma 不同：primary 按下時 Figma 拿掉外框（40 → 38 高），這裡外框改成和底色同色，尺寸不變；
  primary hover 的外框 Figma 綁 Primitive blue/900，這裡用 border/brand-strong。
  平板的觸控高度由 --tap-button-min-height 切換（桌面 28、平板 44）
-->
<template>
  <component
    :is="tag"
    :to="to"
    :type="to ? undefined : 'button'"
    class="inline-flex min-h-(--tap-button-min-height) items-center justify-center gap-8 rounded-8 border px-16 py-8 type-tc-label-14 whitespace-nowrap"
    :class="variants[variant]"
  >
    <slot />
  </component>
</template>
