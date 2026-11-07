<script setup>
import { useId } from 'vue'

defineProps({
  // 這一組的名稱，例如「遊戲模式」
  legend: { type: String, required: true },
  // { value, label }[]；value 是空字串代表「全部」
  options: { type: Array, required: true },
  // 名稱只給螢幕閱讀器（我的牌桌的分頁：面板標題已經說了是什麼）
  hideLegend: { type: Boolean, default: false },
})

const model = defineModel({ type: String, default: '' })
const name = useId()
</script>

<!--
  Figma：Form/Segment（574:2672），一組只能選一個。用原生的 radio：方向鍵切換、Tab 進出整組、螢幕閱讀器讀「1／3」都是瀏覽器內建的。
  顏色改綁 Semantic（2026-11-06）：外框 border/brand-subtle、選中 surface/brand（Figma 原本是 blue/400）；
  未選中 white 35% 底、hover white 90%（surface/glass-light、surface/glass）。
  外框給多寬就撐多寬，選項平分（尋找開放桌的篩選卡片撐滿整排）
  分隔線（2026-11-07）：沒選的選項之間一條細線，上下留 8 不頂到邊；緊貼選中那格的線藏起來，選中的色塊已經分開了（同 iOS）
-->
<template>
  <fieldset class="flex min-w-0 items-center gap-4">
    <legend v-if="hideLegend" class="sr-only">{{ legend }}</legend>
    <legend v-else class="float-left shrink-0 type-tc-heading-20 text-text-primary">
      {{ legend }}：
    </legend>
    <div
      class="flex flex-1 overflow-hidden rounded-4 border border-border-brand-subtle [&>label:has(:checked)+label]:before:hidden"
    >
      <label
        v-for="option in options"
        :key="option.value"
        class="relative flex min-h-[36px] flex-1 cursor-pointer items-center justify-center whitespace-nowrap bg-surface-glass-light px-16 py-4 type-tc-body-16 text-text-secondary not-first:before:absolute not-first:before:inset-y-8 not-first:before:left-0 not-first:before:w-px not-first:before:bg-border-brand-subtle max-desktop:min-h-(--tap-button-min-height) hover:bg-surface-glass has-checked:bg-surface-brand has-checked:text-text-inverse has-checked:before:hidden has-focus-visible:outline-2 has-focus-visible:-outline-offset-2 has-focus-visible:outline-action-primary"
      >
        <input v-model="model" type="radio" :name="name" :value="option.value" class="sr-only" />
        {{ option.label }}
      </label>
    </div>
  </fieldset>
</template>
