import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GameInfo from '../GameInfo.vue'

const game = {
  credits: { designers: ['A', 'B'], artists: [], publisher: 'CMON', year: 2020, developer: '' },
  totalPlays: 186500,
  versions: [{ version: '1.4.2', date: '2026-10-28', notes: ['修正一', '修正二'] }],
}

describe('GameInfo', () => {
  it('hides rows without data instead of showing dashes', () => {
    const wrapper = mount(GameInfo, { props: { game } })
    expect(wrapper.findAll('dt').map((dt) => dt.text())).toEqual([
      '設計師',
      '出版商',
      '年份',
      '遊戲場數',
    ])
    expect(wrapper.text()).toContain('A, B')
    expect(wrapper.text()).toContain('186,500 場')
  })

  it('lists each version note on its own line', () => {
    const wrapper = mount(GameInfo, { props: { game } })
    expect(wrapper.find('h4').text()).toBe('版本 1.4.2（2026-10-28）')
    expect(wrapper.findAll('ol ul li').map((li) => li.text())).toEqual(['修正一', '修正二'])
  })
})
