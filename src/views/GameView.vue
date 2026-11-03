<script setup>
defineProps({ slug: { type: String, required: true } })
</script>

<template>
  <h1 class="type-tc-heading-24 text-text-primary">遊戲：{{ slug }}</h1>
</template>
