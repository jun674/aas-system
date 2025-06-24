<template>
  <div class="topbar">
    <router-link to="/" class="topbar-brand" style="text-decoration: none; color: white;">
      <i class="fas fa-server"></i>
      AAS System
    </router-link>
    
    <nav class="topbar-nav">
      <router-link 
        :to="{ path: '/search', query: { category: 'equipment' } }"
        class="nav-link"
        :class="{ active: route.query.category === 'equipment' || (!route.query.category && !route.query.menu && route.path ==='/search') }"
      >
        <i class="fas fa-cogs"></i>
        Equipment
      </router-link>

      <router-link 
        :to="{ path: '/search', query: { category: 'material' } }"
        class="nav-link"
        :class="{ active: route.query.category === 'material' }"
      >
        <i class="fas fa-cube"></i>
        Material
      </router-link>

      <router-link 
        :to="{ path: '/search', query: { category: 'process' } }"
        class="nav-link"
        :class="{ active: route.query.category === 'process' }"
      >
        <i class="fas fa-sync-alt"></i>
        Process
      </router-link>

      <router-link 
        :to="{ path: '/search', query: { category: 'operation' } }"
        class="nav-link"
        :class="{ active: route.query.category === 'operation' }"
      >
        <i class="fas fa-tachometer-alt"></i>
        Operation
      </router-link>

      <router-link 
        :to="{ path: '/search', query: { category: 'quality' } }"
        class="nav-link"
        :class="{ active: route.query.category === 'quality' }"
      >
        <i class="fas fa-check-circle"></i>
        Quality
      </router-link>

      <router-link 
        :to="{ path: '/search', query: { category: 'production' } }"
        class="nav-link"
        :class="{ active: route.query.category === 'production' }"
      >
        <i class="fas fa-industry"></i>
        Production
      </router-link>

      <div class="nav-divider"></div>

      <router-link 
        :to="{ path: '/search', query: { menu: 'ALL' } }"
        class="nav-link all-view"
        :class="{ active: route.query.menu === 'ALL' }"
      >
        <i class="fas fa-globe"></i>
        All AAS Data
      </router-link>

      <router-link 
        :to="{ path: '/search', query: { menu: 'AASX' } }"
        class="nav-link aasx-menu"
        :class="{ active: route.query.menu === 'AASX' }"
      >
        <i class="fas fa-exchange-alt"></i>
        AASX Upload
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();
</script>

<style scoped>
/* style 부분은 변경 사항 없습니다. */
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
  gap: 8px;
}
.topbar-brand i {
  font-size: 18px;
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
</style>