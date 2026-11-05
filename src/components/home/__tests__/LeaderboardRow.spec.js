import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LeaderboardRow from '../LeaderboardRow.vue'

const entry = (rank) => ({ rank, name: 'Meeple', avatar: '', countryCode: 'TW', score: 1234 })

describe('排行榜的一列', () => {
  it('shows a medal for the top three, read as the rank', () => {
    const wrapper = mount(LeaderboardRow, { props: { entry: entry(1) } })
    expect(wrapper.find('img[alt="第 1 名"]').exists()).toBe(true)
  })

  it('shows the number from 4th place, and for my own row', () => {
    expect(mount(LeaderboardRow, { props: { entry: entry(4) } }).text()).toContain('4')
    const self = mount(LeaderboardRow, { props: { entry: entry(2), self: true } })
    expect(self.find('img[alt="第 2 名"]').exists()).toBe(false)
    expect(self.text()).toContain('2')
  })

  it('shows the country name and flag', () => {
    const wrapper = mount(LeaderboardRow, { props: { entry: entry(5) } })
    expect(wrapper.text()).toContain('台灣')
  })
})
