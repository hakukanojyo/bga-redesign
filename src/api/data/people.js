// 我、排行榜、桌主：全部虛構，不對應任何真實的 BGA 帳號
import avatar from '@/assets/images/avatar-demo.jpg'

export const me = {
  name: '013qq',
  avatar,
  isPremium: true,
  reputation: 80,
  rank: 16832,
  statusMessage: '',
  playHistory: [
    { gameSlug: 'werewolves', playedAt: '2026-11-04T21:40:00+08:00' },
    { gameSlug: 'splendor', playedAt: '2026-11-03T20:15:00+08:00' },
    { gameSlug: 'kingdomino', playedAt: '2026-11-01T14:05:00+08:00' },
  ],
}

// 全站排行榜前 6 名；自己的名次在 me.rank
export const leaderboard = [
  { rank: 1, name: 'MeepleKing', countryCode: 'FR', score: 9980000 },
  { rank: 2, name: 'dice_whisperer', countryCode: 'BR', score: 9800000 },
  { rank: 3, name: 'KanaGames', countryCode: 'JP', score: 8600000 },
  { rank: 4, name: 'tileTactician', countryCode: 'DE', score: 6400000 },
  { rank: 5, name: 'BoardNomad', countryCode: 'AT', score: 5800000 },
  { rank: 6, name: 'lucky7cards', countryCode: 'TW', score: 3700000 },
].map((entry) => ({ ...entry, avatar }))

export const myScore = { rank: me.rank, name: me.name, countryCode: 'TW', score: 30, avatar }

// 開放桌的桌主
export const hosts = [
  'shuffle_sam',
  'nightowl_tw',
  'quietmeeple',
  'rollforluck',
  'cardsharkie',
  'pandaplays',
  'greenpawn',
  'oolong_gamer',
].map((name) => ({ name, avatar }))
