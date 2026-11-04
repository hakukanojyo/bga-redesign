<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faBell, faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { faInstagram, faSquareFacebook, faSquareXTwitter } from '@fortawesome/free-brands-svg-icons'
import logo from '@/assets/images/logo-footer.svg'

// 站內導覽連到現有的頁面；其他目的頁不在本輪範圍（PRD 5.3），先連到佔位頁
const soon = '/coming-soon'

const columns = [
  {
    title: '說明與支援',
    links: [
      { label: '什麼是 BGA 桌遊競技場？', to: soon },
      { label: '關於我們團隊', to: soon },
      { label: '常見問題 FAQ', to: soon },
      { label: '客服中心／聯絡我們', to: soon },
    ],
  },
  {
    title: '貢獻與開發',
    links: [
      { label: '我是遊戲出版商', to: soon },
      { label: '我是軟體工程師', to: soon },
      { label: '程式回報錯誤', to: soon },
      { label: '為 BGA 貢獻並取得尊榮會員', to: soon },
    ],
  },
  {
    title: '站內導覽',
    links: [
      { label: '遊戲列表', to: '/search' },
      { label: '新聞', to: '/news' },
      { label: '討論區', to: '/forum' },
      { label: '尋找開放桌', to: '/tables' },
    ],
  },
]

// 年月日-時分-commit，見 vite.config.js
const buildVersion = __BUILD_VERSION__

const legalLinks = ['法律資訊', '使用條款', '服務條款', '隱私', 'Cookies']

// 電子報、推播是動作不是連結：先做成按鈕，之後接 Toast 或真的功能
const socials = [
  { label: 'Facebook', icon: faSquareFacebook, to: soon },
  { label: 'Instagram', icon: faInstagram, to: soon },
  { label: 'X (Twitter)', icon: faSquareXTwitter, to: soon },
  { label: '電子報通知', icon: faEnvelope },
  { label: '啟用瀏覽器推播通知', icon: faBell, wide: true },
]
</script>

<!--
  Figma：Layout/Footer（540:1207），平板是同一個元件（首頁｜Tablet 裡的 861:5687）。
  不寫斷點，靠換行切換：桌面 logo、連結、社群排一排；平板放不下 logo＋連結的最小寬度（140＋32＋560），自動換成三排，
  社群的最大寬度在平板模式是 1440（footer/social-max-width），所以佔滿整排、5 個按鈕排成一排。
  刻意和 Figma 不同：放在內容區、不蓋到右側欄；推出時間是 build 時自動帶入的，Figma 上那串是範例
-->
<template>
  <footer class="bg-overlay-scrim px-40 py-32 text-text-inverse">
    <div class="mx-auto flex max-w-[1278px] flex-wrap items-start gap-32">
      <img :src="logo" alt="Board Game Arena" width="140" height="63" />

      <div class="flex min-w-[560px] flex-1 flex-col gap-12">
        <nav aria-label="頁尾導覽" class="flex gap-48 border-b border-border-subtle pb-20">
          <section
            v-for="column in columns"
            :key="column.title"
            class="flex min-w-[160px] flex-1 flex-col gap-16"
          >
            <h2 class="border-b border-border-subtle pb-12 type-footer-title-13">
              {{ column.title }}
            </h2>
            <!-- 字級放在 ul：放在行內的 a 上，li 的行高還是會吃到預設的 24。hover、按下（Figma 的 action）用文字底線，Figma 的下方 1px 線會讓連結多 1px 高 -->
            <ul class="flex flex-col gap-8 type-footer-link-11">
              <li v-for="link in column.links" :key="link.label">
                <RouterLink :to="link.to" class="hover:underline active:underline">
                  {{ link.label }}
                </RouterLink>
              </li>
            </ul>
          </section>
        </nav>

        <div class="flex flex-wrap items-center justify-between gap-x-12 gap-y-8">
          <p class="type-footer-link-11">Board Game Arena • 推出時間 {{ buildVersion }}</p>
          <ul class="flex gap-8 type-footer-link-11">
            <li v-for="(label, index) in legalLinks" :key="label" class="flex gap-8">
              <span v-if="index > 0" aria-hidden="true">•</span>
              <RouterLink :to="soon" class="hover:underline active:underline">{{
                label
              }}</RouterLink>
            </li>
          </ul>
        </div>
      </div>

      <section class="flex max-w-(--footer-social-max-width) min-w-[254px] flex-1 flex-col gap-12">
        <h2 class="type-tc-body-13">追蹤我們與訂閱最新通知</h2>
        <ul class="flex flex-wrap gap-8">
          <li
            v-for="item in socials"
            :key="item.label"
            class="flex flex-1"
            :class="item.wide ? 'min-w-[200px]' : 'min-w-[110px]'"
          >
            <!-- Footer/Social Button state=hover：底色換成品牌藍、拿掉外框。外框改透明而不是拿掉，按鈕才不會縮 2px -->
            <component
              :is="item.to ? 'RouterLink' : 'button'"
              :to="item.to"
              :type="item.to ? undefined : 'button'"
              class="flex flex-1 items-center justify-center gap-8 border border-border-inverse p-8 type-tc-body-13 whitespace-nowrap hover:border-transparent hover:bg-surface-brand"
            >
              <FontAwesomeIcon :icon="item.icon" class="text-[16px] text-icon-onmain" />
              {{ item.label }}
            </component>
          </li>
        </ul>
      </section>
    </div>
  </footer>
</template>
