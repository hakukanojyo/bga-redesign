import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import router from '@/router'
import SideRail from '../SideRail.vue'

async function mountRail(props = {}) {
  await router.push('/')
  await router.isReady()
  return mount(SideRail, { props, global: { plugins: [router] } })
}

describe('SideRail', () => {
  it('makes every item a button that opens a panel, with no dead links', async () => {
    const wrapper = await mountRail()
    expect(wrapper.findAll('a')).toHaveLength(0)
    const labels = wrapper.findAll('li button').map((b) => b.text())
    expect(labels).toEqual(['好友', '牌桌', '我的收藏', '會員', '精靈'])
  })

  it('asks to toggle the panel when 牌桌 is clicked', async () => {
    const wrapper = await mountRail()
    const button = wrapper.findAll('button').find((b) => b.text() === '牌桌')
    await button.trigger('click')
    expect(wrapper.emitted('toggle')).toEqual([['tables']])
  })

  it('shows — while the online stats are loading or failed (LAYOUT-05)', async () => {
    const wrapper = await mountRail({ stats: null })
    expect(wrapper.text()).toContain('— / —')
  })

  it('formats the online stats with thousands separators', async () => {
    const wrapper = await mountRail({ stats: { playing: 3118, online: 18492 } })
    expect(wrapper.text()).toContain('3,118 / 18,492')
  })
})
