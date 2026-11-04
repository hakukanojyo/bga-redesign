<script setup>
import { ref, watch } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faScrewdriverWrench } from '@fortawesome/free-solid-svg-icons'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
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

// 點到底部導覽列時不關閉，交給導覽列切換或關掉面板（PRD 7.10：再點同一個按鈕關閉）
function onInteractOutside(event) {
  if (event.target.closest?.('[data-panel-nav]')) event.preventDefault()
}
</script>

<!--
  Figma：Layout/Bottom Sheet（993:1762）、Layout/Side Panel panel=個人-tablet（993:1769）。
  平板的頭像從右側滑出個人面板（寬 375），其他項目從下往上打開 Bottom Sheet（固定高 480）；遮罩和面板都停在底部導覽列上方。
  shadcn-vue 的 Sheet（Reka UI Dialog）負責鎖焦點、Esc 關閉、關掉後焦點回到原本的按鈕。內容之後做
-->
<template>
  <Sheet :open="!!panel" @update:open="(open) => !open && emit('close')">
    <!-- 間距照 Figma：個人面板外層 12、內層 16、上方 20+8；Bottom Sheet 四周 24、標題和內容間隔 16 -->
    <SheetContent
      :side="shownPanel === 'profile' ? 'right' : 'bottom'"
      :class="
        shownPanel === 'profile'
          ? 'bottom-[72px] w-[375px] px-12 py-20'
          : 'bottom-[72px] h-[480px] p-24'
      "
      overlay-class="bottom-[72px]"
      :aria-describedby="undefined"
      @interact-outside="onInteractOutside"
    >
      <div
        class="flex flex-1 flex-col"
        :class="shownPanel === 'profile' ? 'gap-16 px-16 pt-8' : 'gap-16'"
      >
        <SheetTitle>{{ panelTitles[shownPanel] }}</SheetTitle>
        <div class="flex flex-1 flex-col items-center justify-center gap-8 text-text-secondary">
          <FontAwesomeIcon :icon="faScrewdriverWrench" class="text-[32px]" />
          <p class="type-tc-body-13">這張桌子還在佈置中</p>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>
