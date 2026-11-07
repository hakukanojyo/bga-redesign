<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { gameName } from '@/api/games'
import { formatTableInfo } from '@/utils/format'
import GameBox from '@/components/GameBox.vue'
import PanelCard from '@/components/PanelCard.vue'
import TableHost from '@/components/mytables/TableHost.vue'

const props = defineProps({
  // 我的牌桌的一列：{ tableId, isMyTurn, table }
  row: { type: Object, required: true },
  touch: { type: Boolean, default: false },
})

// 現在需要你的桌加外框和標籤（2026-11-06）：回合制輪到你（青）、即時制對戰中（橘）；顏色之外還有文字，色弱也分得出來
const highlight = computed(() =>
  props.row.isMyTurn ? 'turn' : props.row.table.pace === 'realtime' ? 'live' : '',
)
const badges = {
  turn: { label: '你的回合', class: 'bg-rail-table' },
  live: { label: '對戰中', class: 'bg-status-live' },
}
const info = computed(() => formatTableInfo(props.row.table))
</script>

<!--
  Figma：List/Playing Table Row（798:6918）state=default／hover／your-turn；對戰中是 2026-11-06 新增的。
  整張卡（名稱連結撐滿）進入遊戲桌（MYTBL-05），本輪是佔位頁；右上的「進入此遊戲桌 ›」或標籤只是提示，不是另一個連結。
  標籤白字在青、橘底上對比不足，照 Figma 維持（2026-11-06 決定，之後和側欄提示框一起處理）
-->
<template>
  <PanelCard :touch="touch" :highlight="highlight">
    <GameBox :game="row.table.game" />
    <div class="flex min-w-0 flex-1 flex-col gap-20">
      <div class="flex items-center justify-between gap-8">
        <h3 class="truncate type-tc-body-16 text-text-body">
          <RouterLink
            to="/coming-soon"
            class="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {{ gameName(row.table.game) }}
            <span v-if="highlight" class="sr-only">（{{ badges[highlight].label }}）</span>
          </RouterLink>
        </h3>
        <span
          v-if="highlight"
          class="flex shrink-0 items-center gap-2 rounded-full px-8 py-4 type-tc-caption-11 text-text-inverse"
          :class="badges[highlight].class"
          aria-hidden="true"
        >
          {{ badges[highlight].label }}
          <FontAwesomeIcon :icon="faChevronRight" class="text-[10px]" />
        </span>
        <span
          v-else
          class="flex shrink-0 items-center gap-4 type-tc-caption-12 text-action-primary"
          aria-hidden="true"
        >
          進入此遊戲桌
          <FontAwesomeIcon :icon="faChevronRight" class="text-[10px]" />
        </span>
      </div>
      <div class="flex flex-col gap-4">
        <TableHost :host="row.table.host" />
        <p class="truncate type-tc-body-13 text-text-body" :title="info">
          <span class="sr-only">設定：</span>{{ info }}
        </p>
      </div>
    </div>
  </PanelCard>
</template>
