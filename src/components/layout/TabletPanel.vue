<script setup>
import { ref, watch } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import PanelContent from '@/components/layout/PanelContent.vue'
import { panelTitles } from '@/components/layout/railItems'

const props = defineProps({
  // 開著的面板：profile、tables、favorites…；null 是關著
  panel: { type: String, default: null },
})

const emit = defineEmits(['close'])

// 關閉動畫還在跑時 panel 已經是 null，記住最後一個面板，標題和方向才不會在關閉途中跳掉
const shownPanel = ref(props.panel)

watch(
  () => props.panel,
  (panel) => {
    if (panel) shownPanel.value = panel
  },
)

// 點到底部導覽列時不關閉，交給導覽列切換或關掉面板（PRD 7.10：再點同一個按鈕關閉）；
// 點在面板上面的確認彈窗（原生 dialog，不在 Sheet 裡面）也不關閉
function onInteractOutside(event) {
  if (event.target.closest?.('[data-panel-nav], dialog')) event.preventDefault()
}
</script>

<!--
  Figma：Layout/Bottom Sheet（993:1762）、Layout/Side Panel panel=個人-tablet（993:1769）。
  平板的頭像從右側滑出個人面板（寬 375），其他項目從下往上打開 Bottom Sheet（固定高 480）；遮罩和面板都停在底部導覽列上方。
  shadcn-vue 的 Sheet（Reka UI Dialog）負責鎖焦點、Esc 關閉、關掉後焦點回到原本的按鈕。內容見 PanelContent
-->
<template>
  <Sheet :open="!!panel" @update:open="(open) => !open && emit('close')">
    <!-- 間距照 Figma：個人面板外層 12、內層 16、上方 20+8；Bottom Sheet 四周 24、標題和內容間隔 16 -->
    <SheetContent
      :side="shownPanel === 'profile' ? 'right' : 'bottom'"
      :class="shownPanel === 'profile' ? 'bottom-[72px] w-[375px]' : 'bottom-[72px] h-[480px]'"
      overlay-class="bottom-[72px]"
      :aria-describedby="undefined"
      @interact-outside="onInteractOutside"
    >
      <div
        class="flex min-h-0 flex-1 flex-col"
        :class="shownPanel === 'profile' ? 'px-12 py-20' : 'p-24'"
      >
        <div
          class="flex min-h-0 flex-1 flex-col gap-16"
          :class="shownPanel === 'profile' && 'px-16 pt-8'"
        >
          <!-- 右上角 ×（2026-11-07）：只靠點遮罩、再點導覽列關閉不夠明顯。點擊範圍 44，疊在標題列右邊（absolute），標題列高度不變 -->
          <div class="relative pr-32">
            <SheetTitle>{{ panelTitles[shownPanel] }}</SheetTitle>
            <button
              type="button"
              class="absolute top-1/2 -right-12 flex size-[44px] -translate-y-1/2 items-center justify-center rounded-full text-text-secondary hover:bg-surface-subtle"
              @click="emit('close')"
            >
              <FontAwesomeIcon :icon="faXmark" class="text-[20px]" aria-hidden="true" />
              <span class="sr-only">關閉{{ panelTitles[shownPanel] }}</span>
            </button>
          </div>
          <!-- 內容在 sheet 裡上下捲動（PRD 7.8 第 8 條）；捲動區在各面板裡（panelClasses.js 的 panelScroll） -->
          <div class="flex min-h-0 flex-1 flex-col">
            <PanelContent :panel="shownPanel" touch />
          </div>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>
