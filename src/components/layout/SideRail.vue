<script setup>
import SideRailItem from '@/components/layout/SideRailItem.vue'
import OnlineStats from '@/components/layout/OnlineStats.vue'
import { railItems } from '@/components/layout/railItems'
import avatar from '@/assets/images/avatar-demo.jpg'

defineProps({
  openPanel: { type: String, default: null },
  stats: { type: Object, default: null },
})

defineEmits(['toggle'])
</script>

<!-- Figma：Layout/Side Panel panel=收合（685:3927），只有桌面 -->
<template>
  <!--
    面板開著時藏起來，圖示只剩面板裡那一組；關閉時等面板縮回來（0.3 秒）才出現，剛好接上。
    z-40：滑鼠移到圖示時的說明文字會往左伸到內容上，要蓋過內容裡有 z-index 的東西（卡片的收藏按鈕、
    遊戲頁的按鈕 z-10）和 Header（z-30）；平板的底部導覽列 z-50 不會同時出現
  -->
  <aside
    aria-label="側欄"
    class="fixed inset-y-0 right-0 z-40 flex w-[164px] flex-col max-desktop:hidden"
    :class="
      openPanel ? 'invisible' : 'visible transition-[visibility] delay-300 motion-reduce:delay-0'
    "
  >
    <div class="bg-surface-header pt-20 pb-12 pl-20">
      <button
        type="button"
        aria-label="個人資料"
        aria-haspopup="dialog"
        class="block"
        :aria-expanded="openPanel === 'profile'"
        @click="$emit('toggle', 'profile')"
      >
        <img
          :src="avatar"
          alt=""
          width="40"
          height="40"
          class="size-[40px] rounded-full border-2 border-border-accent object-cover"
        />
      </button>
    </div>

    <div
      class="flex flex-1 flex-col bg-surface-glass-faint pr-12 pb-20 pl-20 shadow-glass-nav backdrop-blur-[4px]"
    >
      <nav aria-label="側欄選單" class="flex flex-1 flex-col justify-center">
        <ul class="flex flex-col gap-12">
          <li v-for="item in railItems" :key="item.label">
            <SideRailItem
              :item="item"
              :active="openPanel === item.panel"
              @toggle="$emit('toggle', $event)"
            />
          </li>
        </ul>
      </nav>
      <OnlineStats :stats="stats" />
    </div>
  </aside>
</template>
