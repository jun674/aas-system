<template>
  <div class="tree-view">
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner">
        <i class="fas fa-circle-notch fa-spin"></i>
      </div>
      <p class="loading-text">Loading...</p>
    </div>
    <div v-else-if="error" class="error-state">
      <div class="error-container">
        <i class="fas fa-exclamation-circle error-icon"></i>
        <p class="error-message">{{ error }}</p>
        <button class="retry-btn" @click="$emit('retry')">
          <i class="fas fa-redo"></i>
          Try Again
        </button>
      </div>
    </div>
    <!-- 데이터가 없을 때는 빈 상태를 표시하지 않음 (자동 로딩이 있을 수 있으므로) -->
    <div v-else-if="!treeData || treeData.length === 0" class="empty-state">
      <div class="empty-container">
        <i class="fas fa-search empty-icon"></i>
        <h3>No Data Available</h3>
        <p v-if="!loading">Start searching to explore the AAS system</p>
      </div>
    </div>
    <div v-else class="tree-container">
      <div class="tree-content" @scroll="handleScroll">
        <TreeNode
          v-for="node in treeData"
          :key="node.id"
          :node="node"
          :level="0"
          @toggle="onToggle"
          @select="onSelect"
        />
      </div>
    </div>
  </div>
</template>

<script>
import TreeNode from './TreeNode.vue' // TreeNode 컴포넌트 import
import { nextTick } from 'vue'

export default {
  name: 'TreeView',
  components: {
    TreeNode, // 컴포넌트 등록
  },
  props: {
    treeData: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    error: {
      type: String,
      default: null,
    },
  },
  emits: ['node-toggle', 'node-select', 'retry', 'scrolled-to-bottom'],
  setup(props, { emit }) {
    const onToggle = (nodeId) => {
      console.log('TreeView onToggle 호출:', nodeId) // 디버깅 로그
      // 현재 스크롤 위치 저장
      const treeContent = document.querySelector('.tree-content')
      const scrollTop = treeContent ? treeContent.scrollTop : 0

      emit('node-toggle', nodeId)

      // 스크롤 위치 복원 (다음 렌더링 사이클에)
      nextTick(() => {
        if (treeContent) {
          treeContent.scrollTop = scrollTop
        }
      })
    }
    const onSelect = (node) => {
      emit('node-select', node)
    }

    const handleScroll = (event) => {
      const { scrollTop, scrollHeight, clientHeight } = event.target
      // 사용자가 스크롤을 거의 끝까지 내렸을 때 이벤트를 발생시킵니다.
      if (scrollHeight > clientHeight && scrollHeight - scrollTop <= clientHeight + 200) {
        emit('scrolled-to-bottom')
      }
    }

    return {
      onToggle,
      onSelect,
      handleScroll,
    }
  },
}
</script>

<style scoped>
.tree-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  background: #fafbfc;
}

.tree-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  box-sizing: border-box;
}

.tree-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
  padding: 15px;
  background: white;
}

/* 스크롤바 스타일링 */
.tree-content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.tree-content::-webkit-scrollbar-track {
  background: #f1f3f4;
  border-radius: 4px;
}

.tree-content::-webkit-scrollbar-thumb {
  background: #dadce0;
  border-radius: 4px;
}

.tree-content::-webkit-scrollbar-thumb:hover {
  background: #bdc1c6;
}

/* 로딩 상태 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: white;
}

.loading-spinner {
  font-size: 3em;
  color: #667eea;
  margin-bottom: 20px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
    transform: scale(0.95);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0.6;
    transform: scale(0.95);
  }
}

.loading-text {
  font-size: 16px;
  color: #586069;
  margin: 0;
}

/* 빈 상태 */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: white;
}

.empty-container {
  text-align: center;
  padding: 40px;
}

.empty-icon {
  font-size: 4em;
  color: #e1e4e8;
  margin-bottom: 20px;
  display: block;
}

.empty-container h3 {
  font-size: 20px;
  color: #24292e;
  margin: 0 0 10px 0;
  font-weight: 600;
}

.empty-container p {
  font-size: 14px;
  color: #586069;
  margin: 0;
}

/* 에러 상태 */
.error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: white;
}

.error-container {
  text-align: center;
  padding: 40px;
}

.error-icon {
  font-size: 4em;
  color: #d73a49;
  margin-bottom: 20px;
  display: block;
}

.error-message {
  font-size: 16px;
  color: #24292e;
  margin: 0 0 20px 0;
}

.retry-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: #5a67d8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.retry-btn i {
  font-size: 14px;
}
</style>
