<script setup>
import ListTransition from '@/components/ListTransition.vue'
import { ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { gameName } from '@/api/games'
import { formatSeats, formatTableInfo, formatTimeAgo, formatWait } from '@/utils/format'
import AppButton from '@/components/AppButton.vue'

defineProps({
  tables: { type: Array, required: true },
  // 每一列的加入狀態：waiting、joining、joined、full（useJoinTable 的 stateOf）
  stateOf: { type: Function, required: true },
})

defineEmits(['join'])

// 盒子圖片載入失敗留灰底（產品規則 5.3）
const failed = ref(new Set())
</script>

<!--
  Figma：尋找開放桌的表頭（303:1366）和 List/Open Table Row（789:5668）。
  表頭和每一列共用同一組欄寬（--cols），才會對齊。桌面的遊戲名稱與設定固定 300 寬（設定一定很長，多的用「…」，
  要看完整的按「查看詳細設定」或滑鼠移上）；操作固定 100；中間四欄照比例分剩下的空間（2026-11-06）：
  桌主 1.4、預估等待 1.1、開桌時間 1、人數狀態 0.9，名稱＞桌主＞預估等待＞開桌時間
  - 桌面：遊戲名稱與設定｜預估等待｜人數狀態｜桌主｜開桌時間｜操作；設定 1 行，滑鼠移上浮出完整文字
  - 平板（1279 以下）：遊戲名稱與設定｜桌主｜操作；等待和人數併在設定下面，設定 2 行，不顯示開桌時間；
    整列可點（連結只包遊戲名稱、after 撐滿整列），去詳細設定（本輪佔位頁），右邊「›」提示；只留 44 高的「加入這桌」（PRD 7.5 第 4、5 條）
  表頭：「遊戲名稱與設定」多留 12；預估等待整欄（表頭和列）往右 24（2026-11-06 從 16 調到 24），和遊戲名稱拉開；「桌主」在頭像（40 寬）正上方置中；「操作」在按鈕（100 寬）正上方置中。
  只有按鈕疊在連結上面（relative z-10），按鈕旁的空白和「›」都點得到整列。
  盒子是透明背景的 PNG，灰底只在沒有圖或載入失敗時出現（產品規則 5.3），不然圖的四周會露出灰色。
  刻意和 Figma 不同：Figma 平板的「›」是隱藏的，元件說明和 PRD 都寫要有，照 PRD 顯示
-->
<template>
  <div
    class="flex flex-col gap-8 [--cols:300px_minmax(0,1.1fr)_minmax(0,0.9fr)_minmax(0,1.4fr)_minmax(0,1fr)_100px] max-desktop:[--cols:minmax(0,1fr)_170px_136px]"
  >
    <div
      class="grid grid-cols-(--cols) items-center gap-x-24 rounded-t-8 bg-surface-brand px-12 py-12 type-tc-body-16 text-text-inverse max-desktop:pr-16"
      aria-hidden="true"
    >
      <span class="pl-12">遊戲名稱與設定</span>
      <span class="pl-24 max-desktop:hidden">預估等待</span>
      <span class="max-desktop:hidden">人數狀態</span>
      <span class="w-[40px] text-center whitespace-nowrap">桌主</span>
      <span class="max-desktop:hidden">開桌時間</span>
      <span class="w-[100px] justify-self-end text-center max-desktop:justify-self-start"
        >操作</span
      >
    </div>

    <ListTransition class="flex flex-col gap-8">
      <li
        v-for="table in tables"
        :key="table.id"
        class="relative grid grid-cols-(--cols) items-center gap-x-24 rounded-8 bg-surface-header px-12 py-12 hover:bg-surface-glass hover:shadow-card max-desktop:pr-16"
      >
        <div class="flex min-w-0 items-center gap-8">
          <div
            class="size-[64px] shrink-0 rounded-4 max-desktop:size-[80px]"
            :class="(!table.game.images.box || failed.has(table.id)) && 'bg-surface-placeholder'"
            aria-hidden="true"
          >
            <img
              v-if="table.game.images.box && !failed.has(table.id)"
              :src="table.game.images.box"
              alt=""
              class="size-full object-contain"
              @error="failed.add(table.id)"
            />
          </div>
          <div class="flex min-w-0 flex-col gap-4">
            <p class="type-tc-heading-20 text-text-body">
              <a
                href="/coming-soon"
                class="hover:underline max-desktop:after:absolute max-desktop:after:inset-0 max-desktop:after:rounded-8"
              >
                {{ gameName(table.game) }}
                <span class="sr-only">（查看這桌的詳細設定）</span>
              </a>
            </p>
            <p
              class="truncate type-tc-label-14 text-text-body max-desktop:line-clamp-2 max-desktop:whitespace-normal"
              :title="formatTableInfo(table)"
            >
              <span class="sr-only">設定：</span>{{ formatTableInfo(table) }}
            </p>
            <p class="hidden type-tc-label-14 text-text-secondary max-desktop:block">
              預估等待 {{ formatWait(table.estimatedWaitMinutes) }}・{{ formatSeats(table.seats) }}
            </p>
          </div>
        </div>
        <p class="pl-24 type-tc-body-16 text-text-body max-desktop:hidden">
          <span class="sr-only">預估等待</span>{{ formatWait(table.estimatedWaitMinutes) }}
        </p>
        <p class="type-tc-body-16 text-text-body max-desktop:hidden">
          <span class="sr-only">人數</span>{{ formatSeats(table.seats) }}
        </p>
        <div class="flex min-w-0 items-center gap-12">
          <img
            :src="table.host.avatar"
            alt=""
            width="40"
            height="40"
            class="size-[40px] shrink-0 rounded-full border-2 border-border-accent bg-surface-placeholder object-cover"
          />
          <p class="truncate type-en-body-16 text-text-body">
            <span class="sr-only">桌主</span>{{ table.host.name }}
          </p>
        </div>
        <p class="type-tc-body-16 text-text-body max-desktop:hidden">
          <span class="sr-only">開桌時間</span>{{ formatTimeAgo(table.createdAt) }}
        </p>

        <div class="flex items-center gap-16 justify-self-end max-desktop:justify-self-start">
          <div class="flex w-[100px] shrink-0 flex-col gap-8">
            <AppButton
              v-if="stateOf(table) === 'full' || stateOf(table) === 'joined'"
              size="sm"
              class="relative z-10 max-desktop:px-16 max-desktop:type-tc-label-14"
              disabled
            >
              {{ stateOf(table) === 'full' ? '已額滿' : '已加入' }}
            </AppButton>
            <AppButton
              v-else
              size="sm"
              class="relative z-10 max-desktop:px-16 max-desktop:type-tc-label-14"
              :aria-busy="stateOf(table) === 'joining' || undefined"
              :aria-disabled="stateOf(table) === 'joining' || undefined"
              @click="stateOf(table) === 'waiting' && $emit('join', table)"
            >
              {{ stateOf(table) === 'joining' ? '加入中…' : '加入這桌' }}
            </AppButton>
            <AppButton
              variant="secondary"
              size="sm"
              to="/coming-soon"
              class="relative z-10 max-desktop:hidden"
            >
              查看詳細設定
            </AppButton>
          </div>
          <!-- 用外框控制顯示：Font Awesome 的 CSS 會蓋掉圖示本身的 hidden -->
          <span class="hidden max-desktop:flex" aria-hidden="true">
            <FontAwesomeIcon :icon="faChevronRight" class="text-[16px] text-icon-primary" />
          </span>
        </div>
      </li>
    </ListTransition>
  </div>
</template>
