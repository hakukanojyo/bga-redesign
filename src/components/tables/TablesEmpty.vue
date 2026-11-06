<script setup>
import AppButton from '@/components/AppButton.vue'
import PageState from '@/components/PageState.vue'
import SearchEmpty from '@/components/search/SearchEmpty.vue'
import mascot from '@/assets/images/mascot-cool.svg'

defineProps({
  // no-game、no-tables、filtered（src/api/tables.js 的 emptyReason）
  reason: { type: String, required: true },
  query: { type: String, default: '' },
  // 查無遊戲時的「也許你想找的是這些？」
  suggestions: { type: Array, default: () => [] },
})

defineEmits(['clear-search', 'reset-filters'])
</script>

<!--
  尋找開放桌沒有結果的四種情況（#40，2026-11-06）：
  - 查無遊戲（TABLE-12，Figma 303:2452）：和搜尋結果的沒結果同一個（SearchEmpty）
  - 遊戲有、沒有開放桌（TABLE-11，Figma 303:2475）：文案和遊戲頁的開放桌空狀態統一，按鈕「建立遊戲桌」（本輪佔位頁）
  - 沒有搜尋字、沒有篩選，整個網站都沒人開桌：還沒選遊戲，不知道要開哪一款，所以叫人先去「探索遊戲」（和收藏、遊玩紀錄的空狀態同一個按鈕）
  - 篩選後沒結果：Figma 沒畫；原因是模式、制度選太窄，所以給「重設篩選」，不叫人去開桌
  原因不同、能做的事也不同，所以分開
-->
<template>
  <SearchEmpty
    v-if="reason === 'no-game'"
    :query="query"
    :suggestions="suggestions"
    :level="3"
    @clear="$emit('clear-search')"
  />
  <PageState
    v-else-if="reason === 'no-tables' && query"
    :image="mascot"
    :level="3"
    :title="`「${query}」目前無開放桌`"
    description="開一桌當第一位玩家 其他人就能加入你"
    class="mx-auto"
  >
    <AppButton to="/coming-soon">建立遊戲桌</AppButton>
    <AppButton variant="secondary" @click="$emit('clear-search')">清除搜尋條件</AppButton>
  </PageState>
  <PageState
    v-else-if="reason === 'no-tables'"
    :image="mascot"
    :level="3"
    title="現在還沒有人開桌"
    description="先去找一款想玩的遊戲 在遊戲頁就能開第一桌"
    class="mx-auto"
  >
    <AppButton :to="{ name: 'home' }">探索遊戲</AppButton>
  </PageState>
  <PageState
    v-else
    :image="mascot"
    :level="3"
    title="沒有符合條件的開放桌"
    description="試試把遊戲模式或遊戲制度改成「全部」"
    class="mx-auto"
  >
    <AppButton variant="secondary" @click="$emit('reset-filters')">重設篩選</AppButton>
  </PageState>
</template>
