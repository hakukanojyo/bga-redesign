<script setup>
import { ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCirclePlay, faDownload } from '@fortawesome/free-solid-svg-icons'
import { formatFileSize } from '@/utils/format'
import GameCarousel from '@/components/GameCarousel.vue'

defineProps({
  game: { type: Object, required: true },
})

const bannerFailed = ref(false)
</script>

<!--
  Figma：以其他方式學習遊戲（303:2219）：Card/Rule（642:4825）、Card/Video（642:5085），各一排輪播。
  規則 PDF、影片本輪連到佔位頁、開新分頁（PRD 7.4 例外）。
  影片沒有授權的縮圖：用這款的橫幅加播放圖示（2026-11-05 決定），Figma 沒有播放圖示，刻意加上讓人看得出是影片。
  hover（Figma 的 hover 變體）：規則卡變成較不透明的玻璃底加陰影，標題和大小變 text/link；
  影片縮圖加陰影、標題變 text/link。下載圖示兩種狀態都是 icon/primary（Figma 的 icon/current 預設值）
-->
<template>
  <div class="flex flex-col gap-20">
    <div class="flex flex-col gap-12">
      <div class="flex flex-wrap items-baseline gap-8">
        <h3 class="type-tc-heading-20 text-text-primary">規則 PDF 下載專區</h3>
        <p v-if="game.rulesVersion" class="type-tc-body-16 text-text-body">
          最後核定版本：{{ game.rulesVersion }}
        </p>
      </div>
      <GameCarousel label="規則 PDF">
        <li v-for="rule in game.rules" :key="rule.title" class="snap-start">
          <a
            href="/coming-soon"
            target="_blank"
            rel="noopener"
            class="group/rule flex h-[72px] w-[284px] items-center justify-between gap-32 rounded-8 bg-surface-header px-20 hover:bg-surface-glass hover:shadow-card"
          >
            <span
              class="flex min-w-0 items-center gap-12 type-tc-title-16 text-text-body group-hover/rule:text-text-link"
            >
              <FontAwesomeIcon
                :icon="faDownload"
                class="shrink-0 text-[20px] text-icon-primary"
                aria-hidden="true"
              />
              <span class="truncate">{{ rule.title }}</span>
            </span>
            <span class="shrink-0 type-tc-label-14 text-text-body group-hover/rule:text-text-link">
              {{ formatFileSize(rule.sizeMB) }}
            </span>
            <span class="sr-only">（PDF，在新分頁開啟）</span>
          </a>
        </li>
      </GameCarousel>
    </div>

    <div class="flex flex-col gap-12">
      <h3 class="type-tc-heading-20 text-text-primary">影音教學與策略實況</h3>
      <GameCarousel label="影音教學">
        <li v-for="video in game.videos" :key="video.title" class="snap-start">
          <a
            href="/coming-soon"
            target="_blank"
            rel="noopener"
            class="group/video flex w-[351px] flex-col gap-12"
          >
            <span
              class="relative flex h-[212px] items-center justify-center overflow-hidden rounded-8 bg-surface-placeholder group-hover/video:shadow-card"
            >
              <img
                v-if="game.images.banner && !bannerFailed"
                :src="game.images.banner"
                alt=""
                class="absolute inset-0 size-full object-cover"
                @error="bannerFailed = true"
              />
              <FontAwesomeIcon
                :icon="faCirclePlay"
                class="relative text-[48px] text-icon-inverse drop-shadow-(--shadow-card-cover)"
                aria-hidden="true"
              />
            </span>
            <span class="type-tc-title-16 text-text-body group-hover/video:text-text-link">
              {{ video.title }}
            </span>
            <span class="sr-only">（影片，在新分頁開啟）</span>
          </a>
        </li>
      </GameCarousel>
    </div>
  </div>
</template>
