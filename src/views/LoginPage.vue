<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <div class="brand-logo">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="7" height="7" rx="1" fill="white" opacity="0.9"/>
            <rect x="14" y="3" width="7" height="7" rx="1" fill="white" opacity="0.7"/>
            <rect x="3" y="14" width="7" height="7" rx="1" fill="white" opacity="0.7"/>
            <rect x="14" y="14" width="7" height="7" rx="1" fill="white" opacity="0.5"/>
            <line x1="10" y1="6.5" x2="14" y2="6.5" stroke="white" stroke-width="1.5" opacity="0.6"/>
            <line x1="6.5" y1="10" x2="6.5" y2="14" stroke="white" stroke-width="1.5" opacity="0.6"/>
            <line x1="17.5" y1="10" x2="17.5" y2="14" stroke="white" stroke-width="1.5" opacity="0.6"/>
            <line x1="10" y1="17.5" x2="14" y2="17.5" stroke="white" stroke-width="1.5" opacity="0.6"/>
          </svg>
        </div>
        <h1>AAS System</h1>
        <p>Welcome back! Please sign in to your account</p>
      </div>

      <div class="login-form-section">
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="username">Username</label>
            <div class="input-wrapper">
              <i class="fas fa-user input-icon"></i>
              <input
                id="username"
                v-model="formData.username"
                type="text"
                class="form-control"
                placeholder="Enter your username"
                required
                :disabled="loading"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <div class="input-wrapper">
              <i class="fas fa-lock input-icon"></i>
              <input
                id="password"
                v-model="formData.password"
                type="password"
                class="form-control"
                placeholder="Enter your password"
                required
                :disabled="loading"
              />
            </div>
          </div>

          <div v-if="errorMessage" class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            {{ errorMessage }}
          </div>

          <button type="submit" class="login-btn" :disabled="loading || !isFormValid">
            <span v-if="!loading">
              <i class="fas fa-sign-in-alt"></i>
              Sign In
            </span>
            <span v-else>
              <i class="fas fa-spinner fa-spin"></i>
              Signing In...
            </span>
          </button>
        </form>

        <div class="login-footer">
          <p>Don't have an account?
            <router-link to="/signup" class="signup-link">Sign up here</router-link>
          </p>
          <router-link to="/" class="back-link">
            <i class="fas fa-arrow-left"></i>
            Back to Home
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const uiStore = useUiStore()

// 폼 데이터
const formData = reactive({
  username: '',
  password: ''
})

// 상태 관리
const loading = ref(false)
const errorMessage = ref('')

// 계산된 속성
const isFormValid = computed(() => {
  return formData.username.trim() && formData.password.trim()
})

// 컴포넌트 마운트 시 이미 로그인된 경우 리다이렉트
onMounted(() => {
  if (authStore.isAuthenticated) {
    const redirectTo = route.query.redirect || '/'
    router.push(redirectTo)
  }
})

// 로그인 처리
const handleLogin = async () => {
  if (!isFormValid.value) return

  loading.value = true
  errorMessage.value = ''

  try {
    const result = await authStore.login({
      username: formData.username.trim(),
      password: formData.password
    })

    if (result.success) {
      uiStore.showSuccess(`Welcome back, ${result.user.username}!`, 'Login Successful')

      // 리다이렉트 처리
      const redirectTo = route.query.redirect || '/'
      router.push(redirectTo)
    }
  } catch (error) {
    console.error('Login failed:', error)
    errorMessage.value = error.message || 'Login failed. Please check your credentials and try again.'
    uiStore.showError(error.message || 'Login failed', 'Login Error')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  width: 100%;
  max-width: 400px;
}

.login-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 32px;
  text-align: center;
}

.brand-logo {
  margin-bottom: 16px;
}

.login-header h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.login-header p {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
}

.login-form-section {
  padding: 32px;
}

.login-form {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 16px;
  z-index: 1;
}

.form-control {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.2s ease;
  background: white;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-control:focus + .input-icon {
  color: #667eea;
}

.form-control:disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
}

.error-message {
  margin-bottom: 20px;
  padding: 12px;
  background-color: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.login-btn {
  width: 100%;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.login-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.login-footer p {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #6b7280;
}

.signup-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.signup-link:hover {
  color: #5a67d8;
  text-decoration: underline;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #6b7280;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s ease;
}

.back-link:hover {
  color: #374151;
}

.back-link i {
  font-size: 12px;
}

/* 모바일 반응형 */
@media (max-width: 480px) {
  .login-page {
    padding: 16px;
  }

  .login-container {
    max-width: 100%;
  }

  .login-header {
    padding: 32px 24px;
  }

  .login-header h1 {
    font-size: 24px;
  }

  .login-form-section {
    padding: 24px;
  }
}

/* 애니메이션 */
.login-container {
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
