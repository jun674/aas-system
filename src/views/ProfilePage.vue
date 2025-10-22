<template>
  <div class="profile-page">
    <div class="profile-container">
      <h1 class="page-title">내 정보</h1>

      <div v-if="authStore.currentUser" class="profile-content">
        <div class="profile-section">
          <h2>기본 정보</h2>
          <div class="info-grid">
            <div class="info-item">
              <label>사용자명</label>
              <p>{{ authStore.currentUser.username }}</p>
            </div>
            <div class="info-item">
              <label>이메일</label>
              <p>{{ authStore.currentUser.email }}</p>
            </div>
            <div class="info-item">
              <label>이름</label>
              <p>{{ authStore.currentUser.name || '-' }}</p>
            </div>
            <div class="info-item">
              <label>권한</label>
              <p class="role-badge" :class="authStore.currentUser.role">
                {{ authStore.currentUser.role === 'ADMIN' ? '관리자' : '일반 사용자' }}
              </p>
            </div>
          </div>
        </div>

        <div class="profile-section">
          <h2>비밀번호 변경</h2>
          <form @submit.prevent="changePassword" class="password-form">
            <div class="form-group">
              <label for="currentPassword">현재 비밀번호</label>
              <input
                id="currentPassword"
                v-model="passwordForm.currentPassword"
                type="password"
                required
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label for="newPassword">새 비밀번호</label>
              <input
                id="newPassword"
                v-model="passwordForm.newPassword"
                type="password"
                required
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label for="confirmPassword">새 비밀번호 확인</label>
              <input
                id="confirmPassword"
                v-model="passwordForm.confirmPassword"
                type="password"
                required
                class="form-input"
              />
            </div>
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              {{ isLoading ? '변경 중...' : '비밀번호 변경' }}
            </button>
          </form>
        </div>

        <div class="profile-section">
          <h2>프로필 수정</h2>
          <form @submit.prevent="updateProfile" class="profile-form">
            <div class="form-group">
              <label for="name">이름</label>
              <input
                id="name"
                v-model="profileForm.name"
                type="text"
                required
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label for="email">이메일</label>
              <input
                id="email"
                v-model="profileForm.email"
                type="email"
                required
                class="form-input"
              />
            </div>
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              {{ isLoading ? '수정 중...' : '프로필 수정' }}
            </button>
          </form>
        </div>
      </div>

      <div v-if="message" class="message" :class="messageType">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/services/authService'

const authStore = useAuthStore()

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const profileForm = ref({
  name: '',
  email: ''
})

const isLoading = ref(false)
const message = ref('')
const messageType = ref('')

onMounted(() => {
  if (authStore.currentUser) {
    profileForm.value.name = authStore.currentUser.name || ''
    profileForm.value.email = authStore.currentUser.email || ''
  }
})

const showMessage = (msg, type = 'success') => {
  message.value = msg
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

const changePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    showMessage('새 비밀번호가 일치하지 않습니다.', 'error')
    return
  }

  isLoading.value = true
  try {
    await authService.changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    })

    showMessage('비밀번호가 성공적으로 변경되었습니다.')
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (error) {
    showMessage(error.message || '비밀번호 변경에 실패했습니다.', 'error')
  } finally {
    isLoading.value = false
  }
}

const updateProfile = async () => {
  isLoading.value = true
  try {
    const response = await authService.updateProfile({
      name: profileForm.value.name,
      email: profileForm.value.email
    })

    // 스토어의 사용자 정보 업데이트
    if (response.user) {
      authStore.user = response.user
    }

    showMessage('프로필이 성공적으로 수정되었습니다.')
  } catch (error) {
    showMessage(error.message || '프로필 수정에 실패했습니다.', 'error')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.profile-page {
  min-height: calc(100vh - 56px);
  padding: 24px;
  background-color: #f8fafc;
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 32px;
}

.profile-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.profile-section {
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.profile-section:last-child {
  border-bottom: none;
}

.profile-section h2 {
  font-size: 20px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item label {
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
}

.info-item p {
  font-size: 16px;
  color: #1e293b;
  margin: 0;
}

.role-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  width: fit-content;
}

.role-badge.ADMIN {
  background-color: #fef3c7;
  color: #92400e;
}

.role-badge.USER {
  background-color: #dbeafe;
  color: #1e40af;
}

.password-form,
.profile-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 400px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.form-input {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 16px;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  width: fit-content;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.message {
  margin-top: 20px;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
}

.message.success {
  background-color: #d1fae5;
  color: #065f46;
}

.message.error {
  background-color: #fee2e2;
  color: #991b1b;
}

@media (max-width: 768px) {
  .profile-page {
    padding: 16px;
  }

  .page-title {
    font-size: 24px;
    margin-bottom: 24px;
  }

  .profile-section {
    padding: 20px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
