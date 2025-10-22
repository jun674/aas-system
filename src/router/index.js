import { createRouter, createWebHistory } from 'vue-router'
import SearchPage from '../views/SearchPage.vue'
import MainDashboard from '../views/MainDashboard.vue' // 새로 만든 대시보드 임포트
import SignupPage from '../views/SignupPage.vue'
import ProfilePage from '../views/ProfilePage.vue'
import UserManagementPage from '../views/UserManagementPage.vue'
import { useAuthStore } from '@/stores/auth'

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
      path: '/profile',
      name: 'profile',
      component: ProfilePage,
      meta: { requiresAuth: true }
    },
    {
      path: '/users',
      name: 'users',
      component: UserManagementPage,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
  ],
})

// 네비게이션 가드
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 인증이 필요한 페이지
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      // 로그인 페이지로 리다이렉트
      next('/')
      return
    }

    // 사용자 정보가 없으면 가져오기
    if (!authStore.user) {
      try {
        await authStore.checkAuth()
      } catch (error) {
        console.error('Failed to get user info:', error)
        next('/')
        return
      }
    }

    // 관리자 권한이 필요한 페이지
    if (to.meta.requiresAdmin && authStore.userRole !== 'ADMIN') {
      next('/')
      return
    }
  }

  next()
})

export default router
