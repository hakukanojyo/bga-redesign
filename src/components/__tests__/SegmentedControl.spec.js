import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SegmentedControl from '../SegmentedControl.vue'

const options = [
  { value: '', label: '全部' },
  { value: 'simple', label: '簡易' },
  { value: 'arena', label: '競技場' },
]

describe('SegmentedControl', () => {
  it('is a group of native radios named by its legend', () => {
    const wrapper = mount(SegmentedControl, { props: { legend: '遊戲模式', options } })
    expect(wrapper.find('legend').text()).toBe('遊戲模式：')
    const radios = wrapper.findAll('input[type=radio]')
    expect(radios).toHaveLength(3)
    expect(new Set(radios.map((radio) => radio.attributes('name'))).size).toBe(1)
  })

  it('selects 全部 by default and reports the picked value', async () => {
    const wrapper = mount(SegmentedControl, { props: { legend: '遊戲模式', options } })
    expect(wrapper.find('input:checked').element.value).toBe('')
    await wrapper.findAll('input')[2].setValue()
    expect(wrapper.emitted('update:modelValue')).toEqual([['arena']])
  })
})
