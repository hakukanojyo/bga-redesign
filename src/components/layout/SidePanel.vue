<script setup>
import { ref, watch } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import SideRailItem from '@/components/layout/SideRailItem.vue'
import PanelContent from '@/components/layout/PanelContent.vue'
import { panelTitles, railItems } from '@/components/layout/railItems'
import avatar from '@/assets/images/avatar-demo.jpg'

const props = defineProps({
  // 開著的面板：profile、tables、favorites；null 是關著
  panel: { type: String, default: null },
})

const emit = defineEmits(['toggle', 'close'])

// 寬度 1280 以上的大 iPad 也是桌面側欄，但不能懸停，卡片改用按鈕常駐的觸控版（產品規則 6.2）
const noHover = useMediaQuery('(hover: none)')

// 用原生 <dialog>：showModal() 內建鎖焦點、Esc 關閉、關掉後焦點回到原本的按鈕
const dialog = ref(null)

watch(
  () => props.panel,
  (panel) => {
    if (panel && !dialog.value.open) dialog.value.showModal()
    if (!panel && dialog.value.open) dialog.value.close()
  },
)

// 點到面板外（遮罩）時，事件的目標是 dialog 本身
function onClick(event) {
  if (event.target === dialog.value) emit('close')
}
</script>

<!-- Figma：Layout/Side Panel panel=個人（685:3928）、我的收藏（685:4478）。面板向左展開蓋住側欄，不推擠版面（FB-10）。內容見 PanelContent -->
<!--
  不裁切（overflow-visible）：面板裡的圖示 hover 時提示框要跑到面板左邊、蓋在遮罩上，和面板關著時一樣（2026-11-06）。
  展開途中右邊的內容會超出面板，但面板貼著畫面右緣，超出的部分在畫面外看不到。
  動畫：面板一開始和右側欄重疊（164 寬、側欄的底色），再往左長到 443 寬（Figma 421，2026-11-06 加寬 22：收藏卡片的三顆按鈕加上兩組之間的 20 才排得下），圖示跟著被推到面板左邊、底色漸變成面板的玻璃色；關閉時反過來。
  @starting-style（starting:）是 dialog 剛打開那一刻的樣子，動畫才有起點；group-open/panel: 讓裡面的元素跟著 dialog 開關變化。減少動態效果時直接出現。
-->
<template>
  <dialog
    id="side-panel"
    ref="dialog"
    :aria-label="panelTitles[panel]"
    class="group/panel ml-auto h-dvh max-h-none w-[164px] overflow-visible bg-transparent transition-[width,overlay,display] transition-discrete duration-300 ease-[cubic-bezier(0.2,0,0,1)] open:w-[443px] starting:open:w-[164px] backdrop:bg-overlay-backdrop backdrop:opacity-0 backdrop:backdrop-blur-[4px] backdrop:transition-[opacity,overlay,display] backdrop:transition-discrete backdrop:duration-300 open:backdrop:opacity-100 starting:open:backdrop:opacity-0 motion-reduce:transition-none motion-reduce:backdrop:transition-none"
    @click="onClick"
    @close="emit('close')"
  >
    <div
      class="relative flex h-full gap-12 bg-surface-glass-faint pr-12 pb-20 pl-20 backdrop-blur-[4px] transition-[background-color,padding,backdrop-filter] duration-300 ease-[cubic-bezier(0.2,0,0,1)] group-open/panel:bg-surface-glass-panel group-open/panel:pl-12 group-open/panel:backdrop-blur-[15px] starting:group-open/panel:bg-surface-glass-faint starting:group-open/panel:pl-20 starting:group-open/panel:backdrop-blur-[4px] motion-reduce:transition-none"
    >
      <!-- 起點和右側欄一樣：頂部 72 是頭像區的底色，展開時淡掉 -->
      <div
        aria-hidden="true"
        class="absolute inset-x-0 top-0 -z-10 h-[72px] bg-surface-header transition-opacity duration-300 group-open/panel:opacity-0 starting:group-open/panel:opacity-100 motion-reduce:transition-none"
      />
      <!-- 面板裡的側欄：可以直接切換到其他面板 -->
      <div class="flex w-[34px] flex-col">
        <div class="h-[72px] pt-20">
          <button
            type="button"
            aria-label="個人資料"
            class="block"
            :aria-expanded="panel === 'profile'"
            @click="emit('toggle', 'profile')"
          >
            <!-- 從右側欄的 40 縮到面板的 34 -->
            <img
              :src="avatar"
              alt=""
              width="34"
              height="34"
              class="size-[40px] max-w-none rounded-full border-2 border-border-accent object-cover transition-[width,height] duration-300 ease-[cubic-bezier(0.2,0,0,1)] group-open/panel:size-[34px] starting:group-open/panel:size-[40px] motion-reduce:transition-none"
            />
          </button>
        </div>
        <ul class="flex flex-1 flex-col justify-center gap-12">
          <li v-for="item in railItems" :key="item.label">
            <SideRailItem
              :item="item"
              :active="panel === item.panel"
              @toggle="emit('toggle', $event)"
            />
          </li>
        </ul>
        <!-- 和右側欄底部的人數同高，展開前後圖示才會在同一個高度（Figma 也這樣留空） -->
        <div class="h-[63px]" />
      </div>

      <!-- 固定寬度，面板變寬時內容不會被擠壓；跟著淡入。上方間距照 Figma：個人面板 20＋8（和平板的 TabletPanel 一樣拆兩層），我的收藏 20 -->
      <section
        class="flex w-[373px] shrink-0 flex-col pt-20 opacity-0 transition-opacity duration-300 group-open/panel:opacity-100 starting:group-open/panel:opacity-0 motion-reduce:transition-none"
      >
        <div class="flex min-h-0 flex-1 flex-col gap-16" :class="panel === 'profile' && 'pt-8'">
          <h2 class="px-16 type-tc-heading-20 text-text-primary">{{ panelTitles[panel] }}</h2>
          <!-- 標題到內容 20（gap 16＋4）；捲動區在各面板裡（panelClasses.js 的 panelScroll），分頁才能留在上面不動 -->
          <div class="flex min-h-0 flex-1 flex-col px-16 pt-4 pb-8">
            <PanelContent :panel="panel" :touch="noHover" />
          </div>
        </div>
      </section>
    </div>
  </dialog>
</template>
