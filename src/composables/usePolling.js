import { onBeforeUnmount, onMounted } from 'vue'

// 每隔一段時間做一次（開放桌每 10 秒刷新，產品規則 3.1）。
// 分頁在背景時跳過，省流量；元件卸載時停掉，不會在背景一直跑
export function usePolling(task, ms) {
  let timer
  onMounted(() => {
    timer = setInterval(() => {
      if (!document.hidden) task()
    }, ms)
  })
  onBeforeUnmount(() => clearInterval(timer))
}
