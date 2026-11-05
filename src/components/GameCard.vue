<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faClock, faCrown, faUserGroup } from '@fortawesome/free-solid-svg-icons'
import { gameName } from '@/api/games'
import { formatDuration, formatPlayers } from '@/utils/format'

const props = defineProps({
  game: { type: Object, required: true },
  // large：Card/Game Cover（直的封面）；small：Card/Game Result（橫的橫幅）
  size: { type: String, default: 'large' },
})

const large = props.size === 'large'
const image = large ? props.game.images.box : props.game.images.banner
const imageFailed = ref(false)
</script>

<!--
  Figma：Card/Game Cover（360:4447，223×299）、Card/Game Result（575:655，排在分區裡是 300×190）。
  整張是連結，前往遊戲頁（HOME-08）；資訊面板貼在底部，VIP 標籤靠右站在面板上。
  圖片是裝飾（名稱已經是文字），alt 留空；沒有圖或載入失敗留灰底，尺寸不變（產品規則 5.3）。
  懸停浮出介紹和「加入收藏」在下一個 PR（HOME-07）
-->
<template>
  <RouterLink
    :to="`/game/${game.slug}`"
    class="relative flex shrink-0 flex-col justify-end overflow-hidden rounded-8 border-3 border-border-on-image bg-surface-placeholder"
    :class="
      large ? 'h-[299px] w-[223px] items-center shadow-card-cover' : 'h-[190px] w-[300px] items-end'
    "
  >
    <img
      v-if="image && !imageFailed"
      :src="image"
      alt=""
      loading="lazy"
      class="absolute inset-0 size-full object-cover"
      @error="imageFailed = true"
    />
    <div class="relative flex w-full flex-col items-end">
      <span
        v-if="game.isPremium"
        class="flex h-[22px] w-[60px] items-center justify-center rounded-t-16 bg-badge-vip pt-2 text-text-primary shadow-bevel-button-gold"
      >
        <FontAwesomeIcon :icon="faCrown" class="text-[14px]" aria-hidden="true" />
        <span class="sr-only">尊榮遊戲</span>
      </span>
      <div
        class="flex w-full flex-col rounded-b-4 bg-surface-glass px-16"
        :class="large ? 'gap-4 py-8' : 'gap-4 py-12'"
      >
        <h3
          class="truncate text-text-body"
          :class="large ? 'type-tc-heading-20' : 'type-tc-title-16'"
        >
          {{ gameName(game) }}
        </h3>
        <p
          class="flex justify-between text-text-body"
          :class="large ? 'type-tc-label-14' : 'type-tc-caption-12'"
        >
          <span class="flex items-center gap-4">
            <FontAwesomeIcon
              :icon="faUserGroup"
              :class="large ? 'text-[16px]' : 'text-[14px]'"
              aria-hidden="true"
            />
            {{ formatPlayers(game.players) }}
          </span>
          <span class="flex items-center gap-4">
            <FontAwesomeIcon
              :icon="faClock"
              :class="large ? 'text-[16px]' : 'text-[14px]'"
              aria-hidden="true"
            />
            {{ formatDuration(game.duration) }}
          </span>
        </p>
      </div>
    </div>
  </RouterLink>
</template>
