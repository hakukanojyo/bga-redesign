<script setup>
import { nextTick, useTemplateRef, watch } from 'vue'

const props = defineProps({
  // { id, label }[]：連到頁面上 id 一樣的章節
  items: { type: Array, required: true },
  // 目前看到的章節（scroll spy）
  active: { type: String, default: null },
})

const emit = defineEmits(['select'])
const list = useTemplateRef('list')

// 平板分頁列放不下全部，可以左右滑；目前的章節換了，把它捲進看得到的地方（只捲分頁列，不動頁面）
watch(
  () => props.active,
  async (id) => {
    await nextTick()
    const el = list.value
    const link = el?.querySelector(`[href="#${id}"]`)
    if (!el || !link || el.scrollWidth <= el.clientWidth) return
    const left = link.offsetLeft - (el.clientWidth - link.offsetWidth) / 2
    el.scrollTo({ left, behavior: 'smooth' })
  },
)
</script>

<!--
  Figma：Nav/Section Link（574:2751）；桌面 303:2137（左側直排、吸頂）、平板 908:9817（橫向分頁列）。
  第一項是遊戲名稱，連到主視覺（頁面最上面）。
  底色：surface/glass-panel（白 56%）。原本是 35%，在木紋上太透明（2026-11-05 調）。
  hover 和選中都有底線（選中時跟著字變 text/brand-strong）：用 text-decoration 貼著文字、離基線 4px，
  不佔空間、高度不變。Figma 原本 hover 的底線畫在外框底部，離字太遠，選中時也沒有底線（2026-11-05 改）。
  粗體的寬度先用一份隱形的粗體字撐開，選中時旁邊的項目不會被推動
-->
<template>
  <nav aria-label="章節導覽">
    <ul
      ref="list"
      class="flex gap-8 rounded-12 bg-surface-glass-panel px-12 py-16 backdrop-blur-[4px] @min-[1000px]:flex-col @max-[999px]:gap-24 @max-[999px]:overflow-x-auto @max-[999px]:rounded-8 @max-[999px]:[scrollbar-width:none]"
    >
      <li v-for="item in items" :key="item.id" class="shrink-0">
        <a
          :href="`#${item.id}`"
          :aria-current="item.id === active ? 'location' : undefined"
          class="group/link flex h-[36px] items-center type-tc-body-16 text-text-primary max-desktop:h-(--tap-button-min-height) aria-[current=location]:type-tc-title-16 aria-[current=location]:text-text-brand-strong"
          @click.prevent="emit('select', item.id)"
        >
          <span class="grid">
            <span
              class="col-start-1 row-start-1 decoration-1 underline-offset-4 group-hover/link:underline group-aria-[current=location]/link:underline"
            >
              {{ item.label }}
            </span>
            <span class="invisible col-start-1 row-start-1 type-tc-title-16" aria-hidden="true">
              {{ item.label }}
            </span>
          </span>
        </a>
      </li>
    </ul>
  </nav>
</template>
