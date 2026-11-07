import { describe, it, expect, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, onMounted, ref } from 'vue'
import { createRouter, createMemoryHistory, RouterView } from 'vue-router'
import { useRouteFocus } from '../useRouteFocus'

const WithTitle = { render: () => h('h1', '遊戲') }
const NoTitle = { render: () => h('p', '載入中') }
// 新頁自己把焦點放在 main 裡（像打字換到搜尋結果時接回搜尋框）
const FocusesInput = defineComponent({
  setup() {
    const input = ref(null)
    onMounted(() => input.value.focus())
    return () => h('div', [h('h1', '搜尋結果'), h('input', { ref: input })])
  },
})

const App = defineComponent({
  setup() {
    useRouteFocus()
    return () => [h('a', { href: '#', id: 'nav' }, '導覽'), h('main', [h(RouterView)])]
  },
})

async function setup() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: WithTitle },
      { path: '/game', component: WithTitle },
      { path: '/loading', component: NoTitle },
      { path: '/search', component: FocusesInput },
    ],
  })
  router.push('/')
  await router.isReady()
  const wrapper = mount(App, { global: { plugins: [router] }, attachTo: document.body })
  // 使用者按了 main 外面的導覽連結
  wrapper.get('#nav').element.focus()
  return { router, wrapper }
}

async function go(router, to) {
  await router.push(to)
  await flushPromises()
}

describe('useRouteFocus', () => {
  let wrapper
  afterEach(() => wrapper?.unmount())

  it('moves focus to the new page h1', async () => {
    let router
    ;({ router, wrapper } = await setup())
    await go(router, '/game')
    expect(document.activeElement.tagName).toBe('H1')
    expect(document.activeElement.getAttribute('tabindex')).toBe('-1')
  })

  it('falls back to main when there is no h1 yet', async () => {
    let router
    ;({ router, wrapper } = await setup())
    await go(router, '/loading')
    expect(document.activeElement.tagName).toBe('MAIN')
  })

  it('keeps focus the new page placed inside main', async () => {
    let router
    ;({ router, wrapper } = await setup())
    await go(router, '/search')
    expect(document.activeElement.tagName).toBe('INPUT')
  })

  it('does not move focus when only the query changes', async () => {
    let router
    ;({ router, wrapper } = await setup())
    await go(router, '/?q=catan')
    expect(document.activeElement.id).toBe('nav')
  })

  it('does not move focus on the first page load', async () => {
    ;({ wrapper } = await setup())
    await flushPromises()
    expect(document.activeElement.id).toBe('nav')
  })
})
