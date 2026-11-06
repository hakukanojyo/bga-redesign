<script setup>
import { computed, watch } from 'vue'
import { getGameTables } from '@/api/tables'
import { useJoinTable } from '@/composables/useJoinTable'
import { usePolling } from '@/composables/usePolling'
import { useRequest } from '@/composables/useRequest'
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

const { data, status, retry } = useRequest(() => getGameTables(props.slug))
const { removed, stateOf, join, afterRefresh, clear } = useJoinTable()

const rows = computed(() => (data.value?.tables ?? []).filter((table) => !removed.has(table.id)))

watch(
  () => data.value && data.value.total - removed.size,
  (value) => {
    total.value = value ?? null
  },
)

// 每 10 秒刷新（產品規則 3.1）：失敗時保留上一次的資料、不顯示錯誤（產品規則 5.3）
usePolling(async () => {
  if (status.value !== 'success') return
  try {
    const next = await getGameTables(props.slug, { refresh: true })
    afterRefresh()
    data.value = next
  } catch {
    // 下次再試
  }
}, 10_000)

watch(
  () => props.slug,
  () => {
    clear()
    retry()
  },
)
</script>

<!--
  Figma：開放桌（303:2161）。最多 3 桌、最新的在前（PRD 7.4 第 4 條）；自己已經加入的不放進來。
  加入成功：按鈕變「已加入」停 1.5 秒，那一列淡出、下面的往上補（TransitionGroup）；減少動態效果時直接移除。
  刷新時被拿掉的、新出現的桌也用同一套動畫。
  沒有開放桌：吉祥物＋標題＋說明＋「建立遊戲桌」（本輪連佔位頁，PRD 7.4）；下面多留 24，和上面標題到吉祥物的距離差不多
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
    description="開一桌當第一位玩家 其他人就能加入你"
    class="mx-auto pb-24"
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
