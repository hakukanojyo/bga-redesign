<script setup>
import { reactiveOmit } from '@vueuse/core'
import { cn } from 'cn'
import { SelectIcon, SelectTrigger, useForwardProps } from 'reka-ui'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'

const props = defineProps({
  disabled: { type: Boolean, required: false },
  reference: { type: null, required: false },
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

<!-- Figma：Form/Sort Select（574:2713）。展開時箭頭朝上 -->
<template>
  <SelectTrigger
    data-slot="select-trigger"
    v-bind="forwardedProps"
    :class="
      cn(
        'group/trigger flex min-h-(--tap-button-min-height) items-center justify-between gap-8 rounded-4 bg-surface-glass px-8 py-4 type-tc-body-16 whitespace-nowrap text-text-body hover:bg-surface-input',
        props.class,
      )
    "
  >
    <slot />
    <SelectIcon as-child>
      <FontAwesomeIcon
        :icon="faChevronDown"
        class="text-[12px] group-data-[state=open]/trigger:rotate-180"
        aria-hidden="true"
      />
    </SelectIcon>
  </SelectTrigger>
</template>
