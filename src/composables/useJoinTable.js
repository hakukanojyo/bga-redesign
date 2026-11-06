import { inject, reactive } from 'vue'
import { joinTable } from '@/api/tables'
import { toast } from '@/utils/toast'

// 加入成功後「已加入」停多久才移除（2026-11-05 決定）
export const JOINED_MS = 1500

// 加入這桌的流程（PRD 7.6），遊戲頁的開放桌和尋找開放桌共用：
// - 要等伺服器回應（結果看別人的狀態），中間顯示「加入中…」
// - 成功：「已加入」＋提示「已加入這桌」和「查看」（按查看打開我的牌桌），1.5 秒後放進 removed，畫面把那一列拿掉
// - 牌桌已滿：那一列改「已額滿」＋紅色提示；其他失敗：「操作失敗，請再試一次」
export function useJoinTable() {
  // 每一列在使用者這邊的暫時狀態：joining、joined、full
  const rowState = reactive({})
  // 加入成功、已經拿掉的桌（下次刷新伺服器也不會再給，因為在我的牌桌裡了）
  const removed = reactive(new Set())
  const openPanel = inject('openPanel', () => {})

  function stateOf(table) {
    return rowState[table.id] ?? (table.status === 'full' ? 'full' : 'waiting')
  }

  async function join(table) {
    rowState[table.id] = 'joining'
    try {
      await joinTable(table.id)
      rowState[table.id] = 'joined'
      toast.success('已加入這桌', { onView: () => openPanel('tables') })
      setTimeout(() => removed.add(table.id), JOINED_MS)
    } catch (error) {
      if (error.code === 'full') {
        rowState[table.id] = 'full'
        toast.error('加入失敗 牌桌已滿')
      } else {
        delete rowState[table.id]
        toast.error('操作失敗 請再試一次')
      }
    }
  }

  // 刷新拿到新資料時：伺服器的狀態是新的，只留正在加入中的
  function afterRefresh() {
    removed.clear()
    for (const id of Object.keys(rowState)) {
      if (rowState[id] !== 'joining') delete rowState[id]
    }
  }

  function clear() {
    removed.clear()
    for (const id of Object.keys(rowState)) delete rowState[id]
  }

  return { removed, stateOf, join, afterRefresh, clear }
}
