import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import router from '@/router'
import AppHeader from '../AppHeader.vue'

async function mountAt(path) {
  await router.push(path)
  await router.isReady()
  return mount(AppHeader, { global: { plugins: [router] } })
}

describe('AppHeader', () => {
  it('links the logo and main nav to their pages', async () => {
    const wrapper = await mountAt('/')
    const hrefs = wrapper.findAll('a').map((a) => a.attributes('href'))
    expect(hrefs).toEqual(expect.arrayContaining(['/', '/news', '/forum', '/tables']))
  })

  it('always shows 尋找開放桌, going to the tables page (LAYOUT-02)', async () => {
    const wrapper = await mountAt('/game/avalon')
    const cta = wrapper.findAll('a').find((a) => a.text().includes('尋找開放桌'))
    expect(cta.attributes('href')).toBe('/tables')
  })

  it('marks only the current page in the nav', async () => {
    const wrapper = await mountAt('/news')
    const active = wrapper.findAll('nav a[aria-current="page"]').map((a) => a.text())
    expect(active).toEqual(['新聞'])
  })
})
