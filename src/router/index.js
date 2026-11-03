import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView, meta: { title: '首頁' } },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/views/SearchView.vue'),
      meta: { title: '搜尋結果' },
    },
    {
      path: '/game/:slug',
      name: 'game',
      component: () => import('@/views/GameView.vue'),
      props: true,
      meta: { title: '遊戲' },
    },
    {
      path: '/tables',
      name: 'tables',
      component: () => import('@/views/TablesView.vue'),
      meta: { title: '尋找開放桌' },
    },
    {
      path: '/news',
      name: 'news',
      component: () => import('@/views/PlaceholderView.vue'),
      meta: { title: '新聞' },
    },
    {
      path: '/forum',
      name: 'forum',
      component: () => import('@/views/PlaceholderView.vue'),
      meta: { title: '討論區' },
    },
  ],
  // 換頁回到頂端；上一頁回到原本的位置
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  },
})

router.afterEach((to) => {
  document.title = `${to.meta.title}｜BGA Redesign`
})

export default router
