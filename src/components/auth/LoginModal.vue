<template>
  <Teleport to="body">
    <transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click="closeModal">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">Login</h3>
            <button class="modal-close" @click="closeModal">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <form @submit.prevent="handleLogin" class="modal-body">
            <div class="form-group">
              <label for="username">ID</label>
              <input
                id="username"
                v-model="formData.username"
                type="text"
                class="form-control"
                placeholder="Enter your ID"
                required
                ref="usernameInput"
                @invalid="setCustomValidity"
              />
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <input
                id="password"
                v-model="formData.password"
                type="password"
                class="form-control"
                placeholder="Enter your password"
                required
                ref="passwordInput"
                @invalid="setCustomValidity"
              />
            </div>

            <div class="modal-footer">
              <button type="submit" class="btn btn-primary" :disabled="loading">
                <span v-if="!loading">Login</span>
                <span v-else> <i class="fas fa-spinner fa-spin"></i> Logging in... </span>
              </button>
              <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
            </div>

            <div class="signup-link">
              <p>
                Don't have an account yet?
                <router-link to="/signup" @click="closeModal">Sign up</router-link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'login-success'])

// Stores
const authStore = useAuthStore()
const uiStore = useUiStore()

// Local state
const formData = reactive({
  username: '',
  password: '',
})

const usernameInput = ref(null)
const passwordInput = ref(null)

// Computed
const loading = computed(() => authStore.isLoading)

// 모달이 닫힐 때 폼 초기화
watch(
  () => props.isOpen,
  (newVal) => {
    if (!newVal) {
      formData.username = ''
      formData.password = ''
      authStore.error = null
    }
  },
)

const closeModal = () => {
  emit('close')
}

const handleLogin = async () => {
  try {
    const result = await authStore.login({
      username: formData.username,
      password: formData.password
    })

    if (result.success) {
      // 성공 알림 표시
      uiStore.showSuccess(`Welcome, ${result.user.username}!`, 'Login Successful')

      emit('login-success', result.user)
      closeModal()
    }
  } catch (error) {
    // 에러 알림 표시
    uiStore.showError(error.message || 'Login failed. Please try again.', 'Login Failed')
  }
}

// 커스텀 유효성 검사 메시지 설정
const setCustomValidity = (event) => {
  const input = event.target
  if (input.validity.valueMissing) {
    input.setCustomValidity('Please fill out this field.')
  } else {
    input.setCustomValidity('')
  }
}

// 입력 필드에 입력이 있을 때 커스텀 메시지 초기화
watch(
  () => formData.username,
  () => {
    if (usernameInput.value) {
      usernameInput.value.setCustomValidity('')
    }
  }
)

watch(
  () => formData.password,
  () => {
    if (passwordInput.value) {
      passwordInput.value.setCustomValidity('')
    }
  }
)
</script>

<style scoped>
/* 모달 오버레이 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

/* 모달 컨테이너 */
.modal-container {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

/* 모달 헤더 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
}

.modal-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #212529;
}

.modal-close {
  background: none;
  border: none;
  font-size: 20px;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background-color: #f8f9fa;
  color: #495057;
}

/* 모달 바디 */
.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
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

.form-control::placeholder {
  color: #adb5bd;
}

/* 체크박스 스타일 */
.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-check-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.form-check-label {
  cursor: pointer;
  user-select: none;
  font-size: 14px;
  color: #495057;
}

/* 모달 푸터 */
.modal-footer {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

/* 버튼 스타일 */
.btn {
  flex: 1;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #0d6efd;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0b5ed7;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #5c636a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}

/* 모달 애니메이션 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from {
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}

/* 모바일 반응형 */
@media (max-width: 480px) {
  .modal-container {
    max-width: 100%;
  }

  .modal-header {
    padding: 16px 20px;
  }

  .modal-body {
    padding: 20px;
  }

  .btn {
    padding: 12px 16px;
  }
}

/* 회원가입 링크 */
.signup-link {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.signup-link p {
  margin: 0;
  font-size: 14px;
  color: #6c757d;
}

.signup-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.signup-link a:hover {
  color: #5a67d8;
  text-decoration: underline;
}
</style>
