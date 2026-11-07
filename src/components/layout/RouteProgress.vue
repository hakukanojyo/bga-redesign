<!--
  換頁進度條（Figma Loading/Top Bar 1124:2698、FB-09）：畫面頂端 3px 品牌藍，一段色條從左跑到右循環，只動 transform。
  換頁超過 150ms 才出現，快的換頁不會閃一下；只改網址參數（搜尋、篩選、排序）不出現，結果區用骨架。
  開啟「減少動態效果」時色條撐滿、不移動（SYS-08）。換頁由分頁標題告知，所以螢幕閱讀器不念
-->
<script setup>
import { onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'

const DELAY = 150

const router = useRouter()
const visible = ref(false)
let timer
// 最新一次換頁的目的地：連點兩個連結時，前一次被取消的換頁會晚一點才結束，不能讓它把進度條收掉
let pending

function stop() {
  clearTimeout(timer)
  visible.value = false
}

function finish(to) {
  if (to === pending) stop()
}

const removeHooks = [
  router.beforeEach((to, from) => {
    pending = to
    if (to.path === from.path) return stop()
    if (visible.value) return
    clearTimeout(timer)
    timer = setTimeout(() => (visible.value = true), DELAY)
  }),
  // 完成、被取消、被導走都會走 afterEach；下一頁的程式下載失敗只會走 onError
  router.afterEach(finish),
  router.onError((error, to) => finish(to)),
]

onBeforeUnmount(() => {
  stop()
  removeHooks.forEach((remove) => remove())
})
</script>

<template>
  <!-- z-50 和底部導覽列同層，排在 DOM 後面所以蓋在上面 -->
  <div
    v-if="visible"
    class="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px] overflow-hidden"
    aria-hidden="true"
    data-testid="route-progress"
  >
    <div class="indicator h-full w-[240px] bg-action-primary" />
  </div>
</template>

<style scoped>
.indicator {
  transform: translateX(-100%);
  animation: run 1.4s ease-in-out infinite;
}

@keyframes run {
  to {
    transform: translateX(100vw);
  }
}

@media (prefers-reduced-motion: reduce) {
  .indicator {
    width: 100%;
    transform: none;
    animation: none;
  }
}
</style>
