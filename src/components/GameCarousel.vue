<script setup>
import { onBeforeUnmount, onMounted, ref, useId } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'

defineProps({
  // 給箭頭的名稱用，例如「往右看更多為你推薦」
  label: { type: String, required: true },
})

// 箭頭 40 寬＋卡片間距 12：捲動後卡片停在這條線上，左邊露出一截的卡片剛好被箭頭壓住（PRD 7.1 第 3 條）
const ARROW_SPACE = 52
const GAP = 12

const listId = useId()
const list = ref(null)
const atStart = ref(true)
const atEnd = ref(true)

function update() {
  const el = list.value
  if (!el) return
  atStart.value = el.scrollLeft <= 1
  atEnd.value = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1
}

// 一次移一頁：完整看得到的張數；剩下不夠一頁時瀏覽器會停在最後，scroll-snap 讓卡片邊緣對齊
function page(direction) {
  const el = list.value
  const card = el.firstElementChild
  const step = card.offsetWidth + GAP
  const perPage = Math.max(1, Math.floor((el.clientWidth - ARROW_SPACE * 2 + GAP) / step))
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollBy({ left: direction * perPage * step, behavior: reduce ? 'auto' : 'smooth' })
}

// 左箭頭用同一個樣式左右翻轉（Figma 也是），圓角和漸層方向跟著翻；觸控裝置（含大平板）不顯示
const arrowClass =
  'absolute top-0 bottom-12 flex w-[40px] items-center justify-center rounded-r-8 bg-(image:--gradient-carousel-arrow) text-icon-primary opacity-0 transition-opacity duration-200 group-hover/row:opacity-100 hover:bg-(image:--gradient-carousel-arrow-hover) hover:backdrop-blur-[7px] focus-visible:opacity-100 max-desktop:hidden [@media(hover:none)]:hidden'

let observer
onMounted(() => {
  update()
  // 卡片圖片載入、視窗變寬時，能不能捲會變
  observer = new ResizeObserver(update)
  observer.observe(list.value)
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<!--
  Figma：分區裡的卡片列＋Card/Carousel Arrow（360:4637）。一般的橫向捲動加 CSS scroll-snap，不用輪播套件：
  手指滑、觸控板、鍵盤捲動都是瀏覽器內建的。
  箭頭只在桌面、滑鼠移到這一排或 Tab 到箭頭時出現；到最左、最右時那一側不顯示。
  刻意和 Figma 不同：Figma 平板也畫了箭頭，PRD 7.1 寫平板用滑的，照 PRD
-->
<template>
  <div class="group/row relative">
    <ul
      :id="listId"
      ref="list"
      class="flex snap-x snap-mandatory scroll-px-[52px] gap-12 overflow-x-auto pb-12 [scrollbar-width:none]"
      @scroll.passive="update"
    >
      <slot />
    </ul>
    <button
      v-if="!atStart"
      type="button"
      :aria-label="`往左看更多${label}`"
      :aria-controls="listId"
      :class="[arrowClass, 'left-0 -scale-x-100']"
      @click="page(-1)"
    >
      <FontAwesomeIcon :icon="faChevronRight" class="text-[24px]" aria-hidden="true" />
    </button>
    <button
      v-if="!atEnd"
      type="button"
      :aria-label="`往右看更多${label}`"
      :aria-controls="listId"
      :class="[arrowClass, 'right-0']"
      @click="page(1)"
    >
      <FontAwesomeIcon :icon="faChevronRight" class="text-[24px]" aria-hidden="true" />
    </button>
  </div>
</template>
