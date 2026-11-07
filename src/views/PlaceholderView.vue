<script setup>
import AppButton from '@/components/AppButton.vue'
import PageState from '@/components/PageState.vue'
import mascotBuilding from '@/assets/images/mascot-building.svg'
</script>

<!-- 本輪不做的頁面共用（產品規則 5.1）：不另做設計稿，版型沿用找不到頁面；不顯示錯誤 -->
<template>
  <div class="flex flex-1 items-center justify-center">
    <PageState :image="mascotBuilding" title="這張桌子還在佈置中">
      <AppButton to="/">回首頁</AppButton>
    </PageState>
  </div>
</template>
