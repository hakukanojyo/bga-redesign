<script setup>
import { onMounted, ref } from 'vue'
import DeviceBanner from '@/components/DeviceBanner.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import SideRail from '@/components/layout/SideRail.vue'
import BottomNav from '@/components/layout/BottomNav.vue'
import SidePanel from '@/components/layout/SidePanel.vue'
import { getOnlineStats } from '@/api/stats'

// 開著的側欄面板：profile、tables、favorites；同一時間只開一個
const openPanel = ref(null)

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

<!-- 整頁版型：桌面右邊留 164 給右側欄，平板底部留 72 給底部導覽列。頁尾在 #14 的下一個 PR 加 -->
<template>
  <div class="pr-[164px] max-desktop:pr-0 max-desktop:pb-[72px]">
    <DeviceBanner />
    <AppHeader @open-profile="togglePanel('profile')" />
    <main>
      <slot />
    </main>
  </div>
  <SideRail :open-panel="openPanel" :stats="stats" @toggle="togglePanel" />
  <BottomNav :open-panel="openPanel" :stats="stats" @toggle="togglePanel" />
  <SidePanel :panel="openPanel" @toggle="togglePanel" @close="openPanel = null" />
</template>
