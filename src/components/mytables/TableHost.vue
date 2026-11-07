<script setup>
import UserAvatar from '@/components/UserAvatar.vue'
defineProps({
  host: { type: Object, required: true },
})
</script>

<!-- 我的牌桌卡片裡的「桌主：頭像 名稱」（Figma 頭像 20、名稱 EN Body 13）。頭像是裝飾，名字就是內容 -->
<template>
  <p class="flex min-w-0 items-center gap-8 type-tc-body-13 text-text-body">
    桌主：
    <span class="flex min-w-0 items-center gap-12">
      <UserAvatar :user="host" :size="20" />
      <span class="truncate type-en-body-13">{{ host.name }}</span>
    </span>
  </p>
</template>
