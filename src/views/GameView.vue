<script setup>
import { watch } from 'vue'
import { addRecentlyViewed } from '@/api/history'

const props = defineProps({ slug: { type: String, required: true } })

// 進遊戲主畫面就算看過，給首頁「為你推薦」用（PRD 7.1 第 8 條）；從一款遊戲換到另一款也要記
watch(() => props.slug, addRecentlyViewed, { immediate: true })
</script>

<template>
  <h1 class="type-tc-heading-24 text-text-primary">遊戲：{{ slug }}</h1>
</template>
