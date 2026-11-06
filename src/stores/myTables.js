import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { gameName } from '@/api/games'
import { getMyTables, leaveTable } from '@/api/tables'
import router from '@/router'
import { toast } from '@/utils/toast'

// 我的牌桌（docs/adr/0002）：側欄面板、側欄和導覽列的紅點、加入成功的「查看」都讀這一份。
// 進行中的順序由 API 排好（輪到你 → 即時制 → 其他）
export const useMyTablesStore = defineStore('myTables', () => {
  const playing = ref([])
  const queued = ref([])
  const status = ref('idle')
  // 面板目前看哪一頁：playing、queued。加入成功按「查看」時切到排隊中
  const tab = ref('playing')

  async function load() {
    // 已經有資料時重拿不顯示骨架，避免面板每次打開都閃一下
    if (status.value !== 'success') status.value = 'loading'
    const waiting = new Set(queued.value.map((row) => row.tableId))
    try {
      const data = await getMyTables()
      // 上次還在排隊、這次在進行中：人到齊了（MYTBL-11）。只提示，不把使用者帶離目前的頁面（產品規則 3.2）
      if (status.value === 'success') {
        const started = data.playing.filter((item) => waiting.has(item.tableId))
        // 同時有幾桌到齊就提示幾次；寫出遊戲名稱，才知道是哪一桌（2026-11-06）
        started.forEach((row) =>
          toast.success(`${gameName(row.table.game)} 人到齊了`, {
            viewLabel: '進入遊戲',
            // 留到使用者處理：人到齊時使用者常常不在看畫面。即時制之後改成直接跳確認視窗、不跳提示（另開 issue）
            persistent: true,
            // 遊戲確認畫面本輪是佔位頁
            onView: () => router.push('/coming-soon'),
          }),
        )
      }
      playing.value = data.playing
      queued.value = data.queued
      status.value = 'success'
    } catch {
      if (status.value !== 'success') status.value = 'error'
    }
  }

  // 退出這桌（MYTBL-08）：確認彈窗之後才呼叫。樂觀更新，先拿掉，失敗再放回去（產品規則 5.3）；
  // 「已退出這桌」不附復原：排隊順位已經沒了，復原不回來（產品規則 4.1）
  async function leave(tableId) {
    const before = [...queued.value]
    queued.value = queued.value.filter((row) => row.tableId !== tableId)
    toast.neutral('已退出這桌')
    try {
      await leaveTable(tableId)
    } catch {
      queued.value = before
      toast.error('操作失敗 請再試一次')
    }
  }

  // 紅點只給「輪到你」（MYTBL-04）：即時制的桌一直都在進行，也亮的話紅點就沒意義了
  const hasMyTurn = computed(() => playing.value.some((row) => row.isMyTurn))

  return { playing, queued, status, tab, load, leave, hasMyTurn }
})
