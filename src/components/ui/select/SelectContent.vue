<script setup>
import { reactiveOmit } from '@vueuse/core'
import { cn } from 'cn'
import { SelectContent, SelectPortal, SelectViewport, useForwardPropsEmits } from 'reka-ui'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  forceMount: { type: Boolean, required: false },
  position: { type: String, required: false, default: 'popper' },
  bodyLock: { type: Boolean, required: false },
  side: { type: null, required: false },
  sideOffset: { type: Number, required: false, default: 4 },
  align: { type: null, required: false },
  avoidCollisions: { type: Boolean, required: false },
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
  class: {
    type: [Boolean, null, String, Object, Array],
    required: false,
    skipCheck: true,
  },
})
const emits = defineEmits(['closeAutoFocus', 'escapeKeyDown', 'pointerDownOutside'])

const delegatedProps = reactiveOmit(props, 'class')
const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<!-- Figma：Form/Sort Menu（1167:3456）：在選單正下方，和選單同寬；點選項或點外面就收起 -->
<template>
  <SelectPortal>
    <SelectContent
      data-slot="select-content"
      v-bind="{ ...$attrs, ...forwarded }"
      :class="
        cn(
          'z-50 w-(--reka-select-trigger-width) overflow-hidden rounded-4 bg-surface-default p-4 shadow-card',
          props.class,
        )
      "
    >
      <SelectViewport>
        <slot />
      </SelectViewport>
    </SelectContent>
  </SelectPortal>
</template>
