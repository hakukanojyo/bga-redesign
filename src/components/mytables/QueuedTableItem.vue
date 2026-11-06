<script setup>
import { nextTick, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faChevronRight, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { gameName } from '@/api/games'
import { formatWait } from '@/utils/format'
import AppButton from '@/components/AppButton.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import DangerTextButton from '@/components/DangerTextButton.vue'
import GameBox from '@/components/GameBox.vue'
import PanelCard from '@/components/PanelCard.vue'
import { fadeOnHover, showOnHover } from '@/components/panelClasses'
import TableHost from '@/components/mytables/TableHost.vue'
import { useMyTablesStore } from '@/stores/myTables'

const props = defineProps({
  // 我的牌桌的一列：{ tableId, table }
  row: { type: Object, required: true },
  touch: { type: Boolean, default: false },
})

const store = useMyTablesStore()
const confirming = ref(false)

// 先關彈窗再拿掉這張卡：卡片拿掉時彈窗也會跟著被移除，關好了焦點才回得去
async function leave() {
  confirming.value = false
  await nextTick()
  store.leave(props.row.tableId)
}
</script>

<!--
  Figma：List/Queue Table Row（832:7306）size=desktop state=default／hover、size=touch。
  整張卡到遊戲主畫面最上面，「查看此桌詳細設定」才到詳細設定（MYTBL-07，本輪佔位頁）：一個入口一個去處（2026-11-06）。
  「退出這桌」先跳確認彈窗（MYTBL-08、產品規則 4.2），按鈕條裡放左邊（危險在左、主要在右）
-->
<template>
  <PanelCard :touch="touch">
    <GameBox :game="row.table.game" />
    <div class="flex min-w-0 flex-1 flex-col gap-16">
      <div class="flex items-center justify-between gap-8">
        <h3 class="truncate type-tc-body-16 text-text-body">
          <RouterLink
            :to="`/game/${row.table.game.slug}`"
            class="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {{ gameName(row.table.game) }}
          </RouterLink>
        </h3>
        <span class="text-selection-accent" :class="!touch && showOnHover" aria-hidden="true">
          <FontAwesomeIcon :icon="faChevronRight" class="text-[14px]" />
        </span>
      </div>
      <div class="flex flex-col gap-4" :class="!touch && fadeOnHover">
        <p class="type-tc-body-13 text-text-body">
          預估等待 {{ formatWait(row.table.estimatedWaitMinutes) }}
        </p>
        <TableHost :host="row.table.host" />
      </div>
    </div>

    <template #actions>
      <DangerTextButton @click="confirming = true">
        退出這桌<span class="sr-only">：{{ gameName(row.table.game) }}</span>
      </DangerTextButton>
      <AppButton variant="secondary" size="sm" to="/coming-soon">
        <FontAwesomeIcon :icon="faMagnifyingGlass" class="text-[12px]" aria-hidden="true" />
        查看此桌詳細設定
      </AppButton>
    </template>
  </PanelCard>
  <ConfirmDialog
    :open="confirming"
    title="要退出這桌嗎？"
    description="退出後會失去目前的排隊順位"
    confirm-label="確定退出"
    @confirm="leave"
    @cancel="confirming = false"
  />
</template>
