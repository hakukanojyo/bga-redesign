<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { gameName, getPromoGame } from '@/api/games'
import { useRequest } from '@/composables/useRequest'
import BlockError from '@/components/BlockError.vue'
import SkeletonBlock from '@/components/SkeletonBlock.vue'

const { data: game, status, retry } = useRequest(getPromoGame)
const bannerFailed = ref(false)
</script>

<!--
  首頁中段精選橫幅（HOME-09，Figma 625:4043，平板 720 寬）。Figma 是一整張圖，這裡用橫幅、封面、標準字、介紹組出來；
  整張可以點，前往遊戲頁。右半邊壓暗讓白字看得清楚（--gradient-promo-overlay）
-->
<template>
  <SkeletonBlock v-if="status === 'loading'" class="h-[276px] rounded-8" />
  <div v-else-if="status === 'error'" class="flex h-[276px] rounded-8 bg-surface-glass-faint">
    <BlockError @retry="retry" />
  </div>
  <RouterLink
    v-else-if="game"
    :to="`/game/${game.slug}`"
    class="relative block h-[276px] overflow-hidden rounded-8 bg-surface-placeholder shadow-glass-nav"
  >
    <img
      v-if="game.images.banner && !bannerFailed"
      :src="game.images.banner"
      alt=""
      class="absolute inset-0 size-full object-cover"
      @error="bannerFailed = true"
    />
    <div class="absolute inset-0 bg-(image:--gradient-promo-overlay)" />
    <div
      class="relative flex h-full items-center gap-40 px-40 max-desktop:gap-24 max-desktop:px-24"
    >
      <img
        :src="game.images.box"
        alt=""
        width="220"
        height="220"
        class="size-[220px] shrink-0 max-desktop:size-[200px]"
      />
      <div class="flex flex-col gap-12">
        <h2>
          <img
            v-if="game.images.logo"
            :src="game.images.logo"
            :alt="gameName(game)"
            class="h-[72px] w-auto"
          />
          <span v-else class="type-tc-heading-24 text-text-inverse">{{ gameName(game) }}</span>
        </h2>
        <p class="line-clamp-4 type-tc-body-13 text-text-inverse">{{ game.description }}</p>
      </div>
    </div>
  </RouterLink>
</template>
