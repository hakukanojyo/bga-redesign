import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfirmDialog from '../ConfirmDialog.vue'

const props = { title: '要退出這桌嗎？', confirmLabel: '確定退出' }

describe('ConfirmDialog', () => {
  it('treats Esc as 返回 without letting the browser close it', async () => {
    const wrapper = mount(ConfirmDialog, { props })
    const event = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true, bubbles: true })
    wrapper.find('dialog').element.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  // Chrome 在使用者還沒跟頁面互動時，Esc 會直接關掉 dialog，不經過 cancel
  it('reports 返回 when the browser closes it while still open', async () => {
    const wrapper = mount(ConfirmDialog, { props: { ...props, open: true } })
    await wrapper.find('dialog').trigger('close')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('stays quiet when it closes because open became false', async () => {
    const wrapper = mount(ConfirmDialog, { props })
    await wrapper.find('dialog').trigger('close')
    expect(wrapper.emitted('cancel')).toBeUndefined()
  })
})
