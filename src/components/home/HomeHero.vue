<script setup>
import { ref } from 'vue'
import { gameName, getFeaturedGame } from '@/api/games'
import { useRequest } from '@/composables/useRequest'
import BlockError from '@/components/BlockError.vue'
import SkeletonBlock from '@/components/SkeletonBlock.vue'
import PlayNowButton from '@/components/home/PlayNowButton.vue'

const { data: game, status, retry } = useRequest(getFeaturedGame)
const bannerFailed = ref(false)
</script>

<!--
  Figma：首頁主視覺（625:3980，平板 400 寬）。Figma 是一整張圖，這裡用橫幅、標準字、按鈕組出來（HOME-01）：
  文字和按鈕是真的元素，螢幕閱讀器讀得到、鍵盤 Tab 得到，換遊戲不用重新出圖。
  刻意和 Figma 不同：橫幅比主視覺寬很多，用 object-cover 裁出中間一段。
  寬度跟著畫面伸縮：右邊排行榜固定（桌面 292、平板 296），主視覺吃掉剩下的空間（Figma 1440 時 550、768 時 400）。
  標準字固定大小（桌面 300、平板 260），不跟著主視覺放大：主視覺只變寬不變高，放大會頂到上緣；太窄時不超出主視覺（max-w-full）
-->
<template>
  <section
    aria-label="精選遊戲"
    class="relative h-[421px] flex-1 overflow-hidden rounded-8"
    :class="status === 'success' && 'bg-surface-placeholder shadow-glass-nav'"
  >
    <SkeletonBlock v-if="status === 'loading'" class="size-full" />
    <BlockError
      v-else-if="status === 'error'"
      class="h-full bg-surface-glass-faint"
      @retry="retry"
    />
    <template v-else-if="game">
      <!-- 圖片載入失敗時留下灰底，尺寸不變（產品規則 5.3） -->
      <img
        v-if="game.images.banner && !bannerFailed"
        :src="game.images.banner"
        alt=""
        class="absolute inset-0 size-full object-cover"
        @error="bannerFailed = true"
      />
      <!-- 橫幅壓漸層（下黑上透明），標準字和按鈕在上層 -->
      <div aria-hidden="true" class="absolute inset-0 bg-(image:--gradient-home-hero)" />
      <div class="relative flex h-full flex-col items-center justify-end gap-16 px-24 pb-32">
        <h2>
          <img
            v-if="game.images.logo"
            :src="game.images.logo"
            :alt="gameName(game)"
            width="300"
            class="h-auto w-[300px] max-w-full max-desktop:w-[260px]"
          />
          <span v-else class="type-tc-heading-24 text-text-inverse">{{ gameName(game) }}</span>
        </h2>
        <PlayNowButton :to="`/game/${game.slug}`" :color="game.accentColor" />
      </div>
    </template>
  </section>
</template>
