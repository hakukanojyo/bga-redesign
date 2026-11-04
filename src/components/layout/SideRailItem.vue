<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const props = defineProps({
  item: { type: Object, required: true },
  // 這個項目的面板開著
  active: { type: Boolean, default: false },
})

defineEmits(['toggle'])
</script>

<!-- Figma：Side Rail/Item（560:2132）。桌面 hover 顯示光暈＋提示框，平板圖示下方直接顯示名稱 -->
<template>
  <!-- 選中後圖示變成 rail 色，hover 的光暈改成白色 -->
  <button
    type="button"
    aria-haspopup="dialog"
    :aria-expanded="active"
    :data-active="active || undefined"
    :style="{ '--rail-color': `var(${props.item.color})` }"
    class="group/item relative inline-flex flex-col items-center gap-2 text-icon-inverse data-active:text-(--rail-color) data-active:[--rail-glow:var(--color-icon-inverse)]"
    @click="$emit('toggle', item.panel)"
  >
    <span
      class="flex size-[34px] items-center justify-center group-hover/item:glow-rail group-focus-visible/item:glow-rail max-desktop:group-hover/item:filter-none"
    >
      <FontAwesomeIcon v-if="item.icon" :icon="item.icon" class="text-[24px]" />
      <!-- 自製圖示用遮罩上色，顏色才會跟著文字色 -->
      <span
        v-else
        class="size-[26px] bg-current mask-contain mask-center mask-no-repeat"
        :style="{ maskImage: `url(&quot;${item.image}&quot;)` }"
      />
    </span>
    <!-- 桌面是提示框，平板是圖示下的名稱；同一段文字也是按鈕的名稱 -->
    <span
      class="pointer-events-none absolute top-1/2 right-[64px] -translate-y-1/2 bg-(--rail-color) px-12 py-4 whitespace-nowrap type-tc-body-13 text-text-inverse opacity-0 group-hover/item:opacity-100 group-focus-visible/item:opacity-100 max-desktop:static max-desktop:translate-y-0 max-desktop:bg-transparent max-desktop:p-0 max-desktop:type-tc-caption-11 max-desktop:text-text-body max-desktop:opacity-100"
    >
      {{ item.label }}
    </span>
  </button>
</template>
