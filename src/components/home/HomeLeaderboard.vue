<script setup>
import { getLeaderboard } from '@/api/me'
import { useRequest } from '@/composables/useRequest'
import BlockError from '@/components/BlockError.vue'
import SkeletonBlock from '@/components/SkeletonBlock.vue'
import LeaderboardRow from '@/components/home/LeaderboardRow.vue'

const { data, status, retry } = useRequest(getLeaderboard)
</script>

<!--
  Figma：首頁排行榜（625:3981）。全站前 6 名和自己（HOME-02），只能看、不能點。
  失敗時只在藍框裡顯示錯誤（產品規則 5.3），首頁其他部分照常；載入中用和列一樣高的骨架
-->
<template>
  <section
    aria-labelledby="leaderboard-title"
    :aria-busy="status === 'loading'"
    class="flex h-[421px] w-[292px] shrink-0 flex-col overflow-hidden rounded-8 max-desktop:w-[296px]"
  >
    <div class="flex flex-1 flex-col items-center gap-12 bg-surface-brand px-8 pt-16 pb-8">
      <h2 id="leaderboard-title" class="type-tc-heading-20 text-text-inverse">排行榜</h2>
      <BlockError v-if="status === 'error'" inverse @retry="retry" />
      <ol v-else class="flex w-full flex-1 flex-col justify-between">
        <template v-if="status === 'loading'">
          <li v-for="n in 6" :key="n"><SkeletonBlock class="h-[44px] rounded-8" /></li>
        </template>
        <li v-for="entry in data?.top ?? []" v-else :key="entry.rank">
          <LeaderboardRow :entry="entry" />
        </li>
      </ol>
    </div>
    <!-- 失敗時拿掉自己那一列，藍框佔滿 -->
    <div v-if="status !== 'error'" class="bg-highlight-self px-8 py-12">
      <SkeletonBlock v-if="status === 'loading'" class="h-[44px] rounded-8" />
      <LeaderboardRow v-else-if="status === 'success'" :entry="data.me" self />
    </div>
  </section>
</template>
