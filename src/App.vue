<script setup>
import { RouterView } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import RouteProgress from '@/components/layout/RouteProgress.vue'
</script>

<template>
  <AppLayout>
    <RouterView />
  </AppLayout>
  <RouteProgress />
</template>
