import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import router from '@/router'
import AppFooter from '../AppFooter.vue'

async function mountFooter() {
  await router.push('/')
  await router.isReady()
  return mount(AppFooter, { global: { plugins: [router] } })
}

describe('AppFooter', () => {
  it('links 站內導覽 to the existing pages', async () => {
    const wrapper = await mountFooter()
    const hrefs = wrapper.findAll('nav a').map((a) => a.attributes('href'))
    expect(hrefs).toEqual(expect.arrayContaining(['/search', '/news', '/forum', '/tables']))
  })

  it('sends out-of-scope links to the placeholder page (PRD 5.3)', async () => {
    const wrapper = await mountFooter()
    const legal = wrapper.findAll('a').find((a) => a.text() === '使用條款')
    expect(legal.attributes('href')).toBe('/coming-soon')
  })

  it('shows the build version stamped at build time', async () => {
    const wrapper = await mountFooter()
    expect(wrapper.text()).toMatch(/推出時間 \d{6}-\d{4}-[0-9a-f]{7,}/)
  })

  it('hides the decorative separators from screen readers', async () => {
    const wrapper = await mountFooter()
    const dots = wrapper.findAll('span').filter((s) => s.text() === '•')
    expect(dots.length).toBe(4)
    dots.forEach((dot) => expect(dot.attributes('aria-hidden')).toBe('true'))
  })
})
