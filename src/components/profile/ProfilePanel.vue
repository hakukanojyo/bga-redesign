<script setup>
import { computed, inject, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useMediaQuery } from '@vueuse/core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faChevronRight, faCrown, faPen } from '@fortawesome/free-solid-svg-icons'
import { getMe } from '@/api/me'
import { useAvatarFlight } from '@/composables/useAvatarFlight'
import { useRequest } from '@/composables/useRequest'
import { formatRank, formatScore } from '@/utils/format'
import AppButton from '@/components/AppButton.vue'
import BlockError from '@/components/BlockError.vue'
import PageState from '@/components/PageState.vue'
import SkeletonBlock from '@/components/SkeletonBlock.vue'
import PlayHistoryItem from '@/components/profile/PlayHistoryItem.vue'
import { panelScroll } from '@/components/panelClasses'
import mascot from '@/assets/images/mascot-cool.svg'

defineProps({
  // 平板、觸控裝置：遊玩紀錄卡片用 touch 版，排成直向 2 欄、橫向 3 欄（平板個人面板寬 375，實際是 1 欄）
  touch: { type: Boolean, default: false },
})

// 只有這個面板用，不放 Pinia（CLAUDE.md：只有一頁用的放元件裡）；每次打開面板重拿
const { data: me, status, retry } = useRequest(getMe)

// 頭像從圖示列飛過來：桌面側欄 provide 小頭像（平板沒有，就不飛）。
// 面板一打開就飛，不等資料：頭像先用小頭像的圖，名稱、信譽這些才等資料（骨架）
const profileAvatar = inject('profileAvatar', null)
const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
const bigAvatar = ref(null)
const avatarSrc = computed(() => me.value?.avatar ?? profileAvatar?.source.value?.src)
const { fly } = useAvatarFlight()

onMounted(() => {
  const source = profileAvatar?.source.value
  if (!source || !bigAvatar.value) return
  profileAvatar.hidden.value = true
  if (!reduceMotion.value) fly(source, bigAvatar.value, profileAvatar.container.value)
})

// 換到別的面板或關掉：小頭像回來
onUnmounted(() => {
  if (profileAvatar) profileAvatar.hidden.value = false
})
</script>

<!--
  個人面板（PROF-01～06、08、09，#55）。Figma：Layout/Side Panel panel=個人（685:3928）、個人-tablet（993:1769）、個人-空。
  - 「編輯個人檔案」「查看更多」「查看這場紀錄」「建立遊戲桌」本輪都是佔位頁；狀態訊息只顯示，要改從編輯個人檔案進（一個入口一個去處）
  - 成就只顯示（PROF-04）
  - 遊玩紀錄最多 8 筆，最近的在前（getMe 排好），「查看更多」看全部；整個面板一起捲動，個人資訊不固定
  - 桌面：打開時圖示列的小頭像飛到大頭像的位置（useAvatarFlight）；頭像和「編輯個人檔案」不等資料，位置一開始就固定
  - 刻意和 Figma 不同：Figma 頭像框、皇冠底、信譽條綁 Primitive（gold/300、blue/500、white-a73），這裡用同值的 Semantic
    （border/accent、badge/vip、surface/brand、surface/glass-card）
-->
<template>
  <div :class="panelScroll">
    <div class="flex flex-col gap-24">
      <!-- 個人資訊：頭像和「編輯個人檔案」不等資料（頭像要馬上飛），其他等資料時是骨架 -->
      <div class="flex flex-col gap-8">
        <RouterLink
          to="/coming-soon"
          class="group/link flex items-center gap-4 self-end px-4 type-tc-label-14 text-text-link"
        >
          <FontAwesomeIcon :icon="faPen" class="text-[14px]" aria-hidden="true" />
          <span class="group-hover/link:underline">編輯個人檔案</span>
        </RouterLink>
        <div class="flex items-center gap-12">
          <img
            v-if="avatarSrc"
            ref="bigAvatar"
            :src="avatarSrc"
            alt=""
            width="84"
            height="84"
            class="size-[84px] shrink-0 rounded-full border-3 object-cover"
            :class="me?.isPremium === false ? 'border-transparent' : 'border-border-accent'"
          />
          <SkeletonBlock v-else class="size-[84px] shrink-0 rounded-full" />
          <div v-if="status === 'loading'" class="flex flex-1 flex-col gap-8" aria-busy="true">
            <SkeletonBlock class="h-[28px] w-1/2 rounded-4" />
            <SkeletonBlock class="h-[16px] rounded-4" />
            <SkeletonBlock class="h-[16px] rounded-4" />
          </div>
          <div v-else-if="status === 'success'" class="flex min-w-0 flex-1 flex-col gap-12">
            <p class="flex items-center gap-8">
              <span
                v-if="me.isPremium"
                class="flex size-[28px] shrink-0 items-center justify-center rounded-full bg-badge-vip text-text-primary"
              >
                <FontAwesomeIcon :icon="faCrown" class="text-[14px]" aria-hidden="true" />
                <span class="sr-only">尊榮會員</span>
              </span>
              <span class="truncate type-en-heading-20 text-text-primary">{{ me.name }}</span>
            </p>
            <div class="flex flex-col gap-4">
              <p class="flex items-center gap-4 type-tc-body-13 text-text-body">
                信譽：
                <span class="h-[16px] flex-1 bg-surface-glass-card">
                  <span
                    class="flex h-full items-center bg-surface-brand pl-8 type-en-caption-11 whitespace-nowrap text-text-inverse"
                    :style="{ width: `${me.reputation}%` }"
                  >
                    {{ me.reputation }} / 100
                  </span>
                </span>
              </p>
              <p class="flex items-center justify-between gap-12 text-text-body">
                <span class="type-tc-body-13">排行榜：{{ formatRank(me.rank) }}</span>
                <span class="type-en-body-13">
                  <span class="sr-only">經驗值</span>{{ formatScore(me.score) }}
                </span>
              </p>
            </div>
          </div>
        </div>
        <!-- 狀態訊息：對話框尖角指向頭像（PROF-03，只顯示） -->
        <SkeletonBlock v-if="status === 'loading'" class="mt-8 h-[34px] rounded-16" />
        <p
          v-else-if="status === 'success'"
          class="relative mt-8 rounded-16 bg-surface-default px-12 py-8 type-tc-caption-12 text-text-body before:absolute before:-top-4 before:left-32 before:size-[12px] before:rotate-45 before:bg-surface-default"
        >
          <span class="sr-only">狀態訊息：</span>{{ me.statusMessage }}
        </p>
      </div>

      <template v-if="status === 'loading'">
        <SkeletonBlock
          v-for="n in 3"
          :key="n"
          class="rounded-8"
          :class="touch ? 'h-[154px]' : 'h-[98px]'"
        />
      </template>
      <BlockError v-else-if="status === 'error'" @retry="retry" />
      <template v-else>
        <!-- 我的成就 -->
        <section class="flex flex-col gap-8" aria-labelledby="profile-achievements">
          <div class="flex items-center justify-between gap-8">
            <h3 id="profile-achievements" class="type-tc-body-16 text-text-primary">我的成就</h3>
            <RouterLink
              to="/coming-soon"
              class="group/link flex items-center gap-4 type-tc-caption-12 text-text-link"
            >
              <span class="group-hover/link:underline">查看更多</span>
              <FontAwesomeIcon :icon="faChevronRight" class="text-[10px]" aria-hidden="true" />
            </RouterLink>
          </div>
          <ul class="flex">
            <li v-for="achievement in me.achievements" :key="achievement.id">
              <img
                :src="achievement.image"
                :alt="achievement.name"
                width="60"
                height="60"
                class="size-[60px]"
              />
            </li>
          </ul>
        </section>

        <!-- 遊玩紀錄 -->
        <section class="flex flex-col gap-8" aria-labelledby="profile-history">
          <div class="flex items-center justify-between gap-8">
            <h3 id="profile-history" class="type-tc-body-16 text-text-primary">遊玩紀錄</h3>
            <!-- 面板只放最近 8 場，完整紀錄在「查看更多」（本輪佔位頁，和成就一樣） -->
            <RouterLink
              v-if="me.playHistory.length"
              to="/coming-soon"
              class="group/link flex items-center gap-4 type-tc-caption-12 text-text-link"
            >
              <span class="group-hover/link:underline">查看更多</span>
              <FontAwesomeIcon :icon="faChevronRight" class="text-[10px]" aria-hidden="true" />
            </RouterLink>
          </div>
          <div v-if="!me.playHistory.length" class="flex justify-center py-32">
            <PageState
              size="sm"
              :level="4"
              :image="mascot"
              title="還沒有遊玩紀錄"
              description="玩完第一場遊戲後 紀錄就會出現在這裡"
            >
              <AppButton :to="{ name: 'home' }">探索遊戲</AppButton>
            </PageState>
          </div>
          <ul
            v-else
            class="grid"
            :class="
              touch ? 'grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-16' : 'grid-cols-1 gap-8'
            "
          >
            <li v-for="record in me.playHistory" :key="record.playedAt">
              <PlayHistoryItem :game="record.game" :touch="touch" />
            </li>
          </ul>
        </section>
      </template>
    </div>
  </div>
</template>
