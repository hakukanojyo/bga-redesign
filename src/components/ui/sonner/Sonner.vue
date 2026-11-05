<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCircleCheck, faCircleExclamation } from '@fortawesome/free-solid-svg-icons'
import { cn } from 'cn'
import { Toaster as Sonner } from 'vue-sonner'
import 'vue-sonner/style.css'

const props = defineProps({
  id: { type: String, required: false },
  invert: { type: Boolean, required: false },
  theme: { type: String, required: false },
  position: { type: String, required: false, default: 'bottom-center' },
  closeButtonPosition: { type: String, required: false },
  hotkey: { type: Array, required: false },
  richColors: { type: Boolean, required: false },
  expand: { type: Boolean, required: false },
  duration: { type: Number, required: false },
  gap: { type: Number, required: false },
  visibleToasts: { type: Number, required: false },
  closeButton: { type: Boolean, required: false },
  toastOptions: { type: Object, required: false },
  class: { type: String, required: false },
  style: { type: Object, required: false },
  offset: { type: [Object, String, Number], required: false },
  mobileOffset: { type: [Object, String, Number], required: false },
  dir: { type: String, required: false },
  swipeDirections: { type: Array, required: false },
  icons: { type: Object, required: false },
  containerAriaLabel: { type: String, required: false },
})

// Figma：Toast（1010:1871）。unstyled 拿掉 Sonner 的外觀，只留位置、疊放、動畫；data-type 是 Sonner 加的
// Sonner 的提示固定 356 寬、靠左；設計稿是依文字長度、置中，所以 w-fit 加 inset-x-0 mx-auto
// 平板面板（Reka）開著時 body 不能點，pointer-events-auto 讓「復原」還按得到
const designOptions = {
  unstyled: true,
  classes: {
    toast: cn(
      'pointer-events-auto inset-x-0 mx-auto flex w-fit items-center gap-8 rounded-8 px-16 py-12 shadow-card',
      'bg-surface-toast text-text-primary',
      'data-[type=success]:bg-status-success-bg data-[type=success]:text-status-success',
      'data-[type=error]:bg-status-error-bg data-[type=error]:text-status-error',
    ),
    title: 'type-tc-body-16 whitespace-nowrap',
    icon: 'flex text-[20px]',
    // neutral 的「復原」離訊息 16、用 text/link-on-light（淺藍底上對比才夠）；success 的「查看」照 gap 8、text/link
    actionButton: cn(
      'ml-8 shrink-0 cursor-pointer type-tc-label-14 text-text-link-on-light hover:underline',
      'in-data-[type=success]:ml-0 in-data-[type=success]:text-text-link',
    ),
  },
}
</script>

<template>
  <Sonner
    :class="cn('toaster group', props.class)"
    v-bind="props"
    :toast-options="{ ...designOptions, ...props.toastOptions }"
  >
    <template #success-icon>
      <FontAwesomeIcon :icon="faCircleCheck" />
    </template>
    <template #error-icon>
      <FontAwesomeIcon :icon="faCircleExclamation" />
    </template>
  </Sonner>
</template>
