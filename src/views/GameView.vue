<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { gameName, getGame } from '@/api/games'
import { addRecentlyViewed } from '@/api/history'
import { useRequest } from '@/composables/useRequest'
import { useScrollSpy } from '@/composables/useScrollSpy'
import { GAME_TABLES_LIMIT } from '@/api/tables'
import ConnectionError from '@/components/ConnectionError.vue'
import SkeletonBlock from '@/components/SkeletonBlock.vue'
import GameActions from '@/components/game/GameActions.vue'
import GameGallery from '@/components/game/GameGallery.vue'
import GameHero from '@/components/game/GameHero.vue'
import GameInfo from '@/components/game/GameInfo.vue'
import GameLearn from '@/components/game/GameLearn.vue'
import GameRecommend from '@/components/game/GameRecommend.vue'
import GameSection from '@/components/game/GameSection.vue'
import GameSectionNav from '@/components/game/GameSectionNav.vue'
import GameTables from '@/components/game/GameTables.vue'
import NotFoundView from '@/views/NotFoundView.vue'

const props = defineProps({ slug: { type: String, required: true } })
const route = useRoute()

const { data: game, status, retry } = useRequest(() => getGame(props.slug))

// 進遊戲主畫面就算看過，給首頁「為你推薦」用（PRD 7.1 第 8 條）；從一款遊戲換到另一款也要記、也要重新拿資料
watch(() => props.slug, addRecentlyViewed, { immediate: true })
watch(() => props.slug, retry)

// 分頁標題換成遊戲名稱（路由先寫「遊戲」，資料回來再換）；找不到這款時和找不到頁面一樣
watch(status, (value) => {
  if (value !== 'success') return
  document.title = `${game.value ? gameName(game.value) : '找不到頁面'}｜BGA Redesign`
})

// 這款遊戲總共幾桌開放桌（GameTables 拿到資料後回報）：章節導覽的「N 桌」、標題右邊的「查看全部 N 桌」
const tablesTotal = ref(null)
watch(
  () => props.slug,
  () => (tablesTotal.value = null),
)

// 章節導覽的項目：第一項是遊戲名稱（主視覺）。沒有遊戲圖片時圖片章節和導覽項目都不顯示（PRD 7.4 第 4 條）
const navItems = computed(() => {
  if (!game.value) return []
  return [
    { id: 'overview', label: gameName(game.value) },
    { id: 'about', label: '遊戲簡介' },
    { id: 'tables', label: '開放桌', count: tablesTotal.value },
    { id: 'learn', label: '以其他方式學習遊戲' },
    { id: 'info', label: '遊戲資訊與版本更新' },
    game.value.gallery.length && { id: 'gallery', label: '遊戲圖片' },
    { id: 'recommend', label: '推薦遊戲' },
  ].filter(Boolean)
})

// 吸頂的東西有多高：章節捲過來時停在它下面，scroll spy 也用同一條線。
// 寬版只有 Header（章節導覽在左邊，不擋內容），多留 20；窄版是 Header＋按鈕列和分頁列，多留 16（和章節間距一樣）
const sticky = useTemplateRef('sticky')
const stickyOffset = ref(20)
let resizeObserver

function measure() {
  const el = sticky.value
  if (!el) return
  const narrow = getComputedStyle(el).display !== 'contents'
  stickyOffset.value = narrow ? el.offsetHeight + 16 : 20
}

watch(sticky, (el) => {
  resizeObserver?.disconnect()
  if (!el) return
  resizeObserver = new ResizeObserver(measure)
  // 量外框：寬版時吸頂區是 display: contents，自己沒有尺寸，換寬窄要靠外框變化
  resizeObserver.observe(el.parentElement)
  resizeObserver.observe(el)
  measure()
})
onBeforeUnmount(() => resizeObserver?.disconnect())

const headerHeight = () =>
  parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height'))

// 窄版吸頂區平常透明（Figma），真的吸住之後才出現和 Header 一樣的半透明底：
// 這時內容會從它下面捲過去，沒有底會從按鈕和分頁列的空隙透出來
const stuck = ref(false)
let stuckFrame = 0

function checkStuck() {
  stuckFrame = 0
  const el = sticky.value
  stuck.value =
    !!el &&
    getComputedStyle(el).display !== 'contents' &&
    el.getBoundingClientRect().top <= headerHeight() + 0.5
}

function scheduleStuck() {
  if (!stuckFrame) stuckFrame = requestAnimationFrame(checkStuck)
}

onMounted(() => window.addEventListener('scroll', scheduleStuck, { passive: true }))
onBeforeUnmount(() => {
  window.removeEventListener('scroll', scheduleStuck)
  cancelAnimationFrame(stuckFrame)
})

const { active, update: updateSpy } = useScrollSpy(
  () => navItems.value.map((item) => item.id),
  () => headerHeight() + stickyOffset.value,
)

function scrollToSection(id, behavior) {
  if (id === 'overview') {
    window.scrollTo({ top: 0, behavior })
    return
  }
  document.getElementById(id)?.scrollIntoView({ behavior, block: 'start' })
}

function select(id) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  scrollToSection(id, reduce ? 'auto' : 'smooth')
}

// 網址帶章節（例如收藏的「查看開放桌」連到 #tables，FAV-07）：資料回來、章節畫出來之後再捲過去
watch(status, async (value) => {
  if (value !== 'success' || !game.value) return
  await nextTick()
  measure()
  if (route.hash) scrollToSection(route.hash.slice(1), 'auto')
  updateSpy()
  scheduleStuck()
})
</script>

<!--
  Figma：遊戲主畫面（303:1668、平板 908:9541、平板橫向 1128:17138）。@container：裡面依內容區寬度換版面（GAME-15）。
  - 寬（1000 以上）：主視覺鋪滿，盒子和按鈕疊在右邊；下面左欄章節導覽（吸頂）、右欄章節
  - 窄：主視覺卡片；盒子、按鈕和章節分頁列包成一塊，一起吸頂（PRD 7.4 第 3 條）；下面是章節
  吸頂那一塊在寬版用 display: contents 拆開，按鈕和導覽直接放進格線，同一份 HTML 不用寫兩份。
  窄版吸頂區平常透明（Figma 的底色是隱藏的），吸住之後才出現和 Header 一樣的半透明底。
  刻意和 Figma 不同：橫向平板的左右留白 Figma 是 20，這裡和主視覺一樣 80，章節導覽才和標準字對齊；
  導覽和章節的間距桌面 80、1200 以下 32（Figma 橫向平板也是 32）。
  找不到這款遊戲時顯示找不到頁面；整頁拿不到時顯示連線錯誤（產品規則 5.3）
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
      class="flex flex-col gap-32 @max-[999px]:px-24 @max-[999px]:pt-20"
    >
      <SkeletonBlock class="h-[431px] w-full @max-[999px]:h-[367px] @max-[999px]:rounded-12" />
      <SkeletonBlock class="hidden h-[93px] w-full rounded-12 @max-[999px]:block" />
      <div class="flex gap-32 @min-[1000px]:pr-20 @min-[1000px]:pl-80 @min-[1200px]:gap-80">
        <SkeletonBlock class="h-[328px] w-[217px] shrink-0 rounded-12 @max-[999px]:hidden" />
        <SkeletonBlock class="h-[394px] flex-1 rounded-12" />
      </div>
    </div>
    <div
      v-else
      class="grid grid-cols-[auto_1fr] gap-y-32 @max-[999px]:flex @max-[999px]:flex-col @max-[999px]:gap-0"
      :style="{ '--sticky-offset': `${stickyOffset}px` }"
    >
      <GameHero
        id="overview"
        :game="game"
        class="col-[1/-1] row-start-1 @max-[999px]:mx-24 @max-[999px]:mt-20 @max-[999px]:mb-16"
      />

      <div
        ref="sticky"
        class="transition-[background-color,backdrop-filter] duration-200 @min-[1000px]:contents @max-[999px]:sticky @max-[999px]:top-(--header-height) @max-[999px]:z-20 @max-[999px]:flex @max-[999px]:flex-col @max-[999px]:gap-16 @max-[999px]:px-24 @max-[999px]:py-16 motion-reduce:transition-none"
        :class="stuck && 'bg-surface-header backdrop-blur-[4px]'"
      >
        <GameActions
          :game="game"
          class="relative z-10 col-[1/-1] row-start-1 justify-self-end @min-[1000px]:mr-20"
        />
        <GameSectionNav
          :items="navItems"
          :active="active"
          class="@min-[1000px]:sticky @min-[1000px]:top-[calc(var(--header-height)+20px)] @min-[1000px]:col-start-1 @min-[1000px]:row-start-2 @min-[1000px]:ml-80 @min-[1000px]:w-[217px] @min-[1000px]:self-start"
          @select="select"
        />
      </div>

      <div
        class="flex min-w-0 flex-col gap-32 @min-[1000px]:col-start-2 @min-[1000px]:row-start-2 @min-[1000px]:mr-20 @min-[1000px]:ml-32 @min-[1200px]:ml-80 @max-[999px]:gap-24 @max-[999px]:px-24 @max-[999px]:pt-16"
      >
        <GameSection id="about" title="遊戲簡介">
          <div class="flex flex-col gap-16 type-tc-body-16 text-text-body">
            <p v-for="(paragraph, index) in game.description.split('\n\n')" :key="index">
              {{ paragraph }}
            </p>
          </div>
        </GameSection>
        <GameSection id="tables" title="開放桌">
          <template v-if="tablesTotal > GAME_TABLES_LIMIT" #action>
            <!-- 前往尋找開放桌並帶入這款遊戲的名稱（PRD 7.4 第 4 條） -->
            <RouterLink
              :to="{ name: 'tables', query: { q: gameName(game) } }"
              class="group/link flex shrink-0 items-center gap-4 type-tc-label-14 text-text-link"
            >
              <!-- 和許願連結一樣：右邊「›」提示前往別頁，底線只畫在文字下 -->
              <span class="group-hover/link:underline">查看全部 {{ tablesTotal }} 桌</span>
              <FontAwesomeIcon :icon="faChevronRight" class="text-[12px]" aria-hidden="true" />
            </RouterLink>
          </template>
          <GameTables v-model:total="tablesTotal" :slug="game.slug" />
        </GameSection>
        <GameSection id="learn" title="以其他方式學習遊戲">
          <GameLearn :game="game" />
        </GameSection>
        <GameSection id="info" title="遊戲資訊與版本更新">
          <GameInfo :game="game" />
        </GameSection>
        <GameSection v-if="game.gallery.length" id="gallery" title="遊戲圖片">
          <GameGallery :game="game" />
        </GameSection>
        <GameSection id="recommend" :title="`喜歡 ${gameName(game)} 的玩家也喜歡…`">
          <GameRecommend :slug="game.slug" />
        </GameSection>
      </div>
    </div>
  </div>
</template>
