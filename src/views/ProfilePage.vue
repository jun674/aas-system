<template>
  <div class="profile-page">
    <div class="profile-container">
      <div class="profile-header">
        <div class="header-content">
          <div class="user-avatar-large">
            <i class="fas fa-user"></i>
          </div>
          <div class="user-info">
            <h1>{{ authStore.currentUser?.name || authStore.currentUser?.username }}</h1>
            <p class="user-role">{{ authStore.currentUser?.role || 'USER' }}</p>
            <p class="user-email">{{ authStore.currentUser?.email }}</p>
          </div>
        </div>
      </div>

      <div class="profile-content">
        <div class="profile-section">
          <h2>프로필 정보</h2>

          <form @submit.prevent="handleUpdateProfile" class="profile-form">
            <!-- 이메일 수정 -->
            <div class="form-group">
              <label for="email">이메일</label>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                class="form-control"
                placeholder="새 이메일 주소를 입력하세요"
              />
            </div>

            <!-- 현재 비밀번호 -->
            <div class="form-group">
              <label for="currentPassword">현재 비밀번호</label>
              <input
                id="currentPassword"
                v-model="formData.currentPassword"
                type="password"
                class="form-control"
                placeholder="현재 비밀번호를 입력하세요"
              />
              <small class="form-text">비밀번호를 변경하거나 이메일을 수정할 때 필요합니다.</small>
            </div>

            <!-- 새 비밀번호 -->
            <div class="form-group">
              <label for="newPassword">새 비밀번호</label>
              <input
                id="newPassword"
                v-model="formData.newPassword"
                type="password"
                class="form-control"
                placeholder="새 비밀번호를 입력하세요 (선택사항)"
              />
              <small class="form-text">비밀번호를 변경하지 않으려면 비워두세요.</small>
            </div>

            <!-- 새 비밀번호 확인 -->
            <div v-if="formData.newPassword" class="form-group">
              <label for="confirmPassword">새 비밀번호 확인</label>
              <input
                id="confirmPassword"
                v-model="formData.confirmPassword"
                type="password"
                class="form-control"
                placeholder="새 비밀번호를 다시 입력하세요"
              />
              <div v-if="passwordMismatch" class="error-message">
                <i class="fas fa-exclamation-circle"></i> 비밀번호가 일치하지 않습니다.
              </div>
            </div>

            <!-- 에러 메시지 -->
            <div v-if="errorMessage" class="error-message">
              <i class="fas fa-exclamation-circle"></i> {{ errorMessage }}
            </div>

            <!-- 성공 메시지 -->
            <div v-if="successMessage" class="success-message">
              <i class="fas fa-check-circle"></i> {{ successMessage }}
            </div>

            <!-- 버튼 그룹 -->
            <div class="button-group">
              <button type="button" class="btn btn-secondary" @click="resetForm">
                <i class="fas fa-undo"></i>
                초기화
              </button>
              <button type="submit" class="btn btn-primary" :disabled="!isFormValid || loading">
                <span v-if="!loading">
                  <i class="fas fa-save"></i>
                  저장
                </span>
                <span v-else>
                  <i class="fas fa-spinner fa-spin"></i>
                  저장 중...
                </span>
              </button>
            </div>
          </form>
        </div>

        <!-- 계정 정보 섹션 -->
        <div class="profile-section">
          <h2>계정 정보</h2>
          <div class="info-grid">
            <div class="info-item">
              <label>사용자 ID</label>
              <span>{{ authStore.currentUser?.username }}</span>
            </div>
            <div class="info-item">
              <label>이름</label>
              <span>{{ authStore.currentUser?.name }}</span>
            </div>
            <div class="info-item">
              <label>권한</label>
              <span class="role-badge" :class="authStore.currentUser?.role?.toLowerCase()">
                {{ authStore.currentUser?.role }}
              </span>
            </div>
            <div class="info-item">
              <label>가입일</label>
              <span>{{ formatDate(authStore.currentUser?.createdAt) }}</span>
            </div>
            <div class="info-item">
              <label>최종 수정일</label>
              <span>{{ formatDate(authStore.currentUser?.updatedAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import authService from '@/services/authService'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()

// 폼 데이터
const formData = reactive({
  email: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 상태 관리
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// 계산된 속성
const passwordMismatch = computed(() => {
  return formData.newPassword && formData.confirmPassword &&
         formData.newPassword !== formData.confirmPassword
})

const isFormValid = computed(() => {
  // 이메일이나 비밀번호 중 하나는 변경되어야 함
  const hasEmailChange = formData.email && formData.email !== authStore.currentUser?.email
  const hasPasswordChange = formData.newPassword

  if (!hasEmailChange && !hasPasswordChange) {
    return false
  }

  // 변경사항이 있으면 현재 비밀번호는 필수
  if ((hasEmailChange || hasPasswordChange) && !formData.currentPassword) {
    return false
  }

  // 새 비밀번호가 있으면 확인 비밀번호도 일치해야 함
  if (hasPasswordChange && passwordMismatch.value) {
    return false
  }

  return true
})

// 컴포넌트 마운트 시 현재 사용자 정보로 폼 초기화
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/')
    return
  }

  // 최신 사용자 정보 가져오기
  try {
    await authStore.checkAuth()
    resetForm()
  } catch (error) {
    console.error('Failed to load user info:', error)
  }
})

// 폼 초기화
const resetForm = () => {
  formData.email = authStore.currentUser?.email || ''
  formData.currentPassword = ''
  formData.newPassword = ''
  formData.confirmPassword = ''
  errorMessage.value = ''
  successMessage.value = ''
}

// 프로필 업데이트 처리
const handleUpdateProfile = async () => {
  if (!isFormValid.value) return

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const updateData = {
      currentPassword: formData.currentPassword
    }

    // 이메일 변경이 있는 경우
    if (formData.email !== authStore.currentUser?.email) {
      updateData.email = formData.email
    }

    // 비밀번호 변경이 있는 경우
    if (formData.newPassword) {
      updateData.newPassword = formData.newPassword
    }

    const result = await authService.updateProfile(updateData)

    if (result.success) {
      successMessage.value = '프로필이 성공적으로 업데이트되었습니다.'
      uiStore.showSuccess('프로필이 업데이트되었습니다.', '업데이트 성공')

      // 사용자 정보 새로고침
      await authStore.checkAuth()

      // 폼 초기화 (비밀번호 필드만 클리어)
      formData.currentPassword = ''
      formData.newPassword = ''
      formData.confirmPassword = ''
    }
  } catch (error) {
    console.error('Profile update failed:', error)
    errorMessage.value = error.message || '프로필 업데이트에 실패했습니다.'
    uiStore.showError(error.message || '프로필 업데이트에 실패했습니다.', '업데이트 실패')
  } finally {
    loading.value = false
  }
}

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return '-'

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return '-'
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 80px 20px 40px;
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
}

.profile-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px 12px 0 0;
  padding: 40px;
  color: white;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 24px;
}

.user-avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  flex-shrink: 0;
}

.user-info h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
}

.user-role {
  margin: 0 0 4px 0;
  font-size: 14px;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.user-email {
  margin: 0;
  font-size: 16px;
  opacity: 0.8;
}

.profile-content {
  background: white;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
}

.profile-section {
  padding: 32px 40px;
  border-bottom: 1px solid #e9ecef;
}

.profile-section:last-child {
  border-bottom: none;
}

.profile-section h2 {
  margin: 0 0 24px 0;
  font-size: 20px;
  font-weight: 600;
  color: #495057;
}

.profile-form {
  max-width: 500px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #495057;
  font-size: 14px;
}

.form-control {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 15px;
  transition: all 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-text {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #6c757d;
}

.error-message {
  margin-top: 16px;
  padding: 12px;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
  font-size: 14px;
}

.success-message {
  margin-top: 16px;
  padding: 12px;
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  border-radius: 6px;
  font-size: 14px;
}

.button-group {
  display: flex;
  gap: 12px;
  margin-top: 32px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #5a67d8;
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #5c636a;
  transform: translateY(-1px);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-item label {
  font-size: 12px;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item span {
  font-size: 14px;
  color: #495057;
}

.role-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.role-badge.admin {
  background-color: #fef2f2;
  color: #dc2626;
}

.role-badge.user {
  background-color: #f0f9ff;
  color: #2563eb;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .profile-page {
    padding: 70px 16px 20px;
  }

  .profile-header {
    padding: 24px;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .user-avatar-large {
    width: 60px;
    height: 60px;
    font-size: 24px;
  }

  .user-info h1 {
    font-size: 24px;
  }

  .profile-section {
    padding: 24px 20px;
  }

  .button-group {
    flex-direction: column;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
