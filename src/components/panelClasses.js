// 側欄面板和 Bottom Sheet 的內容共用的 class（寫完整字串，Tailwind 才掃得到）

// 被懸停按鈕條蓋住的那一行：按鈕條滑上來時同時淡出，位置保留、版面不跳。
// 淡出後也不能點（裡面的頭像是連結），點到的是整張卡
export const fadeOnHover =
  'transition-opacity duration-200 ease-[cubic-bezier(0.2,0,0,1)] group-focus-within/panel-card:opacity-0 group-hover/panel-card:pointer-events-none group-hover/panel-card:opacity-0 motion-reduce:transition-none'

// 懸停才出現的「›」（觸控裝置一直顯示，不用這個）。Font Awesome 的 CSS 會蓋掉圖示上的 hidden，包一層 span 再加
export const showOnHover = 'hidden group-focus-within/panel-card:block group-hover/panel-card:block'

// 面板裡捲動的區域：四周多留 8（外面用 -m-8 抵掉），卡片懸停的陰影才不會被捲動區切掉；
// 分頁、標題放在捲動區外面，捲動時不動
export const panelScroll = '-m-8 flex min-h-0 flex-1 flex-col overflow-y-auto p-8'
