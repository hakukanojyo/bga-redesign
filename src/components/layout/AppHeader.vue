<script setup>
import { RouterLink } from 'vue-router'
import FindTableButton from '@/components/layout/FindTableButton.vue'
import logo from '@/assets/images/logo.png'
import avatar from '@/assets/images/avatar-demo.jpg'

defineEmits(['open-profile'])

const links = [
  { to: '/', label: '首頁' },
  { to: '/news', label: '新聞' },
  { to: '/forum', label: '討論區' },
]
</script>

<!--
  Figma：桌面是 382 寬的 logo 欄＋中間 894 寬的導覽列（首頁 625:3944），右邊 164 是右側欄；平板是 Layout/Header（872:8727）。
  吸頂（產品規則 6.3）：半透明玻璃底加模糊，內容捲到下面會透出來。z-30 蓋過內容，
  但在 Bottom Sheet、遮罩（z-40）和底部導覽列（z-50）下面；桌面側欄面板是原生 dialog，本來就在最上層
-->
<template>
  <header
    class="sticky top-0 z-30 grid h-(--header-height) grid-cols-[382px_1fr] bg-surface-header backdrop-blur-[4px] max-desktop:flex max-desktop:justify-between max-desktop:px-24"
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
      <!-- 桌面的頭像在右側欄；平板在這裡，點了打開個人面板（PROF-01） -->
      <button
        type="button"
        aria-label="個人資料"
        aria-haspopup="dialog"
        class="hidden max-desktop:block"
        @click="$emit('open-profile')"
      >
        <img
          :src="avatar"
          alt=""
          width="40"
          height="40"
          class="size-[40px] rounded-full border-2 border-border-accent object-cover transition-shadow duration-200 hover:shadow-glow-avatar-hover motion-reduce:transition-none"
        />
      </button>
    </div>
  </header>
</template>
