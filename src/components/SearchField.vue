<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons'

const props = defineProps({
  // 目前生效的搜尋字（通常在網址裡）
  query: { type: String, default: '' },
  // 螢幕閱讀器讀的名稱
  label: { type: String, default: '搜尋遊戲' },
})

const emit = defineEmits(['search'])

const text = ref(props.query)
const input = ref(null)

// 外面的搜尋字變了（清除搜尋條件、上一頁）就跟著換；正在打字時不換，免得蓋掉剛打的字
watch(
  () => props.query,
  (q) => {
    if (document.activeElement !== input.value) text.value = q
  },
)

function submit() {
  clearTimeout(timer)
  const q = text.value.trim()
  if (q !== props.query) emit('search', q)
}

// 停止打字 0.3 秒才搜；注音、倉頡選字（composition）時不算打字，選完字才開始計時（SRCH-01）
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

onBeforeUnmount(() => clearTimeout(timer))

defineExpose({
  focus() {
    input.value.focus()
    input.value.setSelectionRange(text.value.length, text.value.length)
  },
  isFocused: () => document.activeElement === input.value,
})
</script>

<!--
  Figma：Form/Search Input（600:12454）。輸入中外框變藍（SRCH-02）；有文字時出現清除按鈕。
  只管輸入：搜尋之後要做什麼（換頁、改網址）由外面決定。首頁、搜尋結果用 SearchInput，尋找開放桌的進階搜尋直接用這個。
  用 role="search" 的表單包起來，螢幕閱讀器能直接跳到這裡；按 Enter 由 keydown 處理，不送出表單
-->
<template>
  <form role="search" @submit.prevent>
    <label
      class="flex items-center gap-4 rounded-4 bg-surface-glass p-8 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-action-primary"
    >
      <span class="sr-only">{{ label }}</span>
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
