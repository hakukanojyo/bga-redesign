<script setup>
import { watch } from 'vue'
import { gameName, getGame } from '@/api/games'
import { addRecentlyViewed } from '@/api/history'
import { useRequest } from '@/composables/useRequest'
import ConnectionError from '@/components/ConnectionError.vue'
import SkeletonBlock from '@/components/SkeletonBlock.vue'
import GameHero from '@/components/game/GameHero.vue'
import NotFoundView from '@/views/NotFoundView.vue'

const props = defineProps({ slug: { type: String, required: true } })

const { data: game, status, retry } = useRequest(() => getGame(props.slug))

// 進遊戲主畫面就算看過，給首頁「為你推薦」用（PRD 7.1 第 8 條）；從一款遊戲換到另一款也要記、也要重新拿資料
watch(() => props.slug, addRecentlyViewed, { immediate: true })
watch(() => props.slug, retry)

// 分頁標題換成遊戲名稱（路由先寫「遊戲」，資料回來再換）；找不到這款時和找不到頁面一樣
watch(status, (value) => {
  if (value !== 'success') return
  document.title = `${game.value ? gameName(game.value) : '找不到頁面'}｜BGA Redesign`
})
</script>

<!--
  Figma：遊戲主畫面（303:1668、平板 908:9541、平板橫向 1128:17138）。@container：裡面依內容區寬度換版面（GAME-15）。
  找不到這款遊戲時顯示找不到頁面；整頁拿不到時顯示連線錯誤（產品規則 5.3）。
  章節導覽和各章節在 #35 的 PR ②，開放桌在 PR ③
-->
<template>
  <div class="@container flex flex-1 flex-col pb-40">
    <div v-if="status === 'error'" class="flex flex-1 items-center justify-center">
      <ConnectionError @retry="retry" />
    </div>
    <NotFoundView v-else-if="status === 'success' && !game" />
    <!-- 骨架和真的主視覺一樣大：寬版 431 高鋪滿；窄版卡片 367 高＋按鈕列 93 高 -->
    <div
      v-else-if="status === 'loading'"
      class="flex flex-col gap-16 @max-[999px]:px-24 @max-[999px]:pt-20"
    >
      <SkeletonBlock class="h-[431px] w-full @max-[999px]:h-[367px] @max-[999px]:rounded-12" />
      <SkeletonBlock class="hidden h-[93px] w-full rounded-12 @max-[999px]:block" />
    </div>
    <GameHero v-else :game="game" />
  </div>
</template>
