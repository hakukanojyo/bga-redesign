<script setup>
import { computed } from 'vue'
import { formatSeats, formatSettings, formatWait } from '@/utils/format'
import AppButton from '@/components/AppButton.vue'

const props = defineProps({
  table: { type: Object, required: true },
  // waiting：可以加入；joining：加入中；joined：剛加入成功（等一下就移除）；full：已額滿
  state: { type: String, default: 'waiting' },
})

defineEmits(['join'])

const settings = computed(() => formatSettings(props.table.settings))
</script>

<!--
  Figma：List/Open Table Row Compact（789:5689），state=default／hover／joining／full，另加 joined（2026-11-05）。
  桌主、設定（最多 2 行，桌面滑鼠移上浮出完整文字）、預估等待、人數、兩顆按鈕。
  「加入這桌」：加入中顯示「加入中…」不能再按；加入成功變停用的「已加入」；已額滿變停用的「已額滿」（PRD 7.6）。
  「查看詳細設定」本輪連佔位頁（PRD 7.4 例外），已額滿也能按
-->
<template>
  <div
    class="flex items-center justify-between gap-12 rounded-8 bg-surface-header px-20 py-12 hover:bg-surface-glass hover:shadow-card"
  >
    <div class="flex w-[256px] shrink-0 flex-col gap-8">
      <div class="flex items-center gap-12">
        <img
          :src="table.host.avatar"
          alt=""
          width="40"
          height="40"
          class="size-[40px] shrink-0 rounded-full border border-border-accent bg-surface-placeholder object-cover"
        />
        <p class="truncate type-tc-title-16 text-text-body">{{ table.host.name }}</p>
      </div>
      <p class="line-clamp-2 type-tc-label-14 text-text-body" :title="settings">
        <span class="sr-only">設定：</span>{{ settings }}
      </p>
    </div>
    <p class="type-tc-body-16 text-text-body">
      預估等待 {{ formatWait(table.estimatedWaitMinutes) }}
    </p>
    <p class="type-tc-body-16 text-text-body">{{ formatSeats(table.seats) }}</p>
    <div class="flex w-[100px] shrink-0 flex-col gap-8">
      <AppButton v-if="state === 'full'" size="sm" disabled>已額滿</AppButton>
      <AppButton v-else-if="state === 'joined'" size="sm" disabled>已加入</AppButton>
      <AppButton
        v-else
        size="sm"
        :aria-busy="state === 'joining' || undefined"
        :aria-disabled="state === 'joining' || undefined"
        @click="state === 'waiting' && $emit('join')"
      >
        {{ state === 'joining' ? '加入中…' : '加入這桌' }}
      </AppButton>
      <AppButton variant="secondary" size="sm" to="/coming-soon">查看詳細設定</AppButton>
    </div>
  </div>
</template>
