<script setup>
import { ref } from 'vue'
import closeIcon from '@/assets/icons/close-lg.svg'

// 關閉後在這台裝置永久記住（產品規則 4.3、FB-06）
const STORAGE_KEY = 'bga-device-banner-dismissed'

function wasDismissed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

// 和 index.html 縮放的判斷一樣：看裝置寬度，不看縮放後的畫面寬度
const visible = ref(window.screen.width < 768 && !wasDismissed())

function dismiss() {
  visible.value = false
  try {
    localStorage.setItem(STORAGE_KEY, '1')
  } catch {
    // 私密模式可能不能存，這次關掉就好
  }
}
</script>

<template>
  <div
    v-if="visible"
    role="status"
    class="flex items-center justify-center gap-12 bg-surface-brand-subtle px-24 py-16"
  >
    <!-- Banner size=lg 專用：縮放約 0.51 倍後約 15px／20px，只用在這裡，不進 token -->
    <p
      class="flex-1 text-center font-cjk text-[30px]/[40px] font-(--weight-bold) tracking-(--tracking-wide) text-text-primary"
    >
      建議使用平板或電腦瀏覽本網站<br />以獲得最佳遊戲體驗
    </p>
    <button type="button" class="shrink-0" aria-label="關閉提示" @click="dismiss">
      <img :src="closeIcon" alt="" width="32" height="32" />
    </button>
  </div>
</template>
