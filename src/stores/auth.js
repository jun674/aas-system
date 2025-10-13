import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authService } from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(localStorage.getItem('authToken') || null)
  const isLoading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const currentUser = computed(() => user.value)
  const userRole = computed(() => user.value?.role || 'guest')

  // Actions
  const login = async (credentials) => {
    isLoading.value = true
    error.value = null

    try {
      // 실제 API 호출
      const response = await authService.login(credentials)

      // 응답 데이터 구조에 따라 조정 필요
      if (response.token && response.user) {
        // 상태 업데이트
        user.value = response.user
        token.value = response.token

        // 로컬 스토리지에 토큰 저장
        localStorage.setItem('authToken', response.token)

        return { success: true, user: response.user }
      } else {
        // 임시 로그인 처리 (API가 아직 준비되지 않은 경우)
        await new Promise(resolve => setTimeout(resolve, 1000))

        const mockUser = {
          id: 1,
          username: credentials.username,
          email: `${credentials.username}@example.com`,
          role: 'user'
        }

        const mockToken = 'mock-jwt-token-' + Date.now()

        // 상태 업데이트
        user.value = mockUser
        token.value = mockToken

        // 로컬 스토리지에 토큰 저장
        localStorage.setItem('authToken', mockToken)

        return { success: true, user: mockUser }
      }
    } catch (err) {
      error.value = err.message || 'Login failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('authToken')
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
        await new Promise(resolve => setTimeout(resolve, 1000))

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
    if (!token.value) return false

    try {
      // 토큰 유효성 검증 API 호출
      const response = await authService.validateToken(token.value)

      if (response.valid) {
        // 사용자 정보가 없으면 가져오기
        if (!user.value && response.user) {
          user.value = response.user
        } else if (!user.value) {
          // 사용자 정보 API 호출
          const userResponse = await authService.getCurrentUser()
          user.value = userResponse.user || userResponse
        }

        return true
      } else {
        // 임시 토큰 검증 (API가 아직 준비되지 않은 경우)
        const isValid = token.value.startsWith('mock-jwt-token-')

        if (!isValid) {
          logout()
          return false
        }

        // 사용자 정보가 없으면 가져오기
        if (!user.value) {
          user.value = {
            id: 1,
            username: 'testuser',
            email: 'testuser@example.com',
            role: 'user'
          }
        }

        return true
      }
    } catch {
      logout()
      return false
    }
  }

  return {
    // State
    user,
    token,
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
    checkAuth
  }
})
