import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GameSectionNav from '../GameSectionNav.vue'

const items = [
  { id: 'overview', label: '無盡殺戮' },
  { id: 'about', label: '遊戲簡介' },
]

describe('GameSectionNav', () => {
  it('marks the current section for screen readers', () => {
    const wrapper = mount(GameSectionNav, { props: { items, active: 'about' } })
    const links = wrapper.findAll('a')
    expect(links[0].attributes('aria-current')).toBeUndefined()
    expect(links[1].attributes('aria-current')).toBe('location')
  })

  it('links to the section and asks the page to scroll there', async () => {
    const wrapper = mount(GameSectionNav, { props: { items } })
    const link = wrapper.findAll('a')[1]
    expect(link.attributes('href')).toBe('#about')
    await link.trigger('click')
    expect(wrapper.emitted('select')).toEqual([['about']])
  })

  it('reads each label once (the bold copy only reserves width)', () => {
    const wrapper = mount(GameSectionNav, { props: { items } })
    const hidden = wrapper.findAll('[aria-hidden="true"]')
    expect(hidden).toHaveLength(items.length)
  })
})
