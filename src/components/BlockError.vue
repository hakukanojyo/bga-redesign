<script setup>
import AppButton from '@/components/AppButton.vue'

defineProps({
  // 深色底上（例如排行榜的藍框）用白字
  inverse: { type: Boolean, default: false },
})

defineEmits(['retry'])
</script>

<!-- 區塊載入失敗（產品規則 5.3）：只在這個區塊顯示，頁面其他部分照常。Figma 沒畫，文案照產品規則 -->
<template>
  <div
    role="alert"
    class="flex flex-1 flex-col items-center justify-center gap-12 p-16 text-center"
  >
    <p class="type-tc-body-13" :class="inverse ? 'text-text-inverse' : 'text-text-body'">
      目前無法載入
    </p>
    <AppButton variant="secondary" @click="$emit('retry')">重新嘗試</AppButton>
  </div>
</template>
