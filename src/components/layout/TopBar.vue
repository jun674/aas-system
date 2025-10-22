<template>
  <div class="topbar">
    <router-link to="/" class="topbar-brand" style="text-decoration: none; color: white;">
      <div class="brand-logo">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      <span class="brand-text">AAS System</span>
    </router-link>

    <!-- 모바일 메뉴 토글 버튼 -->
    <button
      class="mobile-nav-toggle"
      @click="toggleMobileNav"
    >
      <i class="fas" :class="showMobileNav ? 'fa-times' : 'fa-ellipsis-v'"></i>
    </button>

    <!-- 데스크톱/모바일 네비게이션 -->
    <nav class="topbar-nav" :class="{ 'mobile-open': showMobileNav }">
      <router-link
        :to="{ path: '/search', query: { category: 'equipment' } }"
        class="nav-link"
        :class="{ active: route.query.category === 'equipment' || (!route.query.category && !route.query.menu && route.path ==='/search') }"
        @click="closeMobileNav"
      >
        <i class="fas fa-cogs"></i>
        <span>Equipment</span>
      </router-link>

      <router-link
        :to="{ path: '/search', query: { category: 'material' } }"
        class="nav-link"
        :class="{ active: route.query.category === 'material' }"
        @click="closeMobileNav"
      >
        <i class="fas fa-cube"></i>
        <span>Material</span>
      </router-link>

      <router-link
        :to="{ path: '/search', query: { category: 'process' } }"
        class="nav-link"
        :class="{ active: route.query.category === 'process' }"
        @click="closeMobileNav"
      >
        <i class="fas fa-sync-alt"></i>
        <span>Process</span>
      </router-link>

      <router-link
        :to="{ path: '/search', query: { category: 'operation' } }"
        class="nav-link"
        :class="{ active: route.query.category === 'operation' }"
        @click="closeMobileNav"
      >
        <i class="fas fa-tachometer-alt"></i>
        <span>Operation</span>
      </router-link>

      <router-link
        :to="{ path: '/search', query: { category: 'quality' } }"
        class="nav-link"
        :class="{ active: route.query.category === 'quality' }"
        @click="closeMobileNav"
      >
        <i class="fas fa-check-circle"></i>
        <span>Quality</span>
      </router-link>

      <router-link
        :to="{ path: '/search', query: { category: 'production' } }"
        class="nav-link"
        :class="{ active: route.query.category === 'production' }"
        @click="closeMobileNav"
      >
        <i class="fas fa-industry"></i>
        <span>Production</span>
      </router-link>

      <div class="nav-divider"></div>

      <router-link
        :to="{ path: '/search', query: { menu: 'ALL' } }"
        class="nav-link all-view"
        :class="{ active: route.query.menu === 'ALL' }"
        @click="closeMobileNav"
      >
        <i class="fas fa-globe"></i>
        <span>All AAS Data</span>
      </router-link>

      <router-link
        v-if="authStore.isAuthenticated && authStore.userRole === 'ADMIN'"
        :to="{ path: '/search', query: { menu: 'AASX' } }"
        class="nav-link aasx-menu"
        :class="{ active: route.query.menu === 'AASX' }"
        @click="closeMobileNav"
      >
        <i class="fas fa-exchange-alt"></i>
        <span>AASX Upload</span>
      </router-link>

      <!-- 회원 관리 버튼 (관리자만) -->
      <router-link
        v-if="authStore.isAuthenticated && authStore.userRole === 'ADMIN'"
        to="/users"
        class="nav-link admin-button"
        @click="closeMobileNav"
      >
        <i class="fas fa-users-cog"></i>
        <span>회원 관리</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

// 현재 라우트 객체를 가져와서 'active' 클래스 바인딩에 사용
const route = useRoute();
const authStore = useAuthStore();

// 모바일 네비게이션 메뉴의 표시 여부를 제어하는 반응형 상태
const showMobileNav = ref(false);

// 모바일 네비게이션 토글 버튼 클릭 시 호출되는 함수
const toggleMobileNav = () => {
  showMobileNav.value = !showMobileNav.value;
};

// 네비게이션 링크 클릭 시 모바일 메뉴를 닫는 함수
const closeMobileNav = () => {
  showMobileNav.value = false;
};
</script>

<style scoped>
.topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  z-index: 1100;
  display: flex;
  align-items: center;
  padding: 0 24px;
}

.topbar-brand {
  color: white;
  font-weight: 700;
  font-size: 18px;
  margin-right: 48px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: opacity 0.2s ease;
}

.topbar-brand:hover {
  opacity: 0.9;
}

.brand-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 6px;
  backdrop-filter: blur(10px);
}

.brand-logo svg {
  width: 100%;
  height: 100%;
}

.brand-text {
  font-weight: 700;
  letter-spacing: -0.5px;
  font-size: 17px;
}

.mobile-nav-toggle {
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  margin-left: auto;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.mobile-nav-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
}

.topbar-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.nav-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  padding: 8px 14px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  white-space: nowrap;
  position: relative;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-link.active {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 8px;
  right: 8px;
  height: 2px;
  background: #60a5fa;
  border-radius: 2px;
}

.nav-link i {
  font-size: 16px;
  opacity: 0.9;
}

.nav-link:hover i,
.nav-link.active i {
  opacity: 1;
}

.nav-divider {
  width: 1px;
  height: 24px;
  background-color: rgba(255, 255, 255, 0.2);
  margin: 0 12px;
}

.all-view {
  color: #86efac;
}

.all-view:hover {
  background-color: rgba(134, 239, 172, 0.15);
  color: #86efac;
}

.all-view.active {
  background-color: rgba(134, 239, 172, 0.25);
  color: #86efac;
}

.all-view.active::after {
  background: #86efac;
}

.aasx-menu {
  color: #fca5a5;
}

.aasx-menu:hover {
  background-color: rgba(252, 165, 165, 0.15);
  color: #fca5a5;
}

.aasx-menu.active {
  background-color: rgba(252, 165, 165, 0.25);
  color: #fca5a5;
}

.aasx-menu.active::after {
  background: #fca5a5;
}

/* 관리자 버튼 스타일 */
.admin-button {
  color: #fbbf24;
  margin-left: 12px;
}

.admin-button:hover {
  background-color: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}

/* 모바일 스타일 */
@media (max-width: 768px) {
  .topbar {
    padding: 0 16px;
    height: 52px;
  }

  .topbar-brand {
    font-size: 16px;
    gap: 10px;
  }

  .brand-logo {
    width: 32px;
    height: 32px;
  }

  .topbar-brand {
    margin-right: auto;
  }

  .mobile-nav-toggle {
    display: block;
  }

  .topbar-nav {
    position: fixed;
    top: 52px;
    right: -100%;
    width: 280px;
    height: calc(100vh - 52px);
    background: #1e293b;
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
    padding: 20px;
    overflow-y: auto;
    transition: right 0.3s ease;
    box-shadow: -4px 0 12px rgba(0,0,0,0.3);
  }

  .topbar-nav.mobile-open {
    right: 0;
  }

  .nav-link {
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 4px;
  }

  .nav-link.active::after {
    display: none;
  }

  .nav-link span {
    display: inline;
  }

  .nav-divider {
    width: 100%;
    height: 1px;
    margin: 12px 0;
  }
}

/* 태블릿 스타일 */
@media (min-width: 769px) and (max-width: 1024px) {
  .nav-link {
    padding: 8px 12px;
    font-size: 13px;
  }

  .nav-link i {
    display: none;
  }
}

/* 호버 효과 강화 */
@media (hover: hover) {
  .nav-link {
    position: relative;
    overflow: hidden;
  }

  .nav-link::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(0,0,0,0.05) 0%, transparent 70%);
    transform: scale(0);
    transition: transform 0.3s ease;
  }

  .nav-link:hover::before {
    transform: scale(1);
  }
}
</style>
