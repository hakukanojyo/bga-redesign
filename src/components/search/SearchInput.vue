<script>
// 從首頁打字換到搜尋結果頁時，搜尋框是新的一個；記下來讓新的接回焦點，使用者可以繼續打字
let keepFocus = false
</script>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons'

const route = useRoute()
const router = useRouter()

const text = ref(route.query.q ?? '')
const input = ref(null)

// 網址的搜尋字變了（清除搜尋條件、上一頁）就跟著換；正在打字時不換，免得蓋掉剛打的字
watch(
  () => route.query.q,
  (q) => {
    if (document.activeElement !== input.value) text.value = q ?? ''
  },
)

// 送出搜尋（PRD 7.2 第 1 條）：從別頁進搜尋結果是 push（按上一頁回得去）；
// 已經在搜尋結果頁就 replace，邊打字邊更新網址也不會多出一堆瀏覽紀錄。
// 假資料的 ?scenario= 一起帶著，展示載入中、失敗時才不會換頁就不見
function submit() {
  clearTimeout(timer)
  const q = text.value.trim()
  if (route.name === 'search') {
    if (q === (route.query.q ?? '')) return
    router.replace({ query: { ...route.query, q: q || undefined } })
  } else if (q) {
    keepFocus = document.activeElement === input.value
    router.push({ name: 'search', query: { q, scenario: route.query.scenario } })
  }
}

// 停止打字 0.3 秒才搜；注音、倉頡選字（composition）時不算打字，選完字才開始計時
let timer
// Safari 選字時按 Enter，isComposing 是 false、keyCode 是 229
const composing = (event) => event.isComposing || event.keyCode === 229

function onInput(event) {
  if (composing(event)) return
  clearTimeout(timer)
  timer = setTimeout(submit, 300)
}

function onEnter(event) {
  if (composing(event)) return
  submit()
}

function clear() {
  text.value = ''
  submit()
  input.value.focus()
}

onMounted(() => {
  if (!keepFocus) return
  keepFocus = false
  input.value.focus()
  input.value.setSelectionRange(text.value.length, text.value.length)
})

onBeforeUnmount(() => clearTimeout(timer))
</script>

<!--
  Figma：Form/Search Input（600:12454）。輸入中外框變藍（SRCH-02）；有文字時出現清除按鈕。
  用 role="search" 的表單包起來，螢幕閱讀器能直接跳到這裡；按 Enter 由 keydown 處理，不送出表單
-->
<template>
  <form role="search" @submit.prevent>
    <label
      class="flex items-center gap-4 rounded-4 bg-surface-glass p-8 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-action-primary"
    >
      <span class="sr-only">搜尋遊戲</span>
      <FontAwesomeIcon
        :icon="faMagnifyingGlass"
        class="w-[20px] text-[12px] text-icon-placeholder"
        aria-hidden="true"
      />
      <input
        ref="input"
        v-model="text"
        type="search"
        placeholder="輸入遊戲名稱 / 關鍵字"
        enterkeyhint="search"
        class="min-w-0 flex-1 bg-transparent type-tc-caption-12 text-text-body caret-action-primary outline-none placeholder:text-text-placeholder [&::-webkit-search-cancel-button]:hidden"
        @input="onInput"
        @compositionend="onInput"
        @keydown.enter.prevent="onEnter"
      />
      <button
        v-if="text"
        type="button"
        class="flex size-[18px] items-center justify-center text-text-primary"
        @click="clear"
      >
        <FontAwesomeIcon :icon="faXmark" class="text-[14px]" aria-hidden="true" />
        <span class="sr-only">清除搜尋文字</span>
      </button>
    </label>
  </form>
</template>
