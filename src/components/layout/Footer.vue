<template>
  <footer class="app-footer">
    <div class="footer-content">
      <div class="footer-copyright">
        Copyright ⓒ Gyeongnam Intelligence Innovation Center. All Rights Reserved.
      </div>
      <button class="footer-login-btn" @click="showLoginModal = true">
        <i class="fas fa-sign-in-alt"></i>
        <span>Login</span>
      </button>
    </div>

    <!-- 로그인 모달 -->
    <LoginModal
      :is-open="showLoginModal"
      @close="showLoginModal = false"
      @login-success="handleLoginSuccess"
    />
  </footer>
</template>

<script setup>
import { ref } from 'vue'
import LoginModal from '@/components/auth/LoginModal.vue'

// ESLint multi-word component name rule을 위해 name 추가
defineOptions({
  name: 'AppFooter',
})

const showLoginModal = ref(false)

const handleLoginSuccess = (userData) => {
  console.log('Login successful:', userData)
  // TODO: 로그인 성공 후 처리 (예: 사용자 정보 저장, 페이지 새로고침 등)
}
</script>

<style scoped>
.app-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
  z-index: 1000;
  display: flex;
  align-items: center;
  padding: 0 24px;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
}

.footer-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-copyright {
  color: #6c757d;
  font-size: 14px;
  font-weight: 400;
}

.footer-login-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  background: rgba(108, 117, 125, 0.1);
  color: #6c757d;
  border: 1px solid rgba(108, 117, 125, 0.2);
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.footer-login-btn:hover {
  background: rgba(108, 117, 125, 0.15);
  border-color: rgba(108, 117, 125, 0.3);
  color: #495057;
  transform: translateY(-1px);
}

.footer-login-btn:active {
  transform: translateY(0);
}

.footer-login-btn i {
  font-size: 14px;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .app-footer {
    padding: 0 16px;
  }

  .footer-copyright {
    font-size: 12px;
  }

  .footer-login-btn {
    padding: 5px 12px;
    font-size: 13px;
  }

  .footer-login-btn span {
    display: none;
  }
}

/* 태블릿 반응형 */
@media (max-width: 1024px) {
  .footer-copyright {
    font-size: 13px;
  }
}
</style>
