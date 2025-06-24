<!-- src/components/common/TreeView.vue -->
<template>
  <div class="tree-view">
    <div v-if="loading" class="loading-spinner">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div v-else-if="error" class="error-state">
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-triangle me-2"></i>
        {{ error }}
      </div>
    </div>
    <div v-else-if="!treeData || treeData.length === 0" class="empty-state">
      <i class="fas fa-search fa-2x mb-3"></i>
      <p>Start by searching</p>
    </div>
    <div v-else class="tree-container">
      <!-- <div class="tree-header">
        <small class="text-muted">검색 결과:</small>
      </div> -->
      <div class="tree-content">
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
import TreeNode from './TreeNode.vue' // TreeNode 컴포넌트 import 추가
import { nextTick } from 'vue'

export default {
  name: 'TreeView',
  components: { 
    TreeNode  // 컴포넌트 등록
  },
  props: {
    treeData: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    error: {  // 이 부분 추가
      type: String,
      default: null
    }
  },
  emits: ['node-toggle', 'node-select'],
  setup(props, { emit }) {
    const onToggle = (nodeId) => {
      console.log('TreeView onToggle 호출:', nodeId)  // 🔍 디버깅 로그
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
    return { 
      onToggle, 
      onSelect 
    }
  }
}
</script>

<style scoped>
.tree-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative; /* 이 줄 추가 */
}

.tree-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 15px;
  height: 100%; /* 이 줄 추가 */
  box-sizing: border-box; /* 이 줄 추가 */
}

/* .tree-header {
  flex-shrink: 0;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #dee2e6;
} */

.tree-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
  padding-right: 10px;
  padding-bottom: 20px; /* 이 줄 추가 */
}

/* 스크롤바 스타일링 */
.tree-content::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.tree-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 5px;
}

.tree-content::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 5px;
}

.tree-content::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
}

.error-state {
  text-align: center;
  padding: 40px 20px;
}

.error-state .alert {
  display: inline-block;
  margin: 0;
}
</style>