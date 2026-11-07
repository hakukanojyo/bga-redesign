import { describe, it, expect, vi, afterEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import router from '@/router'
import ProfilePanel from '../ProfilePanel.vue'

async function mountAt(url = '/') {
  window.history.replaceState(null, '', url)
  await router.push('/')
  await router.isReady()
  const wrapper = mount(ProfilePanel, { global: { plugins: [router] } })
  await vi.runAllTimersAsync()
  await flushPromises()
  return wrapper
}

afterEach(() => {
  vi.useRealTimers()
  window.history.replaceState(null, '', '/')
})

describe('個人面板（PROF-01～06、08、09）', () => {
  it('shows my info, status message and achievements', async () => {
    vi.useFakeTimers()
    const wrapper = await mountAt()
    const text = wrapper.text()
    expect(text).toContain('013qq')
    expect(text).toContain('尊榮會員')
    expect(text).toContain('80 / 100')
    expect(text).toContain('排行榜：第 16,832 名')
    expect(text).toContain('30 PX')
    expect(text).toContain('週末晚上常在線 歡迎找我玩卡坦島')
    expect(wrapper.findAll('[aria-labelledby="profile-achievements"] img')).toHaveLength(2)
  })

  it('lists at most 8 plays, each with 查看這場紀錄 then 建立遊戲桌', async () => {
    vi.useFakeTimers()
    const wrapper = await mountAt()
    const cards = wrapper.findAll('[aria-labelledby="profile-history"] li')
    const more = wrapper.find('[aria-labelledby="profile-history"] > div a')
    expect([more.text(), more.attributes('href')]).toEqual(['查看更多', '/coming-soon'])
    expect(cards).toHaveLength(8)
    const buttons = cards[0]
      .findAll('a')
      .map((a) => [a.text().split('：')[0], a.attributes('href')])
    expect(buttons.slice(1)).toEqual([
      ['查看這場紀錄', '/coming-soon'],
      ['建立遊戲桌', '/coming-soon'],
    ])
  })

  it('shows the empty state when there is no play history', async () => {
    vi.useFakeTimers()
    const wrapper = await mountAt('/?scenario=empty')
    expect(wrapper.text()).toContain('還沒有遊玩紀錄')
    expect(wrapper.find('[aria-labelledby="profile-history"] li').exists()).toBe(false)
  })

  it('shows a retry when loading fails', async () => {
    vi.useFakeTimers()
    const wrapper = await mountAt('/?scenario=error')
    expect(wrapper.text()).toContain('重新嘗試')
  })
})
