<script>
// 打字換頁時（首頁 → 搜尋結果、刪光字回首頁）搜尋框是新的一個；記下來讓新的接回焦點，使用者可以繼續打字
let keepFocus = false
</script>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useSearchQuery } from '@/composables/useSearchQuery'
import SearchField from '@/components/SearchField.vue'

const route = useRoute()
const { query, search } = useSearchQuery()
const field = ref(null)

// 送出搜尋（PRD 7.2 第 1 條）；push 或 replace、清掉篩選、清空時回首頁都在 useSearchQuery
function onSearch(q) {
  // 會換頁的兩種：從別頁進搜尋結果、在搜尋結果頁刪光字回首頁
  keepFocus = field.value.isFocused() && (route.name !== 'search' || !q)
  search(q)
}

onMounted(() => {
  if (!keepFocus) return
  keepFocus = false
  field.value.focus()
})
</script>

<!-- 首頁、搜尋結果的搜尋框：輸入的部分在 SearchField，這裡管搜尋之後換頁和接回焦點 -->
<template>
  <SearchField ref="field" :query="query" @search="onSearch" />
</template>
