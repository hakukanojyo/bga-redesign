<script setup>
import { RouterLink } from 'vue-router'
import FindTableButton from '@/components/layout/FindTableButton.vue'
import logo from '@/assets/images/logo.png'
import avatar from '@/assets/images/avatar-demo.jpg'

const links = [
  { to: '/', label: '首頁' },
  { to: '/news', label: '新聞' },
  { to: '/forum', label: '討論區' },
]
</script>

<!-- Figma：桌面是 382 寬的 logo 欄＋導覽列（首頁 625:3944）；平板是 Layout/Header（872:8727） -->
<template>
  <header
    class="grid h-[72px] grid-cols-[382px_1fr] bg-surface-header max-desktop:flex max-desktop:justify-between max-desktop:px-24"
  >
    <RouterLink to="/" class="self-end pl-80 max-desktop:pl-0">
      <img
        :src="logo"
        alt="Board Game Arena 首頁"
        width="267"
        height="64"
        class="h-[64px] w-auto max-desktop:h-[56px]"
      />
    </RouterLink>

    <div class="flex items-center justify-center gap-24">
      <nav aria-label="主要導覽">
        <ul class="flex gap-24">
          <li v-for="link in links" :key="link.to">
            <!-- RouterLink 會在目前這頁加上 aria-current="page" -->
            <RouterLink
              :to="link.to"
              class="block border-b-2 border-transparent py-4 type-tc-title-16 text-text-link hover:border-border-nav-active aria-[current=page]:border-border-nav-active"
            >
              {{ link.label }}
            </RouterLink>
          </li>
        </ul>
      </nav>
      <FindTableButton />
      <!-- 桌面的頭像在右側欄；點了打開個人面板（PROF-01）在下一個 PR 做 -->
      <button type="button" aria-label="個人資料" class="hidden max-desktop:block">
        <img
          :src="avatar"
          alt=""
          width="40"
          height="40"
          class="size-[40px] rounded-full border-2 border-border-accent object-cover"
        />
      </button>
    </div>
  </header>
</template>
