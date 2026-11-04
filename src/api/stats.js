import { fakeRequest } from './fake'

// 對戰中／上線人數（LAYOUT-05）
export function getOnlineStats() {
  return fakeRequest({ playing: 3118, online: 18492 })
}
