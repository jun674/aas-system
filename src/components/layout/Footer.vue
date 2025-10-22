<template>
  <footer class="app-footer">
    <div class="footer-content">
      <div class="footer-copyright">
        Copyright ⓒ Gyeongnam Intelligence Innovation Center. All Rights Reserved.
      </div>

      <div class="footer-auth-buttons">
        <!-- 로그인하지 않은 경우 -->
        <button v-if="!authStore.isAuthenticated" class="footer-login-btn" @click="showLoginModal = true">
          <i class="fas fa-sign-in-alt"></i>
          <span>Login</span>
        </button>

        <!-- 로그인한 경우 -->
        <template v-else>
          <router-link to="/profile" class="footer-profile-btn">
            <i class="fas fa-user"></i>
            <span>내 정보</span>
          </router-link>
          <button class="footer-logout-btn" @click="handleLogout">
            <i class="fas fa-sign-out-alt"></i>
            <span>로그아웃</span>
          </button>
        </template>
      </div>
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
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginModal from '@/components/auth/LoginModal.vue'

// ESLint multi-word component name rule을 위해 name 추가
defineOptions({
  name: 'AppFooter',
})

const router = useRouter()
const authStore = useAuthStore()
const showLoginModal = ref(false)

const handleLoginSuccess = (userData) => {
  console.log('Login successful:', userData)
  showLoginModal.value = false
}

const handleLogout = () => {
  authStore.logout()
  router.push('/')
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

.footer-auth-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.footer-login-btn,
.footer-profile-btn,
.footer-logout-btn {
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
  text-decoration: none;
}

.footer-login-btn:hover,
.footer-profile-btn:hover,
.footer-logout-btn:hover {
  background: rgba(108, 117, 125, 0.15);
  border-color: rgba(108, 117, 125, 0.3);
  color: #495057;
  transform: translateY(-1px);
}

.footer-login-btn:active,
.footer-profile-btn:active,
.footer-logout-btn:active {
  transform: translateY(0);
}

.footer-login-btn i,
.footer-profile-btn i,
.footer-logout-btn i {
  font-size: 14px;
}

.footer-profile-btn {
  background: rgba(134, 239, 172, 0.1);
  color: #059669;
  border-color: rgba(134, 239, 172, 0.3);
}

.footer-profile-btn:hover {
  background: rgba(134, 239, 172, 0.2);
  border-color: rgba(134, 239, 172, 0.4);
  color: #047857;
}

.footer-logout-btn {
  background: rgba(252, 165, 165, 0.1);
  color: #dc2626;
  border-color: rgba(252, 165, 165, 0.3);
}

.footer-logout-btn:hover {
  background: rgba(252, 165, 165, 0.2);
  border-color: rgba(252, 165, 165, 0.4);
  color: #b91c1c;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .app-footer {
    padding: 0 16px;
  }

  .footer-copyright {
    font-size: 12px;
  }

  .footer-login-btn,
  .footer-profile-btn,
  .footer-logout-btn {
    padding: 5px 12px;
    font-size: 13px;
  }

  .footer-login-btn span,
  .footer-profile-btn span,
  .footer-logout-btn span {
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
