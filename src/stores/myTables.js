import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getMyTables } from '@/api/tables'

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
    try {
      const data = await getMyTables()
      playing.value = data.playing
      queued.value = data.queued
      status.value = 'success'
    } catch {
      if (status.value !== 'success') status.value = 'error'
    }
  }

  // 紅點只給「輪到你」（MYTBL-04）：即時制的桌一直都在進行，也亮的話紅點就沒意義了
  const hasMyTurn = computed(() => playing.value.some((row) => row.isMyTurn))

  return { playing, queued, status, tab, load, hasMyTurn }
})
