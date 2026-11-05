<script setup>
defineProps({
  // filterCategories 的一項
  category: { type: Object, required: true },
  // 這類目前選了哪些代號
  selected: { type: Array, required: true },
})
defineEmits(['toggle'])
</script>

<!--
  一類篩選的選項，桌面的收合列表和平板的選項面板共用（Figma Form/Radio 1153:19265、Form/Tag Chip 393:7231）。
  單選用原生 radio（方向鍵換選項、螢幕閱讀器念「選項 2/5」）；原生 radio 不能取消，所以用 click 自己判斷（PRD 7.3 第 1 條）。
  多選用按鈕加 aria-pressed。觸控尺寸用 tap-* token，平板自動變成 radio 列 44、標籤 36。
  data-option 讓換頁後可以把焦點接回剛剛按的選項
-->
<template>
  <ul v-if="category.multiple" class="flex flex-wrap gap-x-12 gap-y-8">
    <li v-for="(label, value) in category.labels" :key="value">
      <button
        type="button"
        :data-option="`${category.key}:${value}`"
        :aria-pressed="selected.includes(value)"
        class="min-h-(--tap-tag-min-height) rounded-4 border border-border-default bg-surface-default px-12 py-4 type-tc-body-13 text-text-body hover:bg-selection-bg aria-pressed:border-selection-accent aria-pressed:bg-selection-accent aria-pressed:text-text-inverse"
        @click="$emit('toggle', value)"
      >
        {{ label }}
      </button>
    </li>
  </ul>
  <fieldset v-else class="flex flex-col gap-(--tap-checkbox-gap)">
    <legend class="sr-only">{{ category.title }}</legend>
    <label
      v-for="(label, value) in category.labels"
      :key="value"
      class="group/radio flex min-h-(--tap-checkbox-min-height) cursor-pointer items-center gap-8 type-tc-body-13 text-text-body has-checked:text-selection-accent"
    >
      <input
        type="radio"
        :name="`filter-${category.key}`"
        :value="value"
        :checked="selected.includes(value)"
        :data-option="`${category.key}:${value}`"
        class="size-[18px] shrink-0 cursor-pointer appearance-none rounded-full border border-border-default bg-surface-default group-hover/radio:border-selection-accent group-hover/radio:bg-selection-bg checked:border-selection-accent checked:bg-surface-default checked:bg-[image:radial-gradient(var(--color-selection-accent)_4px,transparent_5px)]"
        @click="$emit('toggle', value)"
      />
      {{ label }}
    </label>
  </fieldset>
</template>
