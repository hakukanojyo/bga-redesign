<script setup>
import { reactiveOmit } from '@vueuse/core'
import { cn } from 'cn'
import { DialogContent, DialogPortal, useForwardPropsEmits } from 'reka-ui'
import SheetOverlay from './SheetOverlay.vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  class: {
    type: [Boolean, null, String, Object, Array],
    required: false,
    skipCheck: true,
  },
  side: { type: String, required: false, default: 'right' },
  // 遮罩的 class：平板的遮罩要停在底部導覽列上方
  overlayClass: { type: null, required: false },
  forceMount: { type: Boolean, required: false },
  disableOutsidePointerEvents: { type: Boolean, required: false },
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
})
const emits = defineEmits([
  'escapeKeyDown',
  'pointerDownOutside',
  'focusOutside',
  'interactOutside',
  'openAutoFocus',
  'closeAutoFocus',
])

const delegatedProps = reactiveOmit(props, 'class', 'side', 'overlayClass')

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<!--
  改自 shadcn-vue：樣式換成設計稿的 token（玻璃底色、圓角），拿掉內建的關閉按鈕（設計稿沒有，用 Esc、點遮罩關閉）和用不到的 top、left。
  動畫用 tw-animate-css；時間和曲線和桌面的側欄面板一樣，減少動態效果時直接出現。
-->
<template>
  <DialogPortal>
    <SheetOverlay :class="overlayClass" />
    <DialogContent
      data-slot="sheet-content"
      :class="
        cn(
          'fixed z-40 flex flex-col bg-surface-glass-panel backdrop-blur-[15px] duration-300 ease-[cubic-bezier(0.2,0,0,1)] data-[state=open]:animate-in data-[state=closed]:animate-out motion-reduce:animate-none',
          side === 'right' &&
            'inset-y-0 right-0 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
          side === 'bottom' &&
            'inset-x-0 bottom-0 rounded-t-16 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
          props.class,
        )
      "
      v-bind="{ ...$attrs, ...forwarded }"
    >
      <slot />
    </DialogContent>
  </DialogPortal>
</template>
