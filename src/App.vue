<template>
  <div class="app-container">
    <TopBar />

    <div class="page-content-wrapper">
      <router-view v-slot="{ Component, route }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import TopBar from '@/components/layout/TopBar.vue'
import AppFooter from '@/components/layout/Footer.vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

const authStore = useAuthStore()
const uiStore = useUiStore()

// 앱 시작 시 인증 상태 확인 및 UI 초기화
onMounted(async () => {
  // UI 초기화 (화면 크기 체크 및 이벤트 리스너 등록)
  uiStore.initializeUi()

  if (authStore.token) {
    try {
      await authStore.checkAuth()
    } catch (error) {
      console.error('Auth check failed:', error)
    }
  }
})

// 앱 종료 시 정리
onUnmounted(() => {
  // UI 정리 (이벤트 리스너 제거 및 타이머 정리)
  uiStore.cleanupUi()
})
</script>

<style>
/* 전역 스타일 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f8f9fa;
}

.app-container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

/* TopBar 높이(50px)와 Footer 높이(50px)를 제외한 나머지 영역을 페이지 컨텐츠로 설정 */
.page-content-wrapper {
  margin-top: 50px;
  height: calc(100vh - 100px); /* TopBar(50px) + Footer(50px) = 100px */
  overflow-y: auto; /* 페이지 내용이 길어지면 스크롤 */
  padding-bottom: 20px; /* Footer와의 여백 */
}

/* 페이지 전환 효과 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
