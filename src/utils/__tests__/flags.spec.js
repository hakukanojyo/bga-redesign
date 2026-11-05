import { describe, it, expect } from 'vitest'
import { hosts, leaderboard, myScore } from '@/api/data/people'
import { flagUrl } from '../flags'

describe('國旗', () => {
  it('has a flag for every country in the fake data', () => {
    const codes = [...leaderboard, myScore, ...hosts].map((p) => p.countryCode).filter(Boolean)
    codes.forEach((code) => expect(flagUrl(code)).toBeTruthy())
  })

  it('returns null for a country we did not bundle', () => {
    expect(flagUrl('ZZ')).toBeNull()
  })
})
