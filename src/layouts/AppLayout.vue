<script setup>
import { onMounted, provide, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useMediaQuery } from '@vueuse/core'
import DeviceBanner from '@/components/DeviceBanner.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import SideRail from '@/components/layout/SideRail.vue'
import BottomNav from '@/components/layout/BottomNav.vue'
import SidePanel from '@/components/layout/SidePanel.vue'
import TabletPanel from '@/components/layout/TabletPanel.vue'
import ReadyCheckDialog from '@/components/ReadyCheckDialog.vue'
import { Toaster } from '@/components/ui/sonner'
import { getOnlineStats } from '@/api/stats'
import { useFavoritesStore } from '@/stores/favorites'
import { useMyTablesStore } from '@/stores/myTables'
import { usePolling } from '@/composables/usePolling'

// 開著的側欄面板：profile、tables、favorites；同一時間只開一個
const openPanel = ref(null)

// 桌面打開右側面板，平板打開 Bottom Sheet 或個人面板；和 max-desktop: 同一個斷點
const isTablet = useMediaQuery('(width < 1280px)')

// 從面板裡的連結換頁（例如收藏卡片到遊戲頁）時關掉面板，使用者才看得到要去的地方
const route = useRoute()
watch(
  () => route.fullPath,
  () => {
    openPanel.value = null
  },
)

function togglePanel(panel) {
  openPanel.value = openPanel.value === panel ? null : panel
}

// 頁面裡也要能打開面板：例如加入開放桌成功的提示按「查看」打開我的牌桌（PRD 7.6 第 2 條）。
// 面板開關只有版型在管，用 provide 交出去，頁面 inject('openPanel') 呼叫，不用為一個開關另外開 store
provide('openPanel', (panel) => {
  openPanel.value = panel
})

// 右側欄和底部導覽列共用同一份人數，只抓一次；失敗時維持 null（顯示「—」）
const stats = ref(null)

// 收藏在首頁卡片、遊戲頁、收藏面板都會用到，進站時拿一次
const favorites = useFavoritesStore()
// 我的牌桌：側欄和導覽列的紅點每一頁都要，進站時拿一次
const myTables = useMyTablesStore()
// 每 10 秒看一次：人到齊時排隊中 → 進行中並跳提示（MYTBL-11），即時制跳確認視窗（MYTBL-13），輪到你的紅點也跟著更新
usePolling(() => myTables.load(), 10 * 1000)
// 確認視窗開著時每秒看一次：誰確認了（打勾）、全員確認就開始、逾時收尾（第二階段改成 Supabase 即時推送）
usePolling(() => myTables.readyCheck && myTables.load(), 1000)

// 平板的 Bottom Sheet（Reka UI）會把點到外面當成關閉，確認視窗跳出時先收起來，按鈕才按得到
watch(
  () => myTables.readyCheck,
  (check) => {
    if (check && isTablet.value) openPanel.value = null
  },
)

onMounted(async () => {
  favorites.load()
  myTables.load()
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
  <ReadyCheckDialog
    :check="myTables.readyCheck"
    :accepting="myTables.acceptingId === myTables.readyCheck?.tableId"
    @accept="myTables.accept"
    @decline="myTables.decline"
  />
  <!-- 提示在畫面下方置中；平板在底部導覽列（72）上方，兩者都離 16 -->
  <!-- 提示在畫面上方置中、Header 下面 16（ADR 0016）：桌面和平板一樣 -->
  <!--
    桌面側欄面板開著時，提示移進面板裡（docs/adr/0017）：面板是原生 dialog，在瀏覽器最上層，
    提示留在外面會被蓋在模糊後面、「復原」按不到。移進去後一樣用 fixed 定位，位置不變
  -->
  <Teleport defer to="#side-panel" :disabled="!openPanel || isTablet">
    <Toaster position="top-center" :offset="{ top: 'calc(var(--header-height) + 16px)' }" />
  </Teleport>
</template>
