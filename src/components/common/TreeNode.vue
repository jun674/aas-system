<template>
  <div class="tree-node">
    <div
      class="tree-node-content"
      :class="{
        selected: node.selected,
        'has-value': node.hasValue && node.isMatched,
        'is-expandable': hasChildren
      }"
      @click="selectNode"
      @dblclick="handleDoubleClick"
      :style="{ paddingLeft: `${level * 24 + 8}px` }"
    >
      <span
        class="tree-node-toggle"
        @click.stop="toggleNode"
        v-if="hasChildren"
      >
        <i
          class="fas fa-chevron-right"
          :class="{ 'expanded': node.expanded }"
        ></i>
      </span>
      <span v-else class="tree-node-spacer"></span>

      <span class="node-type-badge" :class="getNodeIconClass(node.type)">
        {{ getNodeTypeChar(node.type) }}
      </span>

      <span class="tree-node-name" :title="node.name">
        {{ node.name }}
        <span v-if="node.hasValue && node.isMatched" class="matched-indicator">
          <i class="fas fa-check-circle"></i>
        </span>
      </span>
    </div>

    <div
      v-if="node.expanded && node.children && node.children.length > 0 && node.children[0].type !== 'placeholder'"
      class="tree-node-children"
    >
      <TreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :level="level + 1"
        @toggle="$emit('toggle', $event)"
        @select="$emit('select', $event)"
      />
    </div>
    <div v-else-if="node.expanded && node.children && node.children.length === 1 && node.children[0].type === 'placeholder'" class="loading-placeholder">
        <i class="fas fa-circle-notch fa-spin"></i>
        <span>Loading...</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TreeNode',
  props: {
    node: {
      type: Object,
      required: true
    },
    level: {
      type: Number,
      default: 0
    }
  },
  emits: ['toggle', 'select'],
  computed: {
    hasChildren() {
      // children 배열에 실제 자식 노드가 있거나, Lazy Loading을 위한 placeholder가 있을 때만 true
      return this.node.children && this.node.children.length > 0;
    }
  },
  methods: {
    toggleNode() {
      console.log('TreeNode 토글:', this.node.id, '현재 상태:', this.node.expanded);
      // 자식이 있거나, Lazy Loading을 위한 placeholder가 있을 때만 토글 가능
      if (this.node.children && this.node.children.length > 0) {
        this.$emit('toggle', this.node.id)
      }
    },
    selectNode() {
      console.log('TreeNode 선택:', this.node.id);
      this.$emit('select', this.node)
    },
    handleDoubleClick() {
      // 더블클릭 시 토글
      if (this.hasChildren) {
        this.toggleNode()
      }
    },
    getNodeTypeChar(type) {
      // 타입별 표시 텍스트 - 짧은 아이콘 스타일
      const charMap = {
        'equipment': 'A',
        'aas': 'A',
        'submodel': 'S',
        'collection': 'C',
        'property': 'P',
        'multilanguageproperty': 'M',
        'file': 'F',
        'reference': 'R',
        'range': 'R',
        'blob': 'B',
        'element': 'E',
        'placeholder': '•'
      }
      return charMap[type] || '•'
    },
    getNodeIcon(type) {
      // 타입별 아이콘
      const iconMap = {
        'equipment': 'fas fa-server',
        'aas': 'fas fa-server',
        'submodel': 'fas fa-folder',
        'collection': 'fas fa-layer-group',
        'property': 'fas fa-tag',
        'multilanguageproperty': 'fas fa-language',
        'file': 'fas fa-file',
        'reference': 'fas fa-link',
        'range': 'fas fa-arrows-alt-h',
        'blob': 'fas fa-database',
        'element': 'fas fa-cube',
        'placeholder': 'fas fa-ellipsis-h'
      }
      return iconMap[type] || 'fas fa-circle'
    },
    getNodeIconClass(type) {
      // 타입별 스타일 클래스
      const classMap = {
        'equipment': 'badge-equipment',
        'aas': 'badge-equipment',
        'submodel': 'badge-submodel',
        'collection': 'badge-collection',
        'property': 'badge-property',
        'multilanguageproperty': 'badge-multilanguage',
        'file': 'badge-file',
        'reference': 'badge-reference',
        'range': 'badge-range',
        'blob': 'badge-blob',
        'element': 'badge-element',
        'placeholder': 'badge-placeholder'
      }
      return classMap[type] || 'badge-default'
    }
  }
}
</script>

<style scoped>
.tree-node {
  user-select: none;
  position: relative;
}

.tree-node-content {
  display: flex;
  align-items: center;
  padding: 4px 10px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-size: 13px;
  min-height: 28px;
  position: relative;
  margin: 1px 0;
}

.tree-node-content:hover {
  background-color: #f6f8fa;
}

.tree-node-content.selected {
  background-color: #e7f3ff;
  box-shadow: inset 0 0 0 1px #667eea;
}

.tree-node-content.has-value {
  background-color: #fff8e1;
}

.tree-node-content.is-expandable {
  font-weight: 500;
}

/* 토글 버튼 */
.tree-node-toggle {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #586069;
  flex-shrink: 0;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.tree-node-toggle:hover {
  background-color: #e1e4e8;
  color: #24292e;
}

.tree-node-toggle i {
  font-size: 12px;
  transition: transform 0.2s ease;
}

.tree-node-toggle i.expanded {
  transform: rotate(90deg);
}

.tree-node-spacer {
  width: 20px;
  flex-shrink: 0;
}

/* 노드 타입 배지 - 아이콘 스타일 */
.node-type-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 700;
  margin-right: 8px;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

/* 배지 색상 - 채도를 낮춘 심플한 색상 */
.badge-equipment {
  background: #e3e8f7;
  color: #5469d4;
  border: 1px solid #c7d2fe;
}

.badge-submodel {
  background: #fef3e2;
  color: #d97706;
  border: 1px solid #fed7aa;
}

.badge-collection {
  background: #e5e7eb;
  color: #4b5563;
  border: 1px solid #d1d5db;
}

.badge-property {
  background: #e6f4ea;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.badge-multilanguage {
  background: #e0f2fe;
  color: #0369a1;
  border: 1px solid #bae6fd;
}

.badge-file {
  background: #f3e8ff;
  color: #7c3aed;
  border: 1px solid #ddd6fe;
}

.badge-reference {
  background: #fce7f3;
  color: #be185d;
  border: 1px solid #fbcfe8;
}

.badge-range {
  background: #ecfeff;
  color: #0891b2;
  border: 1px solid #cffafe;
}

.badge-blob {
  background: #fef3c7;
  color: #d97706;
  border: 1px solid #fde68a;
}

.badge-element {
  background: #f0f9ff;
  color: #0369a1;
  border: 1px solid #dbeafe;
}

.badge-default {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.badge-placeholder {
  background: #f9fafb;
  color: #9ca3af;
  border: 1px solid #f3f4f6;
  animation: pulse 1.5s infinite;
}

/* 노드 이름 */
.tree-node-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #24292e;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.matched-indicator {
  color: #28a745;
  font-size: 12px;
}

/* 자식 노드 컨테이너 */
.tree-node-children {
  position: relative;
  margin-left: 12px;
}

/* 트리 연결선 */
.tree-node-children::before {
  content: '';
  position: absolute;
  left: 20px;
  top: -8px;
  bottom: 8px;
  width: 1px;
  background: linear-gradient(to bottom, #e1e4e8 0%, transparent 100%);
}

/* 로딩 플레이스홀더 */
.loading-placeholder {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  margin-left: 44px;
  color: #586069;
  font-size: 13px;
  font-style: italic;
}

.loading-placeholder i {
  color: #667eea;
  font-size: 14px;
}

/* 애니메이션 */
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
}

/* 호버 효과 강화 */
.tree-node-content:hover .node-type-badge {
  transform: translateX(2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 반응형 조정 */
@media (max-width: 768px) {
  .tree-node-content {
    padding: 4px 8px;
    min-height: 32px;
  }
  
  .node-type-badge {
    padding: 2px 8px;
    font-size: 10px;
  }
  
  .tree-node-name {
    font-size: 13px;
  }
}
</style>