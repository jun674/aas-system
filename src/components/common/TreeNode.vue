<template>
  <div class="tree-node">
    <div
      class="tree-node-content"
      :class="{
        selected: node.selected,
        'has-value': node.hasValue && node.isMatched
      }"
      @click="selectNode"
      @dblclick="handleDoubleClick"
      :style="{ paddingLeft: `${level * 20}px` }"
    >
      <span
        class="tree-node-icon"
        @click.stop="toggleNode"
        v-if="hasChildren"
      >
        <i
          class="fas fa-chevron-right"
          :class="{ 'fa-rotate-90': node.expanded }"
        ></i>
      </span>
      <span v-else class="tree-node-icon"></span>

      <span class="node-type-icon" :class="getNodeIconClass(node.type)">
        {{ getNodeTypeChar(node.type) }}
      </span>

      <span class="tree-node-name">
        {{ node.name }}        
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
    <div v-else-if="node.expanded && node.children && node.children.length === 1 && node.children[0].type === 'placeholder'" class="tree-node-children loading-placeholder">
        <span class="tree-node-icon"><i class="fas fa-spinner fa-spin"></i></span>
        <span class="text-muted small">로딩 중...</span>
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
      // placeholder가 있을 경우 화살표 표시 (펼치기 가능)
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

    getNodeTypeChar(type) {
      // 타입별 문자 반환
      const charMap = {
        'equipment': 'AAS',
        'aas': 'AAS',
        'submodel': 'Submodel',
        'collection': 'Collection',
        'property': 'Property',
        'multilanguageproperty': 'MultiProperty', 
        'file': 'File',
        'reference': 'Reference',
        'range': 'Range',      
        'blob': 'Blob',
        'element': 'Element',
        'placeholder': '...' 
      }
      return charMap[type] || '•'
    },
    getNodeIconClass(type) {
      // 타입별 스타일 클래스 반환
      const classMap = {
        'equipment': 'icon-equipment',
        'aas': 'icon-equipment',
        'submodel': 'icon-submodel',
        'collection': 'icon-collection',
        'property': 'icon-property',
        'multilanguageproperty': 'icon-multilanguage',
        'file': 'icon-file',
        'reference': 'icon-reference',
        'range': 'icon-range',
        'blob': 'icon-blob',
        'element': 'icon-element',
        'placeholder': 'icon-placeholder'
      }
      return classMap[type] || 'icon-default'
    }
  },
  mounted() {
  }
}
</script>

<style scoped>
.tree-node {
  user-select: none;
}

.tree-node-content {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-size: 13px;
  min-height: 28px;
}

.tree-node-content:hover {
  background-color: #f8f9fa;
}

.tree-node-content.selected {
  background-color: #e3f2fd;
  color: #1976d2;
  font-weight: 500;
}

.tree-node-content.has-value {
  background-color: #fff3cd;
  color: #856404;
}

.tree-node-icon {
  width: 16px;
  text-align: center;
  cursor: pointer;
  color: #6c757d;
  flex-shrink: 0;
}

.tree-node-icon i {
  transition: transform 0.2s ease;
  font-size: 10px;
}

.fa-rotate-90 {
  transform: rotate(90deg);
}

/* 원형 아이콘 스타일 */
.node-type-icon {
  min-width: 28px;
  height: 15px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  margin-right: 8px;
  flex-shrink: 0;
  color: white;
  padding: 0 5px;
  box-sizing: border-box;
  transition: min-width 0.2s;
}

/* 타입별 아이콘 색상 */
.icon-equipment {
  background-color: #2196F3;
}

.icon-submodel {
  background-color: #FF9800;
}

.icon-collection {
  background-color: #9E9E9E;
}

.icon-property {
  background-color: #4CAF50;
}

.icon-multilanguage {
  background-color: #009688; 
}

.icon-file {
  background-color: #795548;
}

.icon-reference {
  background-color: #9C27B0;
}

.icon-range {
  background-color: #00BCD4;
}

.icon-blob {
  background-color: #FF5722;
}

.icon-element {
  background-color: #607D8B;
}

.icon-default {
  background-color: #BDBDBD;
}
.icon-placeholder { 
  background-color: #9e9e9e; 
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.tree-node-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.matched-value {
  color: #dc3545;
  font-size: 11px;
  margin-left: 8px;
}

/* 트리 라인 스타일 */
.tree-node-children {
  position: relative;
}

.tree-node-children::before {
  content: '';
  position: absolute;
  left: 10px;
  top: 0;
  bottom: 0;
  width: 1px;
  background-color: #dee2e6;
}
.loading-placeholder { /* 로딩 중 메시지 스타일 */
  display: flex;
  align-items: center;
  padding: 4px 8px;
  margin-left: 20px;
  color: #6c757d;
  font-size: 12px;
}
.loading-placeholder .fa-spinner {
  margin-right: 6px;
  color: #0d6efd;
}
</style>