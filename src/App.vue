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
  </div>
</template>

<script setup>
import TopBar from '@/components/layout/TopBar.vue';
import { RouterView } from 'vue-router';
</script>

<style>
/* 전역 스타일 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background-color: #f8f9fa;
}

.app-container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

/* TopBar 높이(50px)를 제외한 나머지 영역을 페이지 컨텐츠로 설정 */
.page-content-wrapper {
  margin-top: 50px;
  height: calc(100vh - 50px);
  overflow-y: auto; /* 페이지 내용이 길어지면 스크롤 */
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