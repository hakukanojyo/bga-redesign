<script setup>
import { ref, watch } from 'vue'
import AppButton from '@/components/AppButton.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  confirmLabel: { type: String, required: true },
  cancelLabel: { type: String, default: '返回' },
})

const emit = defineEmits(['confirm', 'cancel'])

const dialog = ref(null)

watch(
  () => props.open,
  (open) => {
    if (open && !dialog.value.open) dialog.value.showModal()
    if (!open && dialog.value.open) dialog.value.close()
  },
)

// 點到彈窗外（遮罩）時，事件的目標是 dialog 本身
function onClick(event) {
  if (event.target === dialog.value) emit('cancel')
}
</script>

<!--
  Figma：Modal/Confirm（1001:1850），400 寬，桌面和平板共用。只給影響大、復原不回來的動作（產品規則 4.2，目前只有退出這桌）。
  用原生 <dialog> 的 showModal()（docs/adr/0017）：桌面的側欄面板也是原生 dialog，彈窗要疊在它上面；
  鎖焦點、Esc 關閉、關掉後焦點回到原本的按鈕都是瀏覽器內建。
  紅色確認按鈕在左、「返回」在右（危險在左，產品規則 7.3）；打開時焦點在「返回」（autofocus），按 Enter 不會誤退。
  Esc 不往外傳：不然平板的 Sheet 也會收到 Esc，跟著關掉。
  開關只看 open：按 Esc 時擋掉瀏覽器自己關（cancel.prevent），改成通知外面把 open 設成 false，狀態才不會不同步
  （close 事件是非同步的，不能拿來同步狀態）
-->
<template>
  <dialog
    ref="dialog"
    :aria-label="title"
    class="m-auto w-[400px] max-w-[calc(100vw-32px)] rounded-16 bg-surface-default p-24 shadow-card backdrop:bg-overlay-backdrop backdrop:backdrop-blur-[4px]"
    @click="onClick"
    @cancel.prevent="emit('cancel')"
    @keydown.esc.stop
  >
    <div class="flex flex-col gap-24">
      <div class="flex flex-col gap-8">
        <h2 class="type-tc-heading-20 text-text-primary">{{ title }}</h2>
        <p v-if="description" class="type-tc-body-16 text-text-body">{{ description }}</p>
      </div>
      <!-- 兩顆一樣寬（Figma 各 Fill）；用格線，外框粗細不同也不會差 2px -->
      <div class="grid grid-cols-2 gap-12">
        <AppButton variant="danger" size="lg" @click="emit('confirm')">
          {{ confirmLabel }}
        </AppButton>
        <AppButton variant="secondary" size="lg" autofocus @click="emit('cancel')">
          {{ cancelLabel }}
        </AppButton>
      </div>
    </div>
  </dialog>
</template>
