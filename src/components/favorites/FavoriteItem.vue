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
import DangerTextButton from '@/components/DangerTextButton.vue'
import GameBox from '@/components/GameBox.vue'
import PanelCard from '@/components/PanelCard.vue'
import { fadeOnHover, showOnHover } from '@/components/panelClasses'

defineProps({
  game: { type: Object, required: true },
  // 觸控裝置和平板 Bottom Sheet：按鈕常駐在卡片底部（產品規則 6.2）；滑鼠裝置的桌面側欄：懸停才出現
  touch: { type: Boolean, default: false },
})

defineEmits(['remove'])
</script>

<!--
  Figma：List/Favorite Item（574:2837）size=desktop state=default／hover、size=touch。外殼、懸停和觸控的行為見 PanelCard。
  整張卡（名稱連結撐滿）到遊戲頁最上面，只有「查看開放桌」捲到開放桌章節（/game/:slug#tables，2026-11-06）；「建立遊戲桌」本輪是佔位頁（FAV-03）
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
      <DangerTextButton @click="$emit('remove')">
        取消收藏<span class="sr-only">：{{ gameName(game) }}</span>
      </DangerTextButton>
      <div class="flex gap-8">
        <AppButton variant="secondary" size="sm" :to="`/game/${game.slug}#tables`">
          <FontAwesomeIcon :icon="faMagnifyingGlass" class="text-[12px]" aria-hidden="true" />
          查看開放桌
        </AppButton>
        <AppButton size="sm" to="/coming-soon">
          <FontAwesomeIcon :icon="faPlus" class="text-[12px]" aria-hidden="true" />
          建立遊戲桌
        </AppButton>
      </div>
    </template>
  </PanelCard>
</template>
