import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { filtersFromQuery, hasFilters } from '@/utils/filters'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView, meta: { title: '首頁' } },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/views/SearchView.vue'),
      meta: { title: '搜尋結果' },
      // 沒有搜尋字也沒有篩選時沒東西可搜，首頁就是沒有條件時的瀏覽頁（PRD 7.2 第 7 條）
      beforeEnter: (to) =>
        to.query.q || hasFilters(filtersFromQuery(to.query))
          ? true
          : { name: 'home', query: { scenario: to.query.scenario }, replace: true },
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
    // 頁尾連結的目的頁不在本輪範圍（PRD 5.3），先共用一個佔位頁
    {
      path: '/coming-soon',
      name: 'coming-soon',
      component: () => import('@/views/PlaceholderView.vue'),
      meta: { title: '佈置中' },
    },
    // 放最後：上面都對不上的網址都到這裡
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { title: '找不到頁面' },
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
