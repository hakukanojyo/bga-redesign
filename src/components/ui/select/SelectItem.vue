<script setup>
import { reactiveOmit } from '@vueuse/core'
import { cn } from 'cn'
import { SelectItem, SelectItemText, useForwardProps } from 'reka-ui'

const props = defineProps({
  value: { type: null, required: true },
  disabled: { type: Boolean, required: false },
  textValue: { type: String, required: false },
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
  class: {
    type: [Boolean, null, String, Object, Array],
    required: false,
    skipCheck: true,
  },
})

const delegatedProps = reactiveOmit(props, 'class')
const forwardedProps = useForwardProps(delegatedProps)
</script>

<!--
  Figma：Form/Sort Option（583:10357）。目前的選項是品牌淺藍底、深藍字（state=selected）；
  滑鼠或方向鍵移到的選項（data-highlighted）用 selection/bg，和按鈕的 hover 一樣
-->
<template>
  <SelectItem
    data-slot="select-item"
    v-bind="forwardedProps"
    :class="
      cn(
        'flex min-h-(--tap-button-min-height) cursor-pointer items-center px-8 py-4 type-tc-body-16 text-text-secondary outline-none select-none data-highlighted:bg-selection-bg data-[state=checked]:bg-surface-brand-subtle data-[state=checked]:text-text-brand-strong',
        props.class,
      )
    "
  >
    <SelectItemText>
      <slot />
    </SelectItemText>
  </SelectItem>
</template>
