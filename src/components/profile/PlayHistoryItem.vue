<script setup>
import { RouterLink } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faChevronRight,
  faClock,
  faMagnifyingGlass,
  faPlus,
  faUserGroup,
} from '@fortawesome/free-solid-svg-icons'
import { gameName } from '@/api/games'
import { formatDuration, formatPlayers } from '@/utils/format'
import AppButton from '@/components/AppButton.vue'
import GameBox from '@/components/GameBox.vue'
import PanelCard from '@/components/PanelCard.vue'
import { fadeOnHover, showOnHover } from '@/components/panelClasses'

defineProps({
  game: { type: Object, required: true },
  // 觸控裝置和平板：按鈕常駐在卡片底部；滑鼠裝置的桌面側欄：懸停才出現
  touch: { type: Boolean, default: false },
})
</script>

<!--
  Figma：List/Play History Item（798:7224）。一張卡片是一場遊戲（同一款玩兩次就兩張）。外殼和懸停行為見 PanelCard。
  整張卡到遊戲主畫面最上面（和收藏一樣）；「查看這場紀錄」（次要，PROF-07 本輪不做）｜「建立遊戲桌」（主要，PROF-06），本輪都是佔位頁。
  沒有危險按鈕，整組靠右（和收藏卡片右邊那組對齊）
-->
<template>
  <PanelCard :touch="touch">
    <GameBox :game="game" />
    <div class="flex min-w-0 flex-1 flex-col gap-20">
      <div class="flex items-center justify-between gap-8">
        <h3 class="truncate type-tc-body-16 text-text-body">
          <RouterLink
            :to="`/game/${game.slug}`"
            class="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {{ gameName(game) }}
          </RouterLink>
        </h3>
        <span class="text-selection-accent" :class="!touch && showOnHover" aria-hidden="true">
          <FontAwesomeIcon :icon="faChevronRight" class="text-[14px]" />
        </span>
      </div>
      <p class="flex justify-between text-text-body" :class="!touch && fadeOnHover">
        <span class="flex items-center gap-4 type-en-body-13">
          <FontAwesomeIcon :icon="faUserGroup" class="text-[14px]" aria-hidden="true" />
          {{ formatPlayers(game.players) }}
        </span>
        <span class="flex items-center gap-4 type-tc-body-13">
          <FontAwesomeIcon :icon="faClock" class="text-[14px]" aria-hidden="true" />
          {{ formatDuration(game.duration) }}
        </span>
      </p>
    </div>

    <template #actions>
      <div class="ml-auto flex gap-8">
        <AppButton variant="secondary" size="sm" to="/coming-soon">
          <FontAwesomeIcon :icon="faMagnifyingGlass" class="text-[12px]" aria-hidden="true" />
          查看這場紀錄<span class="sr-only">：{{ gameName(game) }}</span>
        </AppButton>
        <AppButton size="sm" to="/coming-soon">
          <FontAwesomeIcon :icon="faPlus" class="text-[12px]" aria-hidden="true" />
          建立遊戲桌<span class="sr-only">：{{ gameName(game) }}</span>
        </AppButton>
      </div>
    </template>
  </PanelCard>
</template>
