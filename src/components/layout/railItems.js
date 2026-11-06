import { faCrown, faGamepad, faHeart, faUserGroup } from '@fortawesome/free-solid-svg-icons'
import elfIcon from '@/assets/icons/elf.svg'

// 右側欄和底部導覽列共用的項目，每個都打開側欄面板；還沒有內容的面板先放佔位文字
export const railItems = [
  { label: '好友', icon: faUserGroup, color: '--color-rail-friends', panel: 'friends' },
  { label: '牌桌', icon: faGamepad, color: '--color-rail-table', panel: 'tables' },
  { label: '我的收藏', icon: faHeart, color: '--color-rail-favorite', panel: 'favorites' },
  { label: '會員', icon: faCrown, color: '--color-rail-member', panel: 'membership' },
  { label: '精靈', image: elfIcon, color: '--color-rail-elf', panel: 'elf' },
]

// 面板標題用全名（產品規則 6.6 用詞統一）；側欄和導覽列空間小，項目名稱縮成「牌桌」
export const panelTitles = {
  profile: '個人',
  friends: '好友',
  tables: '我的牌桌',
  favorites: '我的收藏',
  membership: '會員',
  elf: '精靈',
}
