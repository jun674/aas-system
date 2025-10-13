import { createRouter, createWebHistory } from 'vue-router'
import SearchPage from '../views/SearchPage.vue'
import MainDashboard from '../views/MainDashboard.vue' // 새로 만든 대시보드 임포트
import SignupPage from '../views/SignupPage.vue'
import UserManagementPage from '../views/UserManagementPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/', // 기본 경로를 대시보드로 설정
      name: 'dashboard',
      component: MainDashboard,
    },
    {
      path: '/search', // 기존 검색 페이지는 /search 경로로 접근
      name: 'search',
      component: SearchPage,
      props: (route) => ({ query: route.query }), // 쿼리 파라미터를 props로 전달
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignupPage,
    },
    {
      path: '/users',
      name: 'users',
      component: UserManagementPage,
    },
  ],
})

export default router
