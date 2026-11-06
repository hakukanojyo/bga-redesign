<script setup>
import { computed } from 'vue'
import { findGame } from '@/api/games'
import { useFavoritesStore } from '@/stores/favorites'
import AppButton from '@/components/AppButton.vue'
import ListTransition from '@/components/ListTransition.vue'
import BlockError from '@/components/BlockError.vue'
import PageState from '@/components/PageState.vue'
import SkeletonBlock from '@/components/SkeletonBlock.vue'
import FavoriteItem from '@/components/favorites/FavoriteItem.vue'
import { panelScroll } from '@/components/panelClasses'
import mascot from '@/assets/images/mascot-cool.svg'

defineProps({
  // 平板 Bottom Sheet、觸控裝置：卡片用 touch 版，排成直向 2 欄、橫向 3 欄
  touch: { type: Boolean, default: false },
})

// 收藏只存代稱（docs/data-model.md），畫面要的名稱、人數從遊戲資料查；新收藏的在最前面
const favorites = useFavoritesStore()
const games = computed(() => favorites.slugs.map(findGame).filter(Boolean))
</script>

<!--
  我的收藏（FAV-01～06）：桌面側欄一欄、卡片間隔 8；平板 Bottom Sheet 卡片最小 300 寬自動排 2／3 欄、間隔 16（產品規則 6.1）。
  在面板裡捲動，標題不動。資料在進站時已經由 AppLayout 拿過（favorites store），這裡不另外拿
-->
<template>
  <div :class="panelScroll">
    <div
      v-if="favorites.status === 'loading' || favorites.status === 'idle'"
      class="grid"
      :class="
        touch ? 'grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-16' : 'grid-cols-1 gap-8'
      "
      aria-busy="true"
    >
      <SkeletonBlock
        v-for="n in 4"
        :key="n"
        class="rounded-8"
        :class="touch ? 'h-[154px]' : 'h-[98px]'"
      />
    </div>
    <BlockError v-else-if="favorites.status === 'error'" @retry="favorites.load()" />
    <div v-else-if="!games.length" class="flex flex-1 items-center justify-center py-32">
      <PageState
        size="sm"
        :level="3"
        :image="mascot"
        title="還沒有收藏的遊戲"
        description="在遊戲頁按下「加入收藏」 常玩的遊戲就會出現在這裡"
      >
        <AppButton :to="{ name: 'home' }">探索遊戲</AppButton>
      </PageState>
    </div>
    <ListTransition
      v-else
      class="grid content-start"
      :class="
        touch ? 'grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-16' : 'grid-cols-1 gap-8'
      "
    >
      <li v-for="game in games" :key="game.slug">
        <FavoriteItem
          :game="game"
          :touch="touch"
          @remove="favorites.remove(game.slug, { undoable: true })"
        />
      </li>
    </ListTransition>
  </div>
</template>
