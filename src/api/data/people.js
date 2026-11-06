// 我、排行榜、桌主：全部虛構，不對應任何真實的 BGA 帳號
// 假玩家的頭像是 Unsplash 的動物照片（design-source/avatars/CREDITS.md），8 張輪流用
import avatar from '@/assets/images/avatar-demo.jpg'

const avatarFiles = import.meta.glob('@/assets/images/avatars/*.webp', {
  eager: true,
  import: 'default',
})
const avatars = Object.keys(avatarFiles)
  .sort()
  .map((key) => avatarFiles[key])
const avatarAt = (index) => avatars[index % avatars.length]

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
// isPremium：尊榮會員，頭像有黃框（Figma 前三名都是 VIP）
export const leaderboard = [
  { rank: 1, name: 'MeepleKing', countryCode: 'FR', score: 9980000, isPremium: true },
  { rank: 2, name: 'dice_whisperer', countryCode: 'BR', score: 9800000, isPremium: true },
  { rank: 3, name: 'KanaGames', countryCode: 'JP', score: 8600000, isPremium: true },
  { rank: 4, name: 'tileTactician', countryCode: 'DE', score: 6400000, isPremium: false },
  { rank: 5, name: 'BoardNomad', countryCode: 'AT', score: 5800000, isPremium: true },
  { rank: 6, name: 'lucky7cards', countryCode: 'TW', score: 3700000, isPremium: false },
].map((entry, index) => ({ ...entry, avatar: avatarAt(index) }))

export const myScore = {
  rank: me.rank,
  name: me.name,
  countryCode: 'TW',
  score: 30,
  avatar,
  isPremium: me.isPremium,
}

// 開放桌的桌主。isPremium 是尊榮會員，頭像有黃色外框；8 人裡 3 人是（2026-11-06）
const premiumHosts = ['shuffle_sam', 'quietmeeple', 'pandaplays']
export const hosts = [
  'shuffle_sam',
  'nightowl_tw',
  'quietmeeple',
  'rollforluck',
  'cardsharkie',
  'pandaplays',
  'greenpawn',
  'oolong_gamer',
].map((name, index) => ({ name, avatar: avatarAt(index), isPremium: premiumHosts.includes(name) }))
