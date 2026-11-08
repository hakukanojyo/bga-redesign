import { fakeRequest, isUserTest, scenario } from './fake'
import { findGame } from './games'
import { leaderboard, me, myScore } from './data/people'

// 遊玩紀錄最多 8 筆，最近玩的在前（#55）
export const PLAY_HISTORY_LIMIT = 8

export function getMe() {
  const playHistory = scenario() === 'empty' || isUserTest() ? [] : me.playHistory
  return fakeRequest({
    ...me,
    playHistory: [...playHistory]
      .sort((a, b) => Date.parse(b.playedAt) - Date.parse(a.playedAt))
      .slice(0, PLAY_HISTORY_LIMIT)
      .map((item) => ({ ...item, game: findGame(item.gameSlug) }))
      .filter((item) => item.game),
  })
}

// 全站排行榜前 6 名和自己（HOME-02）
export function getLeaderboard() {
  return fakeRequest({ top: leaderboard, me: myScore })
}
