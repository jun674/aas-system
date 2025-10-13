<template>
  <div class="signup-page">
    <div class="signup-container">
      <div class="signup-header">
        <h1>Sign Up</h1>
        <p>Create your new account</p>
      </div>

      <form @submit.prevent="handleSignup" class="signup-form">
        <div class="form-group">
          <label for="userId">User ID <span class="required">*</span></label>
          <div class="input-with-button">
            <input
              id="userId"
              v-model="formData.userId"
              type="text"
              class="form-control"
              placeholder="4-20 characters (letters and numbers)"
              required
              @input="resetDuplicateCheck"
              @invalid="setCustomValidity"
            />
            <button
              type="button"
              class="btn btn-outline"
              @click="checkDuplicate"
              :disabled="!formData.userId || formData.userId.length < 4"
            >
              Check
            </button>
          </div>
          <span v-if="duplicateChecked && !duplicateExists" class="success-message">
            <i class="fas fa-check-circle"></i> This ID is available.
          </span>
          <span v-if="duplicateChecked && duplicateExists" class="error-message">
            <i class="fas fa-times-circle"></i> This ID is already taken.
          </span>
        </div>

        <div class="form-group">
          <label for="password">Password <span class="required">*</span></label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            class="form-control"
            placeholder="At least 8 characters with letters, numbers, and special characters"
            required
            @input="validatePassword"
            @invalid="setCustomValidity"
          />
          <div v-if="passwordError" class="error-message">
            <i class="fas fa-exclamation-circle"></i> {{ passwordError }}
          </div>
        </div>

        <div class="form-group">
          <label for="passwordConfirm">Confirm Password <span class="required">*</span></label>
          <input
            id="passwordConfirm"
            v-model="formData.passwordConfirm"
            type="password"
            class="form-control"
            placeholder="Please enter your password again"
            required
            @input="checkPasswordMatch"
            @invalid="setCustomValidity"
          />
          <div v-if="passwordMatchError" class="error-message">
            <i class="fas fa-exclamation-circle"></i> {{ passwordMatchError }}
          </div>
        </div>

        <div class="form-group">
          <label for="email">Email <span class="required">*</span></label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            class="form-control"
            placeholder="example@email.com"
            required
            @invalid="setCustomValidity"
          />
        </div>

        <!-- 버튼 그룹 -->
        <div class="button-group">
          <button type="button" class="btn btn-secondary" @click="goToLogin">Cancel</button>
          <button type="submit" class="btn btn-primary" :disabled="!isFormValid || loading">
            <span v-if="!loading">Sign Up</span>
            <span v-else> <i class="fas fa-spinner fa-spin"></i> Processing... </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 폼 데이터
const formData = reactive({
  userId: '',
  password: '',
  passwordConfirm: '',
  email: '',
})

// 상태 관리
const loading = ref(false)
const duplicateChecked = ref(false)
const duplicateExists = ref(false)
const passwordError = ref('')
const passwordMatchError = ref('')

// 폼 유효성 검사
const isFormValid = computed(() => {
  return (
    formData.userId &&
    formData.password &&
    formData.passwordConfirm &&
    formData.email &&
    !passwordError.value &&
    !passwordMatchError.value &&
    duplicateChecked.value &&
    !duplicateExists.value
  )
})

// 아이디 중복 확인
const checkDuplicate = async () => {
  if (!formData.userId || formData.userId.length < 4) return

  // 실제로는 API 호출
  // 임시로 랜덤하게 중복 여부 결정
  duplicateChecked.value = true
  duplicateExists.value = Math.random() > 0.7 // 30% 확률로 중복
}

// 중복 확인 초기화
const resetDuplicateCheck = () => {
  duplicateChecked.value = false
  duplicateExists.value = false
}

// 비밀번호 유효성 검사
const validatePassword = () => {
  const password = formData.password
  if (!password) {
    passwordError.value = ''
    return
  }

  if (password.length < 8) {
    passwordError.value = 'Password must be at least 8 characters long.'
  } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(password)) {
    passwordError.value = 'Password must contain letters, numbers, and special characters.'
  } else {
    passwordError.value = ''
  }

  // 비밀번호 확인도 다시 체크
  if (formData.passwordConfirm) {
    checkPasswordMatch()
  }
}

// 비밀번호 일치 확인
const checkPasswordMatch = () => {
  if (!formData.passwordConfirm) {
    passwordMatchError.value = ''
    return
  }

  if (formData.password !== formData.passwordConfirm) {
    passwordMatchError.value = 'Passwords do not match.'
  } else {
    passwordMatchError.value = ''
  }
}

// 회원가입 처리
const handleSignup = async () => {
  if (!isFormValid.value) return

  loading.value = true

  try {
    // TODO: 실제 회원가입 API 호출
    await new Promise((resolve) => setTimeout(resolve, 2000))

    alert('Sign up completed successfully!')
    router.push('/')
  } catch (error) {
    console.error('Signup failed:', error)
    alert('Sign up failed. Please try again.')
  } finally {
    loading.value = false
  }
}

// 로그인 페이지로 이동
const goToLogin = () => {
  router.push('/')
}

// 커스텀 유효성 검사 메시지 설정
const setCustomValidity = (event) => {
  const input = event.target
  if (input.validity.valueMissing) {
    input.setCustomValidity('Please fill out this field.')
  } else if (input.validity.typeMismatch && input.type === 'email') {
    input.setCustomValidity('Please enter a valid email address.')
  } else {
    input.setCustomValidity('')
  }
}
</script>

<style scoped>
.signup-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.signup-container {
  width: 100%;
  max-width: 450px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.signup-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px;
  text-align: center;
}

.signup-header h1 {
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 700;
}

.signup-header p {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
}

.signup-form {
  padding: 40px;
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

.required {
  color: #dc3545;
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

.input-with-button {
  display: flex;
  gap: 10px;
}

.input-with-button .form-control {
  flex: 1;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
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
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
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

.btn-outline {
  background-color: white;
  color: #667eea;
  border: 1px solid #667eea;
}

.btn-outline:hover:not(:disabled) {
  background-color: #667eea;
  color: white;
}

.success-message {
  display: block;
  margin-top: 6px;
  color: #28a745;
  font-size: 13px;
}

.error-message {
  display: block;
  margin-top: 6px;
  color: #dc3545;
  font-size: 13px;
}

.button-group {
  display: flex;
  gap: 12px;
  margin-top: 32px;
}

.button-group .btn {
  flex: 1;
}

/* 반응형 디자인 */
@media (max-width: 480px) {
  .signup-header {
    padding: 30px 20px;
  }

  .signup-header h1 {
    font-size: 28px;
  }

  .signup-form {
    padding: 30px 20px;
  }

  .button-group {
    flex-direction: column;
  }

  .button-group .btn {
    width: 100%;
  }
}
</style>
