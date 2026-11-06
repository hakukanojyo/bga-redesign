<script setup>
import { RouterLink } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faChevronRight, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { gameName } from '@/api/games'
import { formatWait } from '@/utils/format'
import AppButton from '@/components/AppButton.vue'
import GameBox from '@/components/GameBox.vue'
import PanelCard from '@/components/PanelCard.vue'
import { fadeOnHover, showOnHover } from '@/components/panelClasses'
import TableHost from '@/components/mytables/TableHost.vue'

defineProps({
  // 我的牌桌的一列：{ tableId, table }
  row: { type: Object, required: true },
  touch: { type: Boolean, default: false },
})
</script>

<!--
  Figma：List/Queue Table Row（832:7306）size=desktop state=default／hover、size=touch。
  整張卡和「查看此桌詳細設定」都到詳細設定（MYTBL-07），本輪是佔位頁。「退出這桌」和確認彈窗在 #43 的 PR ③
-->
<template>
  <PanelCard :touch="touch">
    <GameBox :game="row.table.game" />
    <div class="flex min-w-0 flex-1 flex-col gap-16">
      <div class="flex items-center justify-between gap-8">
        <h3 class="truncate type-tc-body-16 text-text-body">
          <RouterLink
            to="/coming-soon"
            class="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {{ gameName(row.table.game) }}
            <span class="sr-only">（查看這桌的詳細設定）</span>
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
      <AppButton variant="secondary" size="sm" to="/coming-soon">
        <FontAwesomeIcon :icon="faMagnifyingGlass" class="text-[12px]" aria-hidden="true" />
        查看此桌詳細設定
      </AppButton>
    </template>
  </PanelCard>
</template>
