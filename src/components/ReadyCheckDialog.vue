<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import AppButton from '@/components/AppButton.vue'
import GameBox from '@/components/GameBox.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { gameName } from '@/api/games'
import { CONFIRM_MS } from '@/api/tables'
import { formatTableInfo } from '@/utils/format'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'

const props = defineProps({
  // 等確認的牌桌（myTables.readyCheck）；null 時關閉。accepted：我按過「進入遊戲」了
  check: { type: Object, default: null },
  // 「進入遊戲」送出中
  accepting: { type: Boolean, default: false },
})

const emit = defineEmits(['accept', 'decline'])

// 最後幾秒變紅、放大、嗶一聲
const LAST_SECONDS = 10

const dialog = ref(null)
const now = ref(Date.now())
let timer = null

const remainingMs = computed(() =>
  props.check ? Math.max(0, Date.parse(props.check.confirmBy) - now.value) : 0,
)
const seconds = computed(() => Math.ceil(remainingMs.value / 1000))
const isLastSeconds = computed(() => seconds.value <= LAST_SECONDS)
const confirmedCount = computed(
  () => props.check?.players.filter((player) => player.confirmed).length ?? 0,
)

// 嗶聲用 Web Audio 產生，不用音檔。瀏覽器規定使用者跟頁面互動過才能出聲，沒互動過就安靜，不會出錯
let audio = null
function beep() {
  try {
    audio ??= new AudioContext()
    if (audio.state === 'suspended') audio.resume()
    const start = audio.currentTime
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.15, start)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15)
    osc.connect(gain).connect(audio.destination)
    osc.start(start)
    osc.stop(start + 0.15)
  } catch {
    // 不支援就不出聲
  }
}

// 換一桌（或關掉）就重新開始：開關只看 check，和 ConfirmDialog 一樣不靠 close 事件
watch(
  () => props.check?.tableId,
  (tableId) => {
    clearInterval(timer)
    now.value = Date.now()
    if (!tableId) {
      if (dialog.value?.open) dialog.value.close()
      return
    }
    if (!dialog.value.open) dialog.value.showModal()
    timer = setInterval(() => {
      now.value = Date.now()
    }, 200)
  },
  { flush: 'post' },
)

// 時間到怎麼收尾由伺服器決定（myTables.load），這裡只負責倒數和嗶聲
watch(seconds, (value, before) => {
  if (props.check && value !== before && value > 0 && value <= LAST_SECONDS) beep()
})

onBeforeUnmount(() => {
  clearInterval(timer)
  audio?.close()
})

// Chrome 在使用者還沒跟頁面互動過時，Esc 擋不住（防止網頁綁架使用者），視窗會被關掉；還在等確認就馬上打開回來
function reopen() {
  if (props.check && !dialog.value.open) dialog.value.showModal()
}

function accept() {
  if (!props.accepting) emit('accept', props.check.tableId)
}
</script>

<!--
  Figma：Modal/Ready Check（1479:2777），state=default／last-seconds／waiting。即時制牌桌人到齊時跳出（MYTBL-13、#49），
  不管使用者在哪一頁、有沒有開面板；回合制不跳。
  原生 <dialog> 的 showModal()（docs/adr/0017）：疊在桌面側欄面板上面。
  不能用 Esc 或點遮罩關掉：一定要選「退出這桌」或「進入遊戲」，不然倒數到期視同退出。
  打開時焦點在「進入遊戲」：使用者回到座位按 Enter 就能進去。
  按「進入遊戲」後兩顆按鈕換成一樣高的「等待其他玩家確認」，視窗高度不變（不造成版面位移）。
  倒數條用 scaleX 縮、秒數用 scale 放大，都不改尺寸，不會重排版面
-->
<template>
  <dialog
    ref="dialog"
    aria-labelledby="ready-check-title"
    aria-describedby="ready-check-body"
    class="pointer-events-auto m-auto w-[440px] max-w-[calc(100vw-32px)] rounded-16 bg-surface-default p-24 shadow-card backdrop:bg-overlay-backdrop backdrop:backdrop-blur-[4px]"
    @cancel.prevent
    @keydown.esc.prevent.stop
    @close="reopen"
  >
    <div v-if="check" class="flex flex-col gap-24">
      <div class="flex flex-col gap-8">
        <div class="flex items-center gap-12">
          <div class="flex min-w-0 flex-1 flex-col gap-8">
            <h2 id="ready-check-title" class="type-tc-heading-20 text-text-primary">
              牌桌人到齊了
            </h2>
            <p id="ready-check-body" class="type-tc-body-16 text-text-secondary">
              全員確認後開始 逾時退出這桌
            </p>
          </div>
          <!--
            秒數 40、和左邊兩行同高（Figma 沒有這個文字樣式，照 Figma 的數值寫）。
            key 換掉才會每秒重播一次彈跳動畫
          -->
          <p
            :key="isLastSeconds ? seconds : 'normal'"
            role="timer"
            :aria-label="`剩下 ${seconds} 秒`"
            class="min-w-[48px] origin-right text-right type-tc-heading-20 text-[40px] leading-[56px] tabular-nums"
            :class="isLastSeconds ? 'countdown-last text-action-danger' : 'text-text-primary'"
          >
            {{ seconds }}
          </p>
        </div>
        <div class="h-[6px] overflow-hidden rounded-full bg-surface-muted">
          <div
            class="h-full origin-left transition-transform duration-200 ease-linear motion-reduce:transition-none"
            :class="isLastSeconds ? 'bg-action-danger' : 'bg-surface-brand'"
            :style="{ transform: `scaleX(${remainingMs / CONFIRM_MS})` }"
          />
        </div>
      </div>

      <div class="flex items-center gap-12">
        <GameBox :game="check.table.game" :size="56" />
        <div class="flex min-w-0 flex-col gap-4">
          <p class="type-tc-body-16 text-text-body">{{ gameName(check.table.game) }}</p>
          <p class="type-tc-body-13 text-text-body">
            <span class="sr-only">設定：</span>{{ formatTableInfo(check.table) }}
          </p>
        </div>
      </div>

      <!-- 和遊戲之間多 4（2026-11-07） -->
      <div class="mt-4 flex flex-col gap-8">
        <h3 class="type-tc-body-13 text-text-body">同桌玩家 共 {{ check.players.length }} 位</h3>
        <ul class="flex flex-wrap items-center gap-x-16 gap-y-8">
          <li v-for="player in check.players" :key="player.name" class="flex items-center gap-8">
            <span class="relative inline-flex">
              <UserAvatar :user="player" :size="28" />
              <!-- 已確認：頭像右下角打勾（Figma state=waiting） -->
              <span
                v-if="player.confirmed"
                class="pointer-events-none absolute -right-4 -bottom-4 z-10 flex size-[14px] items-center justify-center rounded-full bg-status-success text-[8px] text-text-inverse ring-[1.5px] ring-surface-default"
              >
                <FontAwesomeIcon :icon="faCheck" />
              </span>
            </span>
            <span class="type-en-body-13 text-text-body">
              {{ player.name }}<span v-if="player.confirmed" class="sr-only"> 已確認</span>
            </span>
          </li>
        </ul>
      </div>

      <!-- 按了「進入遊戲」：不能反悔，按鈕換成一樣高的狀態列 -->
      <p
        v-if="check.accepted"
        role="status"
        class="flex min-h-[58px] items-center justify-center rounded-8 bg-surface-subtle type-tc-title-16 text-text-secondary"
      >
        等待其他玩家確認 {{ confirmedCount }}/{{ check.players.length }}
      </p>
      <!-- 危險在左、主要在右，一樣寬（產品規則 7.3） -->
      <div v-else class="grid grid-cols-2 gap-12">
        <AppButton
          variant="danger"
          size="lg"
          :disabled="accepting"
          @click="emit('decline', check.tableId)"
        >
          退出這桌
        </AppButton>
        <AppButton
          size="lg"
          autofocus
          :aria-busy="accepting || undefined"
          :aria-disabled="accepting || undefined"
          @click="accept"
        >
          {{ accepting ? '進入中…' : '進入遊戲' }}
        </AppButton>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
/* 最後 10 秒：數字從 40 放大到 48（scale 1.2，不改字級，版面不跳），每秒先更大再縮回。
   減少動態效果時只變紅、不放大 */
@media (prefers-reduced-motion: no-preference) {
  .countdown-last {
    transform: scale(1.2);
    animation: countdown-pop 0.4s ease-out;
  }
}

@keyframes countdown-pop {
  from {
    transform: scale(1.45);
  }
}
</style>
