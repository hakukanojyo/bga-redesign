import { onBeforeUnmount, onMounted, ref } from 'vue'

// 章節導覽跟著捲動標出目前的章節（PRD 7.4 第 3 條）。
// 規則：頂端已經捲過「吸頂的東西下緣」的章節裡，最後一個就是目前的章節；捲到頁面最底時是最後一個
// （最後幾個章節很矮時，頂端永遠到不了那條線）。
// 用捲動事件、一個畫面最多算一次（requestAnimationFrame），不用 IntersectionObserver：
// 要的是「哪一個最靠近上緣」，捲動時直接比位置最簡單，也不會有兩個同時算進來的問題
export function useScrollSpy(getIds, getOffset) {
  const active = ref(null)
  let frame = 0

  function update() {
    frame = 0
    const ids = getIds()
    if (!ids.length) return
    const line = getOffset() + 1
    const atBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
    if (atBottom) {
      active.value = ids.at(-1)
      return
    }
    let current = ids[0]
    for (const id of ids) {
      const el = document.getElementById(id)
      if (el && el.getBoundingClientRect().top <= line) current = id
    }
    active.value = current
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(update)
  }

  onMounted(() => {
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    schedule()
  })
  onBeforeUnmount(() => {
    window.removeEventListener('scroll', schedule)
    window.removeEventListener('resize', schedule)
    cancelAnimationFrame(frame)
  })

  return { active, update: schedule }
}
