import { nextTick, onBeforeUnmount } from 'vue'
import { START_LOCATION, useRouter } from 'vue-router'

// 換頁後把焦點移到新頁的 h1（還沒有 h1 時移到 main），鍵盤和螢幕閱讀器使用者才知道換頁了。
// 新頁自己把焦點放在 main 裡時不動（例如打字換到搜尋結果時接回搜尋框）；第一次開網頁、只改網址參數也不動
export function useRouteFocus() {
  const router = useRouter()

  const remove = router.afterEach((to, from, failure) => {
    if (failure || from === START_LOCATION || to.path === from.path) return
    nextTick(() => {
      const main = document.querySelector('main')
      if (!main || main.contains(document.activeElement)) return
      const target = main.querySelector('h1') || main
      // 只是讓焦點停在這裡，不是可以按的東西：不進 Tab 順序，也不畫焦點框（style.css）
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
      // 捲動交給 router 的 scrollBehavior（回到頂端、錨點、上一頁的位置）
      target.focus({ preventScroll: true })
    })
  })

  onBeforeUnmount(remove)
}
