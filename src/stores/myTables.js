import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { gameName } from '@/api/games'
import { acceptTable, getMyTables, leaveTable } from '@/api/tables'
import router from '@/router'
import { toast } from '@/utils/toast'

// 我的牌桌（docs/adr/0002）：側欄面板、側欄和導覽列的紅點、加入成功的「查看」都讀這一份。
// 進行中的順序由 API 排好（輪到你 → 即時制 → 其他）
export const useMyTablesStore = defineStore('myTables', () => {
  const playing = ref([])
  const queued = ref([])
  // 人到齊、等你確認的即時制（MYTBL-13）。也還在 queued 裡（排隊中的卡片不會突然不見）
  const confirming = ref([])
  const status = ref('idle')
  // 面板目前看哪一頁：playing、queued。加入成功按「查看」時切到排隊中
  const tab = ref('playing')

  // 每次自己改了牌桌（退出、確認）就加一。改之前送出的 load 回來時資料已經過時，丟掉不用：
  // 不然剛退出的桌會被舊資料放回來，確認視窗關了又跳出來（舊的請求比較晚回來）
  let edits = 0

  async function load() {
    const startedAt = edits
    // 已經有資料時重拿不顯示骨架，避免面板每次打開都閃一下
    if (status.value !== 'success') status.value = 'loading'
    // 只看還在等人的：即時制人到齊會先變成等確認，不走「人到齊了」提示
    const waiting = new Set(
      queued.value.filter((row) => row.status === 'queued').map((row) => row.tableId),
    )
    try {
      const data = await getMyTables()
      if (startedAt !== edits) return
      if (status.value === 'success') {
        // 回合制：上次還在排隊、這次在進行中＝人到齊了（MYTBL-11）。只提示，不把使用者帶離目前的頁面（產品規則 3.2）
        const started = data.playing.filter((item) => waiting.has(item.tableId))
        // 同時有幾桌到齊就提示幾次；寫出遊戲名稱，才知道是哪一桌（2026-11-06）
        started.forEach((row) =>
          toast.success(`${gameName(row.table.game)} 人到齊了`, {
            viewLabel: '進入遊戲',
            // 留到使用者處理：人到齊時使用者常常不在看畫面
            persistent: true,
            // 遊戲確認畫面本輪是佔位頁
            onView: () => router.push('/coming-soon'),
          }),
        )
        // 即時制：等確認的桌收尾了。回應回來後才比對，自己剛按「退出這桌」的已經不在裡面，不會誤判成逾時
        confirming.value.forEach((before) => settled(before, data))
      }
      playing.value = data.playing
      queued.value = data.queued
      confirming.value = data.confirming ?? []
      status.value = 'success'
    } catch {
      if (status.value !== 'success') status.value = 'error'
    }
  }

  // 上次還在等確認、這次不是了（產品規則 3.2、MYTBL-12、13）
  function settled(before, data) {
    const id = before.tableId
    if (data.confirming?.some((row) => row.tableId === id)) return
    const name = gameName(before.table.game)
    const nowPlaying = data.playing.find((row) => row.tableId === id)
    if (nowPlaying) {
      // 全員確認：開始。即時制同時只能進行一桌，其他排隊中的即時制已經自動退出
      if (nowPlaying.autoLeft) toast.neutral(`已退出另外 ${nowPlaying.autoLeft} 桌即時制的排隊`)
      // 遊戲畫面本輪是佔位頁
      router.push('/coming-soon')
    } else if (data.queued.some((row) => row.tableId === id)) {
      toast.neutral('有玩家沒有確認 這桌回到等人')
    } else {
      // 時間到自己沒按：視同退出。寫遊戲名稱、留到使用者關掉，回來才知道錯過了哪一桌
      toast.neutral(`${name} 沒有在時間內確認 已退出這桌`, { persistent: true })
    }
  }

  // 退出這桌（MYTBL-08）：確認彈窗之後才呼叫。樂觀更新，先拿掉，失敗再放回去（產品規則 5.3）；
  // 「已退出這桌」不附復原：排隊順位已經沒了，復原不回來（產品規則 4.1）
  async function leave(tableId) {
    edits += 1
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

  // 確認視窗一次問一桌，先到齊的先問
  const readyCheck = computed(() => confirming.value[0] ?? null)

  // 正在送出「進入遊戲」的那一桌，視窗顯示「進入中…」（產品規則 5.3：結果要看別人，等回應）
  const acceptingId = ref(null)

  // 按「進入遊戲」（MYTBL-13）：記下我確認了，視窗換成「等待其他玩家確認」；全員確認後由 load 收尾
  async function accept(tableId) {
    edits += 1
    acceptingId.value = tableId
    try {
      await acceptTable(tableId)
      confirming.value = confirming.value.map((row) =>
        row.tableId === tableId ? { ...row, accepted: true } : row,
      )
    } catch (error) {
      // 已經不在等確認（例如剛好逾時）：重拿就好，不用提示
      if (error.code !== 'gone') toast.error('操作失敗 請再試一次')
    }
    acceptingId.value = null
    await load()
  }

  // 按「退出這桌」：視窗本身就是確認，不再跳確認彈窗。失敗時下一次刷新會把它拿回來
  async function decline(tableId) {
    edits += 1
    confirming.value = confirming.value.filter((row) => row.tableId !== tableId)
    queued.value = queued.value.filter((row) => row.tableId !== tableId)
    toast.neutral('已退出這桌')
    await leaveTable(tableId).catch(() => toast.error('操作失敗 請再試一次'))
  }

  // 紅點只給「輪到你」（MYTBL-04）：即時制的桌一直都在進行，也亮的話紅點就沒意義了
  const hasMyTurn = computed(() => playing.value.some((row) => row.isMyTurn))

  return {
    playing,
    queued,
    confirming,
    readyCheck,
    acceptingId,
    status,
    tab,
    load,
    leave,
    accept,
    decline,
    hasMyTurn,
  }
})
