<script setup>
import { RouterLink } from 'vue-router'
import { ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faChevronRight,
  faClock,
  faMagnifyingGlass,
  faPlus,
  faUserGroup,
} from '@fortawesome/free-solid-svg-icons'
import { gameName } from '@/api/games'
import { formatDuration, formatPlayers } from '@/utils/format'
import AppButton from '@/components/AppButton.vue'

defineProps({
  game: { type: Object, required: true },
  // 觸控裝置和平板 Bottom Sheet：按鈕常駐在卡片底部（產品規則 6.2）；滑鼠裝置的桌面側欄：懸停才出現
  touch: { type: Boolean, default: false },
})

defineEmits(['remove'])

const boxFailed = ref(false)
</script>

<!--
  Figma：List/Favorite Item（574:2837）size=desktop state=default／hover、size=touch。
  整張可點（FAV-04）又有按鈕：stretched link，連結只包名稱、用 after 撐滿整張卡，按鈕 relative z-10 疊在上面；
  懸停時的按鈕列蓋在人數時間那一行上（Figma 是 top 54 高 44 的半透明條；2026-11-06 從 35% 調成 surface/header 73%，下面那一行同時藏起來）。
  懸停時卡片底色不變、只加陰影；按鈕列從卡片底部滑上來、人數時間同時淡出，200ms（2026-11-06）。
  只動 translate 和 opacity（產品規則 6.4），卡片 overflow-hidden 裁掉還沒滑進來的部分；按鈕列藏著時是 invisible，Tab 不會停在看不到的按鈕上，
  visibility 也跟著過場：出現時一開始就能按，消失時滑完才藏。減少動態效果時直接出現。
  按鈕列左右兩組至少隔 20，字型寬一點的電腦也不會黏在一起；按鈕列本身不擋點擊，空白處點到的還是整張卡。
  卡片和「查看開放桌」都到遊戲頁的開放桌章節（/game/:slug#tables）；「建立遊戲桌」本輪是佔位頁（FAV-03）。
  盒子圖是裝飾，alt 留空；沒有圖或載入失敗留灰底（產品規則 5.3）
-->
<template>
  <article
    class="group/fav relative rounded-8 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-action-primary"
    :class="
      touch
        ? 'flex flex-col overflow-hidden shadow-card'
        : 'overflow-hidden bg-surface-header hover:shadow-card focus-within:shadow-card'
    "
  >
    <div class="flex items-center gap-12 p-12" :class="touch && 'bg-surface-header pb-8'">
      <div
        class="size-[74px] shrink-0 rounded-4"
        :class="(!game.images.box || boxFailed) && 'bg-surface-placeholder'"
        aria-hidden="true"
      >
        <img
          v-if="game.images.box && !boxFailed"
          :src="game.images.box"
          alt=""
          width="74"
          height="74"
          loading="lazy"
          class="size-full object-contain"
          @error="boxFailed = true"
        />
      </div>
      <div class="flex min-w-0 flex-1 flex-col gap-20">
        <div class="flex items-center justify-between gap-8">
          <h3 class="truncate type-tc-body-16 text-text-body">
            <RouterLink
              :to="`/game/${game.slug}#tables`"
              class="after:absolute after:inset-0 focus-visible:outline-none"
            >
              {{ gameName(game) }}
            </RouterLink>
          </h3>
          <!-- Font Awesome 的 CSS 會蓋掉圖示上的 hidden，包一層控制顯示 -->
          <span
            class="text-selection-accent"
            :class="!touch && 'hidden group-focus-within/fav:block group-hover/fav:block'"
            aria-hidden="true"
          >
            <FontAwesomeIcon :icon="faChevronRight" class="text-[14px]" />
          </span>
        </div>
        <!-- 懸停時按鈕列滑上來蓋住這一行，這一行同時淡出（位置保留，版面不跳），字才不會從按鈕後面透出來 -->
        <p
          class="flex justify-between text-text-body"
          :class="
            !touch &&
            'transition-opacity duration-200 ease-[cubic-bezier(0.2,0,0,1)] group-focus-within/fav:opacity-0 group-hover/fav:opacity-0 motion-reduce:transition-none'
          "
        >
          <span class="flex items-center gap-4 type-en-body-13">
            <FontAwesomeIcon :icon="faUserGroup" class="text-[14px]" aria-hidden="true" />
            {{ formatPlayers(game.players) }}
          </span>
          <span class="flex items-center gap-4 type-tc-body-13">
            <FontAwesomeIcon :icon="faClock" class="text-[14px]" aria-hidden="true" />
            {{ formatDuration(game.duration) }}
          </span>
        </p>
      </div>
    </div>

    <div
      class="pointer-events-none flex items-center justify-between gap-20 px-12 py-8"
      :class="
        !touch &&
        'invisible absolute inset-x-0 top-[54px] h-[44px] translate-y-full bg-surface-header transition-[translate,visibility] duration-200 ease-[cubic-bezier(0.2,0,0,1)] group-focus-within/fav:visible group-focus-within/fav:translate-y-0 group-hover/fav:visible group-hover/fav:translate-y-0 motion-reduce:transition-none'
      "
    >
      <div class="flex gap-8">
        <AppButton size="sm" to="/coming-soon" class="pointer-events-auto relative z-10">
          <FontAwesomeIcon :icon="faPlus" class="text-[12px]" aria-hidden="true" />
          建立遊戲桌
        </AppButton>
        <AppButton
          variant="secondary"
          size="sm"
          :to="`/game/${game.slug}#tables`"
          class="pointer-events-auto relative z-10"
        >
          <FontAwesomeIcon :icon="faMagnifyingGlass" class="text-[12px]" aria-hidden="true" />
          查看開放桌
        </AppButton>
      </div>
      <!-- 沒有底色的文字按鈕：hover 加底線，和文字連結一樣（2026-11-06） -->
      <button
        type="button"
        class="pointer-events-auto relative z-10 min-h-(--tap-button-min-height) shrink-0 px-4 whitespace-nowrap type-tc-label-14 text-action-danger hover:underline active:text-action-danger-pressed"
        @click="$emit('remove')"
      >
        取消收藏<span class="sr-only">：{{ gameName(game) }}</span>
      </button>
    </div>
  </article>
</template>
