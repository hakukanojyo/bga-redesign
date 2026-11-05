<script setup>
import { ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faClock, faUserGroup } from '@fortawesome/free-solid-svg-icons'
import { gameName } from '@/api/games'
import { formatDuration, formatPlayers } from '@/utils/format'
import FavoriteButton from '@/components/FavoriteButton.vue'
import GameCtaButton from '@/components/game/GameCtaButton.vue'
import GameTags from '@/components/game/GameTags.vue'

defineProps({
  game: { type: Object, required: true },
})

const failed = ref({ banner: false, logo: false, box: false })
</script>

<!--
  Figma：遊戲主畫面主視覺（桌面 303:2096、平板 908:9788＋908:9812、平板橫向 1128:17138）。
  寬窄看內容區寬度（container query，GAME-15）：1000 以上用寬版，所以橫向平板（1024）也是寬版。
  同一份 HTML 用 grid 換排法，按鈕只有一份：
  - 寬：主視覺鋪滿，盒子和兩顆按鈕疊在右邊一欄（開始遊戲在上、比較高）
  - 窄：主視覺是圓角卡片，盒子和兩顆等寬按鈕排在下面一列（學習遊戲在左、開始遊戲在右，PRD 7.4 第 2 條）
  標準字和下面的標籤列隔 32。背景是橫幅＋下方黑色漸層，白字才看得清楚；標準字、盒子是裝飾（名稱在 h1），alt 留空。
  圖片沒有或載入失敗時留灰底、尺寸不變（產品規則 5.3）
-->
<template>
  <section
    aria-label="遊戲主視覺"
    class="grid @min-[1000px]:grid-cols-[1fr_auto] @max-[999px]:gap-16 @max-[999px]:px-24 @max-[999px]:pt-20"
  >
    <div
      class="relative isolate flex flex-col gap-32 overflow-hidden bg-surface-placeholder @min-[1000px]:col-[1/-1] @min-[1000px]:row-start-1 @min-[1000px]:py-32 @min-[1000px]:pr-[296px] @min-[1000px]:pl-80 @max-[999px]:rounded-12 @max-[999px]:p-24"
    >
      <img
        v-if="game.images.banner && !failed.banner"
        :src="game.images.banner"
        alt=""
        class="absolute inset-0 -z-20 size-full object-cover"
        @error="failed.banner = true"
      />
      <div class="absolute inset-0 -z-10 bg-(image:--gradient-game-hero)" aria-hidden="true" />

      <div class="h-[256px] w-[542px] max-w-full @max-[999px]:h-[189px] @max-[999px]:w-[400px]">
        <img
          v-if="game.images.logo && !failed.logo"
          :src="game.images.logo"
          alt=""
          class="size-full object-contain object-left-bottom"
          @error="failed.logo = true"
        />
      </div>

      <!--
        標籤列在名稱上方，有皇冠時皇冠排第一個（在 GameTags 裡，換行時也是第一個）。
        名稱、人數時間、加入收藏同一行：名稱和人數的間距跟人數和時間一樣是 12，加入收藏隔 32；
        窄版加入收藏推到最右邊（卡片右下角）
      -->
      <div class="flex flex-col items-start gap-8">
        <GameTags :game="game" />
        <div
          class="grid grid-cols-[repeat(2,auto)] items-center justify-start gap-x-32 @max-[999px]:grid-cols-[auto_1fr] @max-[999px]:self-stretch"
        >
          <div class="flex items-center gap-12">
            <h1 class="type-tc-heading-24 text-text-inverse">
              {{ gameName(game) }}
            </h1>
            <p class="flex items-center gap-12 type-tc-heading-20 text-text-inverse">
              <span class="flex items-center gap-4">
                <FontAwesomeIcon :icon="faUserGroup" class="text-[20px]" aria-hidden="true" />
                {{ formatPlayers(game.players) }}
              </span>
              <span class="flex items-center gap-4">
                <FontAwesomeIcon :icon="faClock" class="text-[18px]" aria-hidden="true" />
                {{ formatDuration(game.duration) }}
              </span>
            </p>
          </div>
          <FavoriteButton
            :slug="game.slug"
            class="justify-self-start @max-[999px]:justify-self-end"
          />
        </div>
      </div>
    </div>

    <div
      class="relative z-10 flex items-center gap-32 @min-[1000px]:col-start-2 @min-[1000px]:row-start-1 @min-[1000px]:mr-20 @min-[1000px]:w-[256px] @min-[1000px]:flex-col @min-[1000px]:justify-end @min-[1000px]:py-32"
    >
      <div
        class="h-[194px] w-[208px] shrink-0 @max-[999px]:h-[93px] @max-[999px]:w-[99px]"
        aria-hidden="true"
      >
        <img
          v-if="game.images.box && !failed.box"
          :src="game.images.box"
          alt=""
          class="size-full object-contain"
          @error="failed.box = true"
        />
      </div>
      <!-- 寬：開始遊戲在上；窄：row-reverse 讓學習遊戲在左。Tab 順序都是開始遊戲先（主要動作） -->
      <div class="flex w-full flex-col gap-12 @max-[999px]:flex-1 @max-[999px]:flex-row-reverse">
        <GameCtaButton
          type="start"
          to="/coming-soon"
          class="h-[81px] @max-[999px]:h-[93px] @max-[999px]:flex-1"
        />
        <GameCtaButton
          type="learn"
          size="md"
          to="/coming-soon"
          class="@max-[999px]:h-[93px] @max-[999px]:flex-1 @max-[999px]:type-tc-heading-20"
        />
      </div>
    </div>
  </section>
</template>
