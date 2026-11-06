<script setup>
import AppButton from '@/components/AppButton.vue'
import PageState from '@/components/PageState.vue'
import mascot from '@/assets/images/mascot-lost.svg'

defineEmits(['retry'])

const suggestions = ['確認 Wi-Fi 或行動網路已開啟', '重新整理這個頁面', '稍後再試一次']
</script>

<!--
  Figma：State/Connection Error（1119:16184，FB-07）。頁面的主要資料拿不到時，整頁換成這個（產品規則 5.1、5.3）。
  吉祥物和找不到頁面同一隻（Figma 也是）。刻意和 Figma 不同：目前只有首頁用，在首頁上「回首頁」沒有意義，只留「重新嘗試」
-->
<template>
  <PageState
    :image="mascot"
    title="目前無法連線"
    description="可能是網路連線中斷 或伺服器暫時沒有回應"
  >
    <template #details>
      <div class="flex w-full flex-col gap-8 rounded-8 bg-surface-glass-panel p-16 text-left">
        <p class="type-tc-title-16 text-text-primary">你可以試試：</p>
        <ol class="flex list-inside list-decimal flex-col gap-8 type-tc-body-16 text-text-body">
          <li v-for="item in suggestions" :key="item">{{ item }}</li>
        </ol>
      </div>
    </template>
    <AppButton @click="$emit('retry')">重新嘗試</AppButton>
  </PageState>
</template>
