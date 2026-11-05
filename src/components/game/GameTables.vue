<script setup>
import { computed, inject, onBeforeUnmount, onMounted, reactive, watch } from 'vue'
import { getGameTables, joinTable } from '@/api/tables'
import { useRequest } from '@/composables/useRequest'
import { toast } from '@/utils/toast'
import AppButton from '@/components/AppButton.vue'
import BlockError from '@/components/BlockError.vue'
import PageState from '@/components/PageState.vue'
import SkeletonBlock from '@/components/SkeletonBlock.vue'
import OpenTableRow from '@/components/game/OpenTableRow.vue'
import mascot from '@/assets/images/mascot-cool.svg'

const props = defineProps({
  slug: { type: String, required: true },
})

// 總共幾桌：章節導覽的「N 桌」和標題右邊的「查看全部 N 桌」用
const total = defineModel('total', { type: Number, default: null })

// 開放桌每 10 秒刷新（產品規則 3.1）
const REFRESH_MS = 10_000
// 加入成功後「已加入」停多久才移除（2026-11-05 決定）
const JOINED_MS = 1500

const { data, status, retry } = useRequest(() => getGameTables(props.slug))

// 每一列在使用者這邊的暫時狀態：joining、joined、full（伺服器說滿了，下次刷新才拿掉）
const rowState = reactive({})
// 加入成功、已經移除的桌（下次刷新伺服器也不會再給，因為在我的牌桌裡了）
const removed = reactive(new Set())

const rows = computed(() => (data.value?.tables ?? []).filter((table) => !removed.has(table.id)))

watch(
  () => data.value && data.value.total - removed.size,
  (value) => {
    total.value = value ?? null
  },
)

function stateOf(table) {
  return rowState[table.id] ?? (table.status === 'full' ? 'full' : 'waiting')
}

// 自動刷新：失敗時保留上一次的資料、不顯示錯誤（產品規則 5.3）；分頁在背景時不刷新
async function refresh() {
  if (document.hidden || status.value !== 'success') return
  try {
    const next = await getGameTables(props.slug, { refresh: true })
    removed.clear()
    for (const id of Object.keys(rowState)) {
      if (rowState[id] !== 'joining') delete rowState[id]
    }
    data.value = next
  } catch {
    // 下次再試
  }
}

let timer
onMounted(() => {
  timer = setInterval(refresh, REFRESH_MS)
})
onBeforeUnmount(() => clearInterval(timer))

watch(
  () => props.slug,
  () => {
    removed.clear()
    for (const id of Object.keys(rowState)) delete rowState[id]
    retry()
  },
)

const openPanel = inject('openPanel', () => {})

// 加入這桌（PRD 7.6）：要等伺服器回應（結果看別人的狀態），中間顯示「加入中…」
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
      toast.error('加入失敗，牌桌已滿')
    } else {
      delete rowState[table.id]
      toast.error('操作失敗，請再試一次')
    }
  }
}
</script>

<!--
  Figma：開放桌（303:2161）。最多 3 桌、最新的在前（PRD 7.4 第 4 條）；自己已經加入的不放進來。
  加入成功：按鈕變「已加入」停 1.5 秒，那一列淡出、下面的往上補（TransitionGroup）；減少動態效果時直接移除。
  刷新時被拿掉的、新出現的桌也用同一套動畫。
  沒有開放桌：吉祥物＋標題＋說明＋「建立遊戲桌」（本輪連佔位頁，PRD 7.4）
-->
<template>
  <div v-if="status === 'loading'" class="flex flex-col gap-8" aria-busy="true">
    <SkeletonBlock v-for="n in 3" :key="n" class="h-[100px] w-full rounded-8" />
  </div>
  <BlockError v-else-if="status === 'error'" @retry="retry" />
  <PageState
    v-else-if="!rows.length"
    :image="mascot"
    :level="3"
    title="這款遊戲還沒有人開桌"
    description="開一桌當第一位玩家，其他人就能加入你。"
    class="mx-auto"
  >
    <AppButton to="/coming-soon">建立遊戲桌</AppButton>
  </PageState>
  <TransitionGroup
    v-else
    tag="ul"
    class="relative flex flex-col gap-8"
    move-class="transition-transform duration-300 motion-reduce:transition-none"
    enter-active-class="transition-opacity duration-300 motion-reduce:transition-none"
    enter-from-class="opacity-0"
    leave-active-class="absolute inset-x-0 transition-opacity duration-300 motion-reduce:transition-none"
    leave-to-class="opacity-0"
  >
    <li v-for="table in rows" :key="table.id">
      <OpenTableRow :table="table" :state="stateOf(table)" @join="join(table)" />
    </li>
  </TransitionGroup>
</template>
