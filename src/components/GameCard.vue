<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faClock, faCrown, faUserGroup } from '@fortawesome/free-solid-svg-icons'
import { gameName } from '@/api/games'
import { formatDuration, formatPlayers } from '@/utils/format'
import FavoriteButton from '@/components/FavoriteButton.vue'

defineProps({
  game: { type: Object, required: true },
  // large：Card/Game Cover（直的）；small：Card/Game Result（橫的）
  size: { type: String, default: 'large' },
  // 放在格線裡（搜尋結果）：寬度跟著欄寬（桌面 277、平板約 229），高度固定 175
  fluid: { type: Boolean, default: false },
})

const bannerFailed = ref(false)
const logoFailed = ref(false)
</script>

<!--
  Figma：Card/Game Cover（360:4447，223×299）、Card/Game Result（575:655，排在分區裡是 300×190，搜尋結果的格線裡固定 175 高、寬度跟著欄寬）。
  兩層圖：橫幅鋪滿（object-cover，從中間裁），標準字完整放進資訊面板上方的區域（object-contain），
  上新遊戲不用一張一張調位置；方形的標準字用最大寬高限制。標準字區域的下緣＝平常的面板高度＋VIP 標籤
  （大卡 88、小卡 96，再加外框 3），面板 hover 時往上長、蓋在標準字上面，標準字不會跟著縮。
  外框：Figma 的 Inside stroke 蓋在圖上，CSS border 畫在圖外，所以用 after 疊一層邊框。
  字級兩種卡片統一：名稱 Title 18、人數和時間 Label 14。

  整張可點（HOME-08）又有「加入收藏」按鈕：連結裡不能放按鈕，所以用 stretched link——
  連結只包名稱，用 after 撐滿整張卡；收藏按鈕 z-10 疊在上面。鍵盤焦點框畫在整張卡上。
  懸停預覽（HOME-07）：滑鼠移上或 Tab 到卡片裡時，人數時間換成介紹（大卡 6 行、小卡 2 行）和加入收藏；
  Tailwind 的 hover 只在能懸停的裝置生效，觸控裝置不浮出，改在遊戲頁收藏（SYS-04）。
  圖片是裝飾，alt 留空；沒有圖或載入失敗留灰底，尺寸不變（產品規則 5.3）
-->
<template>
  <article
    class="group/card relative isolate flex shrink-0 flex-col items-end justify-end overflow-hidden rounded-8 bg-surface-placeholder p-[3px] after:pointer-events-none after:absolute after:inset-0 after:rounded-8 after:border-3 after:border-border-on-image has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-action-primary"
    :class="
      size === 'large'
        ? 'h-[299px] w-[223px] shadow-card-cover'
        : fluid
          ? 'h-[175px] w-full'
          : 'h-[190px] w-[300px]'
    "
  >
    <img
      v-if="game.images.banner && !bannerFailed"
      :src="game.images.banner"
      alt=""
      loading="lazy"
      class="absolute inset-0 -z-10 size-full object-cover"
      @error="bannerFailed = true"
    />
    <div
      class="absolute inset-x-[3px] top-[3px] -z-10 flex items-center justify-center p-12"
      :class="size === 'large' ? 'bottom-[91px]' : 'bottom-[99px]'"
    >
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

    <span
      v-if="game.isPremium"
      class="flex h-[22px] w-[60px] items-center justify-center rounded-t-16 bg-badge-vip pt-2 text-text-primary shadow-bevel-button-gold"
    >
      <FontAwesomeIcon :icon="faCrown" class="text-[14px]" aria-hidden="true" />
      <span class="sr-only">尊榮遊戲</span>
    </span>
    <div
      class="flex w-full flex-col gap-4 rounded-b-4 bg-surface-glass px-16 group-focus-within/card:gap-8 group-hover/card:gap-8"
      :class="size === 'large' ? 'py-8' : 'py-12'"
    >
      <h3 class="truncate type-tc-title-18 text-text-body">
        <RouterLink
          :to="`/game/${game.slug}`"
          class="after:absolute after:inset-0 focus-visible:outline-none"
        >
          {{ gameName(game) }}
        </RouterLink>
      </h3>
      <p
        class="flex justify-between type-tc-label-14 text-text-body group-focus-within/card:hidden group-hover/card:hidden"
      >
        <span class="flex items-center gap-4">
          <FontAwesomeIcon :icon="faUserGroup" class="text-[16px]" aria-hidden="true" />
          {{ formatPlayers(game.players) }}
        </span>
        <span class="flex items-center gap-4">
          <FontAwesomeIcon :icon="faClock" class="text-[16px]" aria-hidden="true" />
          {{ formatDuration(game.duration) }}
        </span>
      </p>
      <!-- line-clamp 本身要用 display:-webkit-box，所以顯示、隱藏放在外層 -->
      <div class="hidden flex-col gap-8 group-focus-within/card:flex group-hover/card:flex">
        <p
          class="type-tc-body-13 text-text-body"
          :class="size === 'large' ? 'line-clamp-6' : 'line-clamp-2'"
        >
          {{ game.description }}
        </p>
        <FavoriteButton :slug="game.slug" class="z-10 self-end" />
      </div>
    </div>
  </article>
</template>
