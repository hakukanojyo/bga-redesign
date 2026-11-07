import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import RouteProgress from '../RouteProgress.vue'

const Page = { template: '<div />' }

// 換到 /slow 時，下一頁的程式要等 load() 被呼叫才「下載完成」
function setup() {
  let load
  let fail
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Page },
      { path: '/fast', component: Page },
      {
        path: '/slow',
        component: () =>
          new Promise((resolve, reject) => {
            load = () => resolve(Page)
            fail = () => reject(new Error('chunk failed'))
          }),
      },
    ],
  })
  const wrapper = mount(RouteProgress, { global: { plugins: [router] } })
  const bar = () => wrapper.find('[data-testid="route-progress"]').exists()
  return { router, bar, load: () => load(), fail: () => fail() }
}

describe('RouteProgress', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('stays hidden when the page loads within 150ms', async () => {
    const { router, bar } = setup()
    await router.push('/fast')
    await vi.advanceTimersByTimeAsync(200)
    expect(bar()).toBe(false)
  })

  it('shows after 150ms and hides when the page arrives', async () => {
    const { router, bar, load } = setup()
    const done = router.push('/slow')
    await vi.advanceTimersByTimeAsync(149)
    expect(bar()).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    expect(bar()).toBe(true)
    load()
    await done
    await vi.advanceTimersByTimeAsync(0)
    expect(bar()).toBe(false)
  })

  it('hides when the next page fails to load', async () => {
    const { router, bar, fail } = setup()
    const done = router.push('/slow').catch(() => {})
    await vi.advanceTimersByTimeAsync(150)
    expect(bar()).toBe(true)
    fail()
    await done
    await vi.advanceTimersByTimeAsync(0)
    expect(bar()).toBe(false)
  })

  it('keeps running when a newer navigation cancels the previous one', async () => {
    const { router, bar, load } = setup()
    const first = router.push('/slow')
    const second = router.push('/slow?from=second')
    await vi.advanceTimersByTimeAsync(150)
    expect(bar()).toBe(true)
    load()
    await Promise.all([first, second])
    await vi.advanceTimersByTimeAsync(0)
    expect(bar()).toBe(false)
  })

  it('ignores query-only changes', async () => {
    const { router, bar, load } = setup()
    const first = router.push('/slow')
    await vi.advanceTimersByTimeAsync(0)
    load()
    await first
    // 同一頁只改參數：就算比較慢也不出現
    const done = router.push('/slow?q=catan')
    await vi.advanceTimersByTimeAsync(200)
    expect(bar()).toBe(false)
    await done
  })
})
