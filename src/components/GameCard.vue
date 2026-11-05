<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faClock, faCrown, faUserGroup } from '@fortawesome/free-solid-svg-icons'
import { gameName } from '@/api/games'
import { formatDuration, formatPlayers } from '@/utils/format'

defineProps({
  game: { type: Object, required: true },
  // large：Card/Game Cover（直的）；small：Card/Game Result（橫的）
  size: { type: String, default: 'large' },
})

const bannerFailed = ref(false)
const logoFailed = ref(false)
</script>

<!--
  Figma：Card/Game Cover（360:4447，223×299）、Card/Game Result（575:655，排在分區裡是 300×190）。
  整張是連結，前往遊戲頁（HOME-08）。兩種卡片都是兩層圖：橫幅鋪滿（object-cover，從中間裁），
  標準字完整放進資訊面板上方剩下的空間（object-contain），面板多高那塊就多小，標準字不會被擋住；
  上新遊戲不用一張一張調位置。標準字太方的（例如展翅翱翔）用最大寬高限制，不會搶畫面。
  外框：Figma 的 Inside stroke 蓋在圖上，CSS border 畫在圖外、底下透出灰底，所以改用 after 疊一層邊框；
  面板離邊 3px 就是這條外框的寬度。
  字級兩種卡片統一：名稱 Title 18、人數和時間 Label 14（Figma 兩個元件原本不一致，已改成同一組）。
  圖片是裝飾（名稱已經是文字），alt 留空；沒有圖或載入失敗留灰底，尺寸不變（產品規則 5.3）。
  懸停浮出介紹和「加入收藏」在下一個 PR（HOME-07）
-->
<template>
  <RouterLink
    :to="`/game/${game.slug}`"
    class="relative flex shrink-0 flex-col overflow-hidden rounded-8 bg-surface-placeholder p-[3px] after:pointer-events-none after:absolute after:inset-0 after:rounded-8 after:border-3 after:border-border-on-image"
    :class="size === 'large' ? 'h-[299px] w-[223px] shadow-card-cover' : 'h-[190px] w-[300px]'"
  >
    <img
      v-if="game.images.banner && !bannerFailed"
      :src="game.images.banner"
      alt=""
      loading="lazy"
      class="absolute inset-0 size-full object-cover"
      @error="bannerFailed = true"
    />
    <div class="relative flex min-h-0 flex-1 items-center justify-center p-12">
      <img
        v-if="game.images.logo && !logoFailed"
        :src="game.images.logo"
        alt=""
        loading="lazy"
        class="size-full object-contain"
        :class="size === 'large' ? 'max-h-[120px]' : 'max-h-[64px] max-w-[220px]'"
        @error="logoFailed = true"
      />
    </div>
    <div class="relative flex w-full flex-col items-end">
      <span
        v-if="game.isPremium"
        class="flex h-[22px] w-[60px] items-center justify-center rounded-t-16 bg-badge-vip pt-2 text-text-primary shadow-bevel-button-gold"
      >
        <FontAwesomeIcon :icon="faCrown" class="text-[14px]" aria-hidden="true" />
        <span class="sr-only">尊榮遊戲</span>
      </span>
      <div
        class="flex w-full flex-col gap-4 rounded-b-4 bg-surface-glass px-16"
        :class="size === 'large' ? 'py-8' : 'py-12'"
      >
        <h3 class="truncate type-tc-title-18 text-text-body">{{ gameName(game) }}</h3>
        <p class="flex justify-between type-tc-label-14 text-text-body">
          <span class="flex items-center gap-4">
            <FontAwesomeIcon :icon="faUserGroup" class="text-[16px]" aria-hidden="true" />
            {{ formatPlayers(game.players) }}
          </span>
          <span class="flex items-center gap-4">
            <FontAwesomeIcon :icon="faClock" class="text-[16px]" aria-hidden="true" />
            {{ formatDuration(game.duration) }}
          </span>
        </p>
      </div>
    </div>
  </RouterLink>
</template>
