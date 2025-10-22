import apiClient from './api'

/**
 * 인증 관련 API 서비스
 */
export const authService = {
  /**
   * 로그인
   * @param {Object} credentials - 로그인 정보
   * @param {string} credentials.username - 사용자명
   * @param {string} credentials.password - 비밀번호
   * @returns {Promise<Object>} 로그인 응답 (토큰, 사용자 정보 등)
   */
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials)
      return response.data
    } catch (error) {
      console.error('Login API error:', error)
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  },

  /**
   * 로그아웃
   * @returns {Promise<Object>} 로그아웃 응답
   */
  async logout() {
    try {
      const response = await apiClient.post('/auth/logout')
      return response.data
    } catch (error) {
      console.error('Logout API error:', error)
      // 로그아웃은 실패해도 로컬 처리 진행
      return { success: true }
    }
  },

  /**
   * 회원가입
   * @param {Object} userData - 회원가입 정보
   * @param {string} userData.username - 사용자명
   * @param {string} userData.email - 이메일
   * @param {string} userData.password - 비밀번호
   * @returns {Promise<Object>} 회원가입 응답
   */
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData)
      return response.data
    } catch (error) {
      console.error('Register API error:', error)
      throw new Error(error.response?.data?.message || 'Registration failed')
    }
  },

  /**
   * 토큰 유효성 검증
   * @param {string} token - JWT 토큰
   * @returns {Promise<Object>} 검증 결과
   */
  async validateToken(token) {
    try {
      const response = await apiClient.get('/auth/validate', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      return response.data
    } catch (error) {
      console.error('Token validation error:', error)
      throw new Error('Invalid token')
    }
  },

  /**
   * 현재 사용자 정보 조회
   * @returns {Promise<Object>} 사용자 정보
   */
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/me')
      return response.data
    } catch (error) {
      console.error('Get current user error:', error)
      throw new Error('Failed to get user info')
    }
  },

  /**
   * 비밀번호 변경
   * @param {Object} passwordData - 비밀번호 변경 정보
   * @param {string} passwordData.currentPassword - 현재 비밀번호
   * @param {string} passwordData.newPassword - 새 비밀번호
   * @returns {Promise<Object>} 변경 결과
   */
  async changePassword(passwordData) {
    try {
      const response = await apiClient.put('/auth/password', passwordData)
      return response.data
    } catch (error) {
      console.error('Change password error:', error)
      throw new Error(error.response?.data?.message || 'Failed to change password')
    }
  },

  /**
   * 비밀번호 재설정 요청
   * @param {string} email - 이메일 주소
   * @returns {Promise<Object>} 요청 결과
   */
  async requestPasswordReset(email) {
    try {
      const response = await apiClient.post('/auth/reset-password', { email })
      return response.data
    } catch (error) {
      console.error('Password reset request error:', error)
      throw new Error(error.response?.data?.message || 'Failed to request password reset')
    }
  },

  /**
   * 비밀번호 재설정
   * @param {Object} resetData - 재설정 정보
   * @param {string} resetData.token - 재설정 토큰
   * @param {string} resetData.newPassword - 새 비밀번호
   * @returns {Promise<Object>} 재설정 결과
   */
  async resetPassword(resetData) {
    try {
      const response = await apiClient.put('/auth/reset-password', resetData)
      return response.data
    } catch (error) {
      console.error('Password reset error:', error)
      throw new Error(error.response?.data?.message || 'Failed to reset password')
    }
  },

  /**
   * 사용자 프로필 업데이트
   * @param {Object} profileData - 프로필 정보
   * @returns {Promise<Object>} 업데이트 결과
   */
  async updateProfile(profileData) {
    try {
      const response = await apiClient.put('/auth/profile', profileData)
      return response.data
    } catch (error) {
      console.error('Update profile error:', error)
      throw new Error(error.response?.data?.message || 'Failed to update profile')
    }
  },

  /**
   * 모든 사용자 조회 (관리자용)
   * @returns {Promise<Object>} 사용자 목록
   */
  async getAllUsers() {
    try {
      const response = await apiClient.get('/auth/users')
      // 백엔드 응답이 SuccessResponse로 래핑되어 있는 경우
      return response.data.message || response.data
    } catch (error) {
      console.error('Get all users error:', error)
      throw new Error(error.response?.data?.message || 'Failed to get users')
    }
  },

  /**
   * 사용자 정보 수정 (관리자용)
   * @param {Object} userData - 수정할 사용자 정보
   * @returns {Promise<Object>} 수정 결과
   */
  async updateUser(userData) {
    try {
      const response = await apiClient.put(`/auth/users/${userData.id}`, userData)
      return response.data
    } catch (error) {
      console.error('Update user error:', error)
      throw new Error(error.response?.data?.message || 'Failed to update user')
    }
  }
}

export default authService
