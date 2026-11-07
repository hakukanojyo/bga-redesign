import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DeviceBanner from '../DeviceBanner.vue'

function setScreenWidth(width) {
  vi.spyOn(window.screen, 'width', 'get').mockReturnValue(width)
}

describe('DeviceBanner', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => vi.restoreAllMocks())

  it('shows on devices narrower than 768', () => {
    setScreenWidth(393)
    const wrapper = mount(DeviceBanner)
    expect(wrapper.text()).toContain('建議使用平板或電腦瀏覽本網站')
  })

  it('hides on tablets and desktops', () => {
    setScreenWidth(768)
    expect(mount(DeviceBanner).text()).toBe('')
  })

  it('closes and remembers on this device', async () => {
    setScreenWidth(393)
    const wrapper = mount(DeviceBanner)
    await wrapper.get('button[aria-label="關閉提示"]').trigger('click')
    expect(wrapper.text()).toBe('')
    expect(mount(DeviceBanner).text()).toBe('')
  })
})
