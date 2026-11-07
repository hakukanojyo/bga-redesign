import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import router from '@/router'
import NotFoundView from '../NotFoundView.vue'
import PlaceholderView from '../PlaceholderView.vue'

async function mountAt(path, component) {
  await router.push(path)
  await router.isReady()
  return mount(component, { global: { plugins: [router] } })
}

describe('找不到頁面與佔位頁（產品規則 5.1）', () => {
  it('sends unknown URLs to the not-found page', async () => {
    await router.push('/no-such-page')
    expect(router.currentRoute.value.name).toBe('not-found')
  })

  it('not-found offers 回首頁 and 尋找開放桌, without showing 404', async () => {
    const wrapper = await mountAt('/no-such-page', NotFoundView)
    const links = wrapper.findAll('a').map((a) => [a.text(), a.attributes('href')])
    // 主要按鈕放右邊：次要的「尋找開放桌」在前
    expect(links).toEqual([
      ['尋找開放桌', '/tables'],
      ['回首頁', '/'],
    ])
    expect(wrapper.text()).not.toContain('404')
  })

  it('placeholder shows 這張桌子還在佈置中 with only 回首頁', async () => {
    const wrapper = await mountAt('/news', PlaceholderView)
    expect(wrapper.find('h1').text()).toBe('這張桌子還在佈置中')
    expect(wrapper.findAll('a').map((a) => a.attributes('href'))).toEqual(['/'])
  })
})
