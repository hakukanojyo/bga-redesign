<script setup>
import { computed, onMounted } from 'vue'
import { useMyTablesStore } from '@/stores/myTables'
import AppButton from '@/components/AppButton.vue'
import ListTransition from '@/components/ListTransition.vue'
import BlockError from '@/components/BlockError.vue'
import PageState from '@/components/PageState.vue'
import SegmentedControl from '@/components/SegmentedControl.vue'
import SkeletonBlock from '@/components/SkeletonBlock.vue'
import { panelScroll } from '@/components/panelClasses'
import PlayingTableItem from '@/components/mytables/PlayingTableItem.vue'
import QueuedTableItem from '@/components/mytables/QueuedTableItem.vue'
import mascot from '@/assets/images/mascot-cool.svg'

defineProps({
  // 平板 Bottom Sheet、觸控裝置：卡片排成直向 2 欄、橫向 3 欄，排隊中的按鈕常駐
  touch: { type: Boolean, default: false },
})

const store = useMyTablesStore()

// 打開面板時重拿一次：排隊的人數、輪到誰可能變了（已經有資料時不顯示骨架）。
// 進行中是 0、排隊中有桌時先看排隊中：剛加入的在那裡，不先看到「目前沒有進行中的牌桌」以為沒加入成功（2026-11-11）
onMounted(() => {
  if (!store.playing.length && store.queued.length) store.tab = 'queued'
  store.load()
})

const tabs = computed(() => [
  { value: 'playing', label: `進行中 ${store.playing.length}` },
  { value: 'queued', label: `排隊中 ${store.queued.length}` },
])
const rows = computed(() => (store.tab === 'playing' ? store.playing : store.queued))

// 沒有牌桌時的文字（產品規則 5.1）
const empty = {
  playing: {
    title: '目前沒有進行中的牌桌',
    description: '加入或建立一桌 開始和其他玩家對戰吧！',
  },
  queued: {
    title: '目前沒有排隊中的牌桌',
    description: '加入開放桌後 等待其他玩家到齊時會顯示在這裡',
  },
}
</script>

<!--
  我的牌桌（MYTBL-01～06、09、10）：分頁「進行中 N」「排隊中 N」放在捲動區外面，捲動時不動。
  進行中的順序由 API 排好：輪到你 → 即時制 → 其他回合制（2026-11-06）
-->
<template>
  <div class="flex min-h-0 flex-1 flex-col gap-20">
    <SegmentedControl v-model="store.tab" legend="我的牌桌分頁" hide-legend :options="tabs" />
    <div :class="panelScroll">
      <div
        v-if="store.status === 'loading' || store.status === 'idle'"
        class="grid"
        :class="
          touch ? 'grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-16' : 'grid-cols-1 gap-8'
        "
        aria-busy="true"
      >
        <SkeletonBlock v-for="n in 4" :key="n" class="h-[116px] rounded-8" />
      </div>
      <BlockError v-else-if="store.status === 'error'" @retry="store.load()" />
      <div v-else-if="!rows.length" class="flex flex-1 items-center justify-center py-32">
        <PageState
          size="sm"
          :level="3"
          :image="mascot"
          :title="empty[store.tab].title"
          :description="empty[store.tab].description"
        >
          <AppButton to="/tables">尋找開放桌</AppButton>
        </PageState>
      </div>
      <!-- 換分頁是換一整份清單，用 key 直接換掉，不要每張卡都跑淡出淡入 -->
      <ListTransition
        v-else
        :key="store.tab"
        class="grid content-start"
        :class="
          touch ? 'grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-16' : 'grid-cols-1 gap-8'
        "
      >
        <li v-for="row in rows" :key="row.tableId">
          <PlayingTableItem v-if="store.tab === 'playing'" :row="row" :touch="touch" />
          <QueuedTableItem v-else :row="row" :touch="touch" />
        </li>
      </ListTransition>
    </div>
  </div>
</template>
