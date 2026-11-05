import { fakeRequest, scenario } from './fake'
import { findGame } from './games'
import { leaderboard, me, myScore } from './data/people'

export function getMe() {
  const playHistory = scenario() === 'empty' ? [] : me.playHistory
  return fakeRequest({
    ...me,
    playHistory: playHistory.map((item) => ({ ...item, game: findGame(item.gameSlug) })),
  })
}

// 全站排行榜前 6 名和自己（HOME-02）
export function getLeaderboard() {
  return fakeRequest({ top: leaderboard, me: myScore })
}
