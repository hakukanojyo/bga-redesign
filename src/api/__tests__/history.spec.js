import { describe, it, expect, beforeEach } from 'vitest'
import { addRecentlyViewed } from '../history'

const stored = () => JSON.parse(localStorage.getItem('bga:recently-viewed'))

describe('最近看過', () => {
  beforeEach(() => localStorage.clear())

  it('puts the latest first and keeps one entry per game', () => {
    addRecentlyViewed('catan')
    addRecentlyViewed('skull')
    addRecentlyViewed('catan')
    expect(stored()).toEqual(['catan', 'skull'])
  })

  it('ignores games that do not exist', () => {
    addRecentlyViewed('no-such-game')
    expect(localStorage.getItem('bga:recently-viewed')).toBeNull()
  })
})
