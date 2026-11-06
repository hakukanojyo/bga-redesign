<script setup>
import SideRailItem from '@/components/layout/SideRailItem.vue'
import OnlineStats from '@/components/layout/OnlineStats.vue'
import { railItems } from '@/components/layout/railItems'

defineProps({
  openPanel: { type: String, default: null },
  stats: { type: Object, default: null },
})

defineEmits(['toggle'])
</script>

<!--
  Figma：Layout/Bottom Nav（872:8815），平板取代右側欄。
  底色是和頁面一樣的木紋（2026-11-06，原本 surface/glass-nav 半透明）：內容從後面捲過去會透出來，白色圖示看不清楚；
  桌面右側欄也是白色圖示放在木紋上，兩邊一致。
  面板開著時導覽列要露在遮罩上面、還能點（PRD 7.10）：z-50 蓋過面板（z-40）；pointer-events-auto 是因為面板開著時 body 會被設成不能點；data-panel-nav 讓面板知道點的是導覽列
-->
<template>
  <nav
    aria-label="側欄選單"
    data-panel-nav
    class="pointer-events-auto fixed inset-x-0 bottom-0 z-50 hidden h-[72px] items-center justify-between bg-wood px-32 shadow-glass-nav max-desktop:flex"
  >
    <ul class="flex flex-1 items-center justify-between pr-32">
      <li v-for="item in railItems" :key="item.label">
        <SideRailItem
          :item="item"
          :active="openPanel === item.panel"
          @toggle="$emit('toggle', $event)"
        />
      </li>
    </ul>
    <OnlineStats :stats="stats" layout="bar" />
  </nav>
</template>
