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
        :to="{ path: '/search', query: { menu: 'AASX' } }"
        class="nav-link aasx-menu"
        :class="{ active: route.query.menu === 'AASX' }"
        @click="closeMobileNav"
      >
        <i class="fas fa-exchange-alt"></i>
        <span>AASX Upload</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const showMobileNav = ref(false);

const toggleMobileNav = () => {
  showMobileNav.value = !showMobileNav.value;
};

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
  height: 50px;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 1100;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.topbar-brand {
  color: white;
  font-weight: bold;
  font-size: 16px;
  margin-right: 40px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 4px;
}

.brand-logo svg {
  width: 100%;
  height: 100%;
}

.brand-text {
  font-weight: 600;
  letter-spacing: -0.5px;
}

.mobile-nav-toggle {
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 5px 10px;
  margin-left: auto;
}

.topbar-nav {
  display: flex;
  align-items: center;
  gap: 5px;
  flex: 1;
}

.nav-link {
  color: #bdc3c7;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  transition: all 0.2s;
  cursor: pointer;
  white-space: nowrap;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-link.active {
  background-color: rgba(52, 152, 219, 0.3);
  color: white;
}

.nav-link i {
  font-size: 14px;
}

.nav-divider {
  width: 1px;
  height: 20px;
  background-color: rgba(189, 195, 199, 0.3);
  margin: 0 10px;
}

.all-view:hover {
  background-color: rgba(39, 174, 96, 0.2);
}

.all-view.active {
  background-color: rgba(39, 174, 96, 0.3);
}

.aasx-menu:hover {
  background-color: rgba(231, 76, 60, 0.2);
}

.aasx-menu.active {
  background-color: rgba(231, 76, 60, 0.3);
}

/* 모바일 스타일 */
@media (max-width: 768px) {
  .topbar {
    padding: 0 15px;
  }
  
  /* 브랜드 텍스트는 계속 표시 */
  .topbar-brand {
    font-size: 14px; /* 모바일에서 약간 작게 */
    gap: 8px;
  }
  
  .brand-logo {
    width: 28px;
    height: 28px;
  }
  
  .topbar-brand {
    margin-right: auto;
  }
  
  .mobile-nav-toggle {
    display: block;
  }
  
  .topbar-nav {
    position: fixed;
    top: 50px;
    right: -100%;
    width: 280px;
    height: calc(100vh - 50px);
    background: #2c3e50;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    padding: 20px;
    overflow-y: auto;
    transition: right 0.3s ease;
    box-shadow: -2px 0 10px rgba(0,0,0,0.2);
  }
  
  .topbar-nav.mobile-open {
    right: 0;
  }
  
  .nav-link {
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 5px;
  }
  
  .nav-link span {
    display: inline;
  }
  
  .nav-divider {
    width: 100%;
    height: 1px;
    margin: 10px 0;
  }
}

/* 태블릿 스타일 */
@media (min-width: 769px) and (max-width: 1024px) {
  .nav-link {
    padding: 8px 12px;
    font-size: 12px;
  }
  
  .nav-link i {
    display: none;
  }
}
</style>