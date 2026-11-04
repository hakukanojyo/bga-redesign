<script setup>
import AppButton from '@/components/AppButton.vue'
import PageState from '@/components/PageState.vue'
import mascotLost from '@/assets/images/mascot-lost.svg'
</script>

<!-- Figma：找不到頁面（1189:20069、平板 1189:20271）。不寫 404、不提供重新嘗試（產品規則 5.1） -->
<template>
  <div class="flex flex-1 items-center justify-center">
    <PageState
      :image="mascotLost"
      title="找不到這個頁面"
      description="網址可能打錯了，或這個頁面已經移除。"
    >
      <AppButton to="/">回首頁</AppButton>
      <AppButton to="/tables" variant="secondary">尋找開放桌</AppButton>
    </PageState>
  </div>
</template>
