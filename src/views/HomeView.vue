<script setup>
import { computed } from 'vue'
import {
  faBrain,
  faCouch,
  faDiceFive,
  faFaceSmile,
  faFire,
  faLeaf,
  faMeteor,
} from '@fortawesome/free-solid-svg-icons'
import { getHomeSections } from '@/api/games'
import { useRequest } from '@/composables/useRequest'
import ConnectionError from '@/components/ConnectionError.vue'
import SkeletonBlock from '@/components/SkeletonBlock.vue'
import HomeHero from '@/components/home/HomeHero.vue'
import HomeLeaderboard from '@/components/home/HomeLeaderboard.vue'
import HomePromo from '@/components/home/HomePromo.vue'
import HomeSection from '@/components/home/HomeSection.vue'
import SearchSidebar from '@/components/search/SearchSidebar.vue'

// 每個分區的圖示和卡片大小（Figma 首頁）；中段橫幅放在「輕鬆小品」之後（HOME-09）
const layout = {
  recommended: { icon: faFaceSmile, size: 'large' },
  newest: { icon: faMeteor, size: 'small' },
  popular: { icon: faFire, size: 'small' },
  casual: { icon: faLeaf, size: 'large' },
  classic: { icon: faDiceFive, size: 'large' },
  family: { icon: faCouch, size: 'small' },
  deep: { icon: faBrain, size: 'small' },
}
const PROMO_AFTER = 'casual'

const { data, status, retry } = useRequest(getHomeSections)

// 分類區沒有符合的遊戲時整區不顯示（PRD 7.1 第 9 條）
const sections = computed(() => (data.value ?? []).filter((section) => section.games.length))
</script>

<!--
  Figma：首頁（625:3944，平板 857:4834）。桌面左邊 382 是快速搜尋和篩選欄（#25），右邊是內容（854 寬＋左右 20）；
  平板快速搜尋在內容上方，內容左右 24。主視覺、排行榜、中段橫幅各自拿資料、各自失敗；分區拿不到時整頁換成連線錯誤（產品規則 5.3）
-->
<template>
  <div v-if="status === 'error'" class="flex flex-1 items-center justify-center">
    <ConnectionError @retry="retry" />
  </div>
  <div v-else class="flex max-desktop:flex-col">
    <SearchSidebar />
    <div class="flex min-w-0 flex-1 flex-col gap-24 px-20 pt-20 pb-40 max-desktop:px-24">
      <h1 class="sr-only">Board Game Arena 首頁</h1>
      <div class="flex gap-12 max-desktop:gap-24">
        <HomeHero />
        <HomeLeaderboard />
      </div>

      <!-- 骨架和真的分區一樣大：標題 48 高，大卡 223×299、小卡 300×190 -->
      <template v-if="status === 'loading'">
        <template v-for="(item, key) in layout" :key="key">
          <div class="flex flex-col gap-8 overflow-hidden">
            <SkeletonBlock class="h-[48px] w-[160px] rounded-8" />
            <div class="flex gap-12 pb-12">
              <SkeletonBlock
                v-for="n in 4"
                :key="n"
                class="shrink-0 rounded-8"
                :class="item.size === 'large' ? 'h-[299px] w-[223px]' : 'h-[190px] w-[300px]'"
              />
            </div>
          </div>
          <HomePromo v-if="key === PROMO_AFTER" />
        </template>
      </template>
      <template v-else>
        <template v-for="section in sections" :key="section.key">
          <HomeSection
            :title="section.title"
            :icon="layout[section.key].icon"
            :size="layout[section.key].size"
            :games="section.games"
          />
          <HomePromo v-if="section.key === PROMO_AFTER" />
        </template>
      </template>
    </div>
  </div>
</template>
