import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import router from '@/router'
import UserAvatar from '../UserAvatar.vue'

async function mountAvatar(props) {
  await router.push('/')
  await router.isReady()
  return mount(UserAvatar, { props, global: { plugins: [router] } })
}

describe('UserAvatar', () => {
  it('gives premium players the yellow border', async () => {
    const wrapper = await mountAvatar({ user: { name: 'sam', avatar: 'a.webp', isPremium: true } })
    expect(wrapper.find('img').classes()).toContain('border-border-accent')
  })

  it('keeps the same size without a visible border for other players', async () => {
    const wrapper = await mountAvatar({
      user: { name: 'owl', avatar: 'a.webp', isPremium: false },
      size: 20,
    })
    expect(wrapper.find('img').classes()).toContain('border-transparent')
    expect(wrapper.find('img').attributes('width')).toBe('20')
  })

  it('links to the player page (placeholder this round)', async () => {
    const wrapper = await mountAvatar({ user: { name: 'sam', avatar: 'a.webp' } })
    expect(wrapper.attributes('href')).toBe('/coming-soon')
    expect(wrapper.text()).toContain('sam 的個人頁')
  })
})
