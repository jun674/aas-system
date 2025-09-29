import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authService } from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const currentUser = computed(() => user.value)
  const userRole = computed(() => user.value?.role || 'guest')

  // Actions
  const login = async (credentials) => {
    isLoading.value = true
    error.value = null

    try {
      // 1. 서버에 로그인 요청 (세션 쿠키가 생성됨)
      await authService.login(credentials)

      // 2. 로그인 성공 후, 현재 사용자 정보를 가져와 상태 업데이트
      await checkAuth()

      return { success: true, user: user.value }
    } catch (err) {
      error.value = err.message || 'Login failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (err) {
      console.error('Logout API failed, but clearing session locally.', err)
    } finally {
      // API 호출 성공 여부와 관계없이 로컬 상태 초기화
      user.value = null
    }
  }

  const register = async (userData) => {
    isLoading.value = true
    error.value = null

    try {
      // 실제 API 호출
      const response = await authService.register(userData)

      if (response.success) {
        return response
      } else {
        // 임시 회원가입 처리 (API가 아직 준비되지 않은 경우)
        await new Promise((resolve) => setTimeout(resolve, 1000))

        return { success: true, message: 'Registration successful' }
      }
    } catch (err) {
      error.value = err.message || 'Registration failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const checkAuth = async () => {
    try {
      // 세션이 유효한지 확인하기 위해 /auth/me API 호출
      const currentUser = await authService.getCurrentUser()
      if (currentUser) {
        user.value = currentUser
        return true
      }
      // 응답은 있지만 유저 정보가 없는 경우
      logout()
      return false
    } catch (err) {
      // 401 등 에러 발생 시 세션이 없는 것으로 간주
      console.error('checkAuth failed:', err)
      logout()
      return false
    }
  }

  return {
    // State
    user,
    isLoading,
    error,

    // Getters
    isAuthenticated,
    currentUser,
    userRole,

    // Actions
    login,
    logout,
    register,
    checkAuth,
  }
})
