import { describe, it, expect } from 'vitest'
import { filterLabel, filtersFromQuery, filtersToQuery, hasFilters } from '../filters'

describe('篩選條件和網址（PRD 7.3 第 3 條）', () => {
  it('reads filters from the URL and drops unknown codes', () => {
    const filters = filtersFromQuery({ players: '2', types: 'family,nope,classic' })
    expect(filters.players).toEqual(['2'])
    expect(filters.types).toEqual(['family', 'classic'])
    expect(filters.mechanics).toEqual([])
  })

  it('keeps only one value for single-choice categories', () => {
    expect(filtersFromQuery({ complexity: 'casual,deep' }).complexity).toEqual(['casual'])
  })

  it('writes only the categories that have values', () => {
    const query = filtersToQuery({ players: ['2'], types: ['family', 'classic'], time: [] })
    expect(query.players).toBe('2')
    expect(query.types).toBe('family,classic')
    expect(query.time).toBeUndefined()
  })

  it('knows when nothing is selected', () => {
    expect(hasFilters(filtersFromQuery({}))).toBe(false)
    expect(hasFilters(filtersFromQuery({ time: 'short' }))).toBe(true)
  })

  it('labels a condition with its category', () => {
    expect(filterLabel('complexity', ['deep'])).toBe('遊戲複雜度：適合深度玩家')
    expect(filterLabel('types', ['family', 'classic'])).toBe('特定類型：家庭、經典')
  })
})
