<script setup>
import { onMounted, ref } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import DeviceBanner from '@/components/DeviceBanner.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import SideRail from '@/components/layout/SideRail.vue'
import BottomNav from '@/components/layout/BottomNav.vue'
import SidePanel from '@/components/layout/SidePanel.vue'
import TabletPanel from '@/components/layout/TabletPanel.vue'
import { Toaster } from '@/components/ui/sonner'
import { getOnlineStats } from '@/api/stats'

// 開著的側欄面板：profile、tables、favorites；同一時間只開一個
const openPanel = ref(null)

// 桌面打開右側面板，平板打開 Bottom Sheet 或個人面板；和 max-desktop: 同一個斷點
const isTablet = useMediaQuery('(width < 1280px)')

function togglePanel(panel) {
  openPanel.value = openPanel.value === panel ? null : panel
}

// 右側欄和底部導覽列共用同一份人數，只抓一次；失敗時維持 null（顯示「—」）
const stats = ref(null)

onMounted(async () => {
  try {
    stats.value = await getOnlineStats()
  } catch {
    stats.value = null
  }
})
</script>

<!-- 整頁版型：桌面右邊留 164 給右側欄，平板底部留 72 給底部導覽列；頁尾在內容區最下面，不蓋到兩者 -->
<template>
  <!-- 至少一個畫面高、main 撐開：內容很短時（佔位頁、404）頁尾也貼在底部；main 是 flex，頁面用 flex-1 就能置中 -->
  <div class="flex min-h-dvh flex-col pr-[164px] max-desktop:pr-0 max-desktop:pb-[72px]">
    <DeviceBanner />
    <AppHeader @open-profile="togglePanel('profile')" />
    <main class="flex flex-1 flex-col">
      <slot />
    </main>
    <AppFooter />
  </div>
  <SideRail :open-panel="openPanel" :stats="stats" @toggle="togglePanel" />
  <BottomNav :open-panel="openPanel" :stats="stats" @toggle="togglePanel" />
  <SidePanel :panel="isTablet ? null : openPanel" @toggle="togglePanel" @close="openPanel = null" />
  <TabletPanel :panel="isTablet ? openPanel : null" @close="openPanel = null" />
  <!-- 提示在畫面下方置中；平板在底部導覽列（72）上方，兩者都離 16 -->
  <Toaster :offset="{ bottom: isTablet ? 88 : 16 }" />
</template>
