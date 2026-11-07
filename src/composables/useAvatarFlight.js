import { onBeforeUnmount } from 'vue'

const DURATION = 300
// 和面板展開同一條曲線 cubic-bezier(0.2, 0, 0, 1) 的近似：一開始快、最後慢慢停
const ease = (t) => 1 - (1 - t) ** 3

// 頭像從 source 飛到 target（個人面板，#55）。
// 飛的是一份複製品，放在 container（面板的 dialog）最上層：不會被捲動區裁掉，也不會跟著內容淡入。
// 面板同時在變寬，target 的位置一直在動，所以每一格都重新量 target、往它靠近，最後剛好停在上面。
// 只動 transform（位移、縮放），交給 GPU；真的大頭像飛的時候藏起來，落地才出現。
export function useAvatarFlight() {
  let frame = 0
  let clone = null
  let target = null

  function stop() {
    cancelAnimationFrame(frame)
    clone?.remove()
    if (target) target.style.visibility = ''
    clone = null
    target = null
  }

  function fly(source, to, container) {
    stop()
    const from = source.getBoundingClientRect()
    target = to
    clone = to.cloneNode()
    Object.assign(clone.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      margin: '0',
      transformOrigin: 'top left',
      pointerEvents: 'none',
    })
    container.append(clone)
    to.style.visibility = 'hidden'

    const start = performance.now()
    const step = (now) => {
      const t = Math.min((now - start) / DURATION, 1)
      const e = ease(t)
      const end = target.getBoundingClientRect()
      const x = from.left + (end.left - from.left) * e
      const y = from.top + (end.top - from.top) * e
      const scale = (from.width + (end.width - from.width) * e) / end.width
      clone.style.transform = `translate(${x}px, ${y}px) scale(${scale})`
      if (t < 1) frame = requestAnimationFrame(step)
      else stop()
    }
    frame = requestAnimationFrame(step)
  }

  onBeforeUnmount(stop)
  return { fly }
}
