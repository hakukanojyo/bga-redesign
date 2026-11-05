import { describe, it, expect } from 'vitest'
import { games } from '../data/games'
import {
  findGame,
  gameName,
  homeSections,
  matchesFilters,
  matchesQuery,
  recommend,
  searchGames,
  suggestGames,
} from '../games'

const game = (slug) => games.find((item) => item.slug === slug)
const slugs = (list) => list.map((item) => item.slug)

describe('遊戲資料', () => {
  it('has 25 games with unique slugs', () => {
    expect(games).toHaveLength(25)
    expect(new Set(slugs(games)).size).toBe(25)
  })

  it('only uses option codes that exist (docs/data-model.md)', async () => {
    const { complexityLabels, typeLabels, mechanicLabels, themeLabels } =
      await import('../data/options')
    for (const item of games) {
      expect(complexityLabels).toHaveProperty(item.complexity)
      item.types.forEach((code) => expect(typeLabels).toHaveProperty(code))
      item.mechanics.forEach((code) => expect(mechanicLabels).toHaveProperty(code))
      item.themes.forEach((code) => expect(themeLabels).toHaveProperty(code))
    }
  })
})

describe('圖片', () => {
  it('finds compressed images by slug', () => {
    const kingdomino = findGame('kingdomino')
    expect(kingdomino.images.box).toBeTruthy()
    expect(kingdomino.images.banner).toBeTruthy()
  })

  // 首頁卡片是橫幅＋標準字兩層，加新遊戲時兩張都要補（npm run images）
  it('has a banner and a logo for every game', () => {
    const missing = games
      .map((item) => findGame(item.slug))
      .filter((item) => !item.images.banner || !item.images.logo)
      .map((item) => item.slug)
    expect(missing).toEqual([])
  })

  it('uses the banner color for the CTA', () => {
    expect(findGame('zombicide-2e').accentColor).toMatch(/^#[0-9a-f]{6}$/)
  })
})

describe('名稱與搜尋（PRD 7.2）', () => {
  it('shows the official Chinese name, or English when there is none', () => {
    expect(gameName(game('splendor'))).toBe('璀璨寶石')
    expect(gameName(game('sky-team'))).toBe('Sky Team')
  })

  it('finds a game by its English name or alias, not just the shown name', () => {
    expect(matchesQuery(game('splendor'), 'splendor')).toBe(true)
    expect(matchesQuery(game('werewolves'), '狼人殺')).toBe(true)
  })

  it('does not match tags', () => {
    expect(matchesQuery(game('werewolves'), '社交推理')).toBe(false)
  })
})

describe('篩選（PRD 7.3）', () => {
  it('matches players when the ranges overlap', () => {
    // 2-4 人同時符合「2 人」和「3-5 人」
    expect(matchesFilters(game('splendor'), { players: ['2'] })).toBe(true)
    expect(matchesFilters(game('splendor'), { players: ['3-5'] })).toBe(true)
    expect(matchesFilters(game('splendor'), { players: ['6-9'] })).toBe(false)
  })

  it('puts 15 minutes in 簡短 and 30 minutes in 長度適中', () => {
    expect(matchesFilters(game('kingdomino'), { time: ['short'] })).toBe(true)
    expect(matchesFilters(game('splendor'), { time: ['medium'] })).toBe(true)
    expect(matchesFilters(game('splendor'), { time: ['long'] })).toBe(false)
  })

  it('uses OR inside a category and AND between categories', () => {
    const result = searchGames(games, {
      filters: { types: ['party', 'family'], complexity: ['deep'] },
    })
    // 深度且（派對或家庭）：沒有這種遊戲
    expect(result).toEqual([])
    const either = searchGames(games, { filters: { types: ['party', 'family'] } })
    expect(either.length).toBeGreaterThan(
      searchGames(games, { filters: { types: ['party'] } }).length,
    )
  })
})

describe('排序（SRCH-05）', () => {
  it('sorts by popularity by default', () => {
    const result = searchGames(games)
    expect(result[0].playsLast30Days).toBeGreaterThanOrEqual(result[1].playsLast30Days)
  })

  it('sorts by duration from short to long', () => {
    const durations = searchGames(games, { sort: 'duration' }).map((item) => item.duration)
    expect(durations).toEqual([...durations].sort((a, b) => a - b))
  })
})

describe('首頁分區（PRD 7.1）', () => {
  it('derives 輕鬆小品 from complexity instead of a stored list', () => {
    const casual = homeSections(games, {}).find((section) => section.key === 'casual')
    expect(casual.games.every((item) => item.complexity === 'casual')).toBe(true)
  })

  it('recommends games similar to liked ones, without the liked ones', () => {
    const result = recommend(games, { favorites: ['werewolves'] })
    expect(slugs(result)).not.toContain('werewolves')
    expect(result[0].mechanics.some((code) => game('werewolves').mechanics.includes(code))).toBe(
      true,
    )
  })

  it('shows 10 cards in sorted sections and at most 10 in category sections', () => {
    const sections = homeSections(games, {})
    const size = (key) => sections.find((section) => section.key === key).games.length
    expect(['recommended', 'newest', 'popular'].map(size)).toEqual([10, 10, 10])
    ;['casual', 'classic', 'family', 'deep'].forEach((key) =>
      expect(size(key)).toBeLessThanOrEqual(10),
    )
  })

  it('falls back to popular games when there is no history', () => {
    expect(slugs(recommend(games, {}))).toEqual(slugs(searchGames(games)).slice(0, 10))
  })

  it('weighs played above viewed', () => {
    // 玩過狼人（派對）、只看過 Twilight Imperium（深度策略）：派對類要排在前面
    const result = slugs(
      recommend(games, { played: ['werewolves'], viewed: ['twilight-imperium'] }),
    )
    const party = result.findIndex((slug) => game(slug).types.includes('party'))
    const deep = result.findIndex((slug) => game(slug).complexity === 'deep')
    expect(party).toBeLessThan(deep === -1 ? Infinity : deep)
  })

  it('still recommends viewed games but never played or favorited ones', () => {
    const result = slugs(
      recommend(games, { played: ['skull'], favorites: ['catan'], viewed: ['fluxx'] }),
    )
    expect(result).not.toContain('skull')
    expect(result).not.toContain('catan')
    expect(result).toHaveLength(10)
  })
})

describe('也許你想找的是這些？（PRD 7.2 第 5 條）', () => {
  it('puts games with similar names first', () => {
    expect(slugs(suggestGames(games, '璀燦寶石'))[0]).toBe('splendor')
  })

  it('fills up to 3 with recommendations, without duplicates', () => {
    const result = suggestGames(games, '大富翁')
    expect(result).toHaveLength(3)
    expect(slugs(result)).toEqual(slugs(recommend(games, {}, 3)))
  })

  it('does not treat shared English letters as similar', () => {
    expect(slugs(suggestGames(games, 'xyz'))).toEqual(slugs(recommend(games, {}, 3)))
  })

  it('allows English typos by word length, like Algolia', () => {
    expect(slugs(suggestGames(games, 'Splendour'))[0]).toBe('splendor')
    expect(slugs(suggestGames(games, 'catn'))[0]).toBe('catan')
  })

  it('matches the start of an English word', () => {
    expect(slugs(suggestGames(games, 'werew'))[0]).toBe('werewolves')
  })

  it('counts aliases too', () => {
    expect(slugs(suggestGames(games, '狼人遊戲'))).toContain('werewolves')
  })
})
