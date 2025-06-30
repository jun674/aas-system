<template>
  <div class="equipment-detail">
    <div v-if="!selectedNode" class="empty-state">
      <i class="fas fa-mouse-pointer fa-2x mb-3"></i>
      <p>Select an item</p>
    </div>
    <div v-else>
      <div class="detail-header">
        <div class="detail-title">
          <span class="node-type-icon" :class="getNodeIconClass(selectedNode.type)">
            {{ getNodeTypeChar(selectedNode.type) }}
          </span>
          {{ selectedNode.name }}
        </div>
        <div class="detail-actions">
          <button 
            v-if="showRawData"
            class="btn btn-outline-secondary btn-sm"
            @click="showRawData = false"
          >
            <i class="fas fa-eye-slash"></i> Hide JSON
          </button>
          <button 
            v-else
            class="btn btn-outline-primary btn-sm"
            @click="showRawData = true"
          >
            <i class="fas fa-code"></i> Show JSON
          </button>
        </div>
      </div>

      <div v-if="selectedNode.type === 'equipment' || selectedNode.type === 'aas'" class="mb-4">
        <div class="section-header-static">
          <h6>
            <i class="fas fa-info-circle me-2"></i>
            AAS Information
          </h6>
        </div>
        <div class="section-content">
          <div class="info-grid">
            <div class="info-item">
              <label>ID:</label>
              <span>{{ selectedNode.id }}</span>
            </div>
            <div class="info-item">
              <label>ID Short:</label>
              <span>{{ selectedNode.data?.idShort || selectedNode.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="selectedNode.type === 'submodel'" class="mb-4">
        <div class="section-header-static">
          <h6>
            <i class="fas fa-folder me-2"></i>
            Submodel Information
          </h6>
        </div>
        <div class="section-content">
          <div class="info-grid">
            <div class="info-item">
              <label>ID Short:</label>
              <span>{{ selectedNode.data?.idShort || selectedNode.name }}</span>
            </div>
            <div class="info-item">
              <label>Model Type:</label>
              <span>{{ selectedNode.data?.modelType || 'Submodel' }}</span>
            </div>
          </div>
        </div>
        <div v-if="selectedNode.children && selectedNode.children.length > 0" class="mt-3">
          <div class="subsection-header">
            <i class="fas fa-list me-2"></i>
            Submodel Elements ({{ selectedNode.children.length }})
          </div>
          <div class="section-content">
            <div class="element-list">
              <div 
                v-for="element in selectedNode.children" 
                :key="element.id" 
                class="element-item"
              >
                <div class="element-header">
                  <span class="node-type-icon-small" :class="getNodeIconClass(element.type)">
                    {{ getNodeTypeChar(element.type) }}
                  </span>
                  <span class="element-name">
                    {{ element.name }}
                    <span v-if="element.type === 'collection' && element.data.value" class="collection-count">
                      ({{ element.data.value.length }} items)
                    </span>
                  </span>
                </div>
                <div v-if="element.data && element.type !== 'collection'" class="element-details">
                  <div v-if="element.data.value !== undefined" class="element-value">
                    <label>Value:</label>
                    <span>{{ formatValue(element.data.value, element.data.modelType) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="selectedNode.type === 'collection'" class="mb-4">
        <div class="section-header-static">
          <h6>
            <i class="fas fa-folder-open me-2"></i>
            Collection Information
          </h6>
        </div>
        <div class="section-content">
          <div class="info-grid">
            <div class="info-item">
              <label>ID Short:</label>
              <span>{{ selectedNode.data?.idShort || selectedNode.name }}</span>
            </div>
            <div class="info-item">
              <label>Elements:</label>
              <span>{{ selectedNode.children?.length || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="selectedNode.type === 'property' || selectedNode.type === 'multilanguageproperty'" class="mb-4">
        <div class="section-header-static">
          <h6>
            <i class="fas fa-tag me-2"></i>
            Property Information
          </h6>
        </div>
        <div class="section-content">
          <div class="info-grid">
            <div class="info-item">
              <label>ID Short:</label>
              <span>{{ selectedNode.data?.idShort || selectedNode.name }}</span>
            </div>
            <div class="info-item">
              <label>Value:</label>
              <span class="property-value-display">{{ formatValue(selectedNode.data?.value, selectedNode.data?.modelType) }}</span>
            </div>
            <div class="info-item">
              <label>Value Type:</label>
              <span>{{ selectedNode.data?.valueType || 'string' }}</span>
            </div>
            <div class="info-item full-width" v-if="selectedNode.data?.semanticId">
              <label>Semantic ID:</label>
              <span class="break-word">
                {{ getSemanticId(selectedNode.data.semanticId) }}
                <button 
                  v-if="selectedNode.data.semanticId"
                  class="btn btn-sm btn-link p-0 ms-2"
                  @click="showConceptDescription(selectedNode.data.semanticId)"
                >
                  <i class="fas fa-info-circle"></i> View Concept
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="selectedNode.type === 'file'" class="mb-4">
        <div class="section-header-static">
          <h6>
            <i class="fas fa-file me-2"></i>
            File Information
          </h6>
        </div>
        <div class="section-content">
          <div class="info-grid">
            <div class="info-item">
              <label>ID Short:</label>
              <span>{{ selectedNode.data?.idShort || selectedNode.name }}</span>
            </div>
            <div class="info-item">
              <label>Content Type:</label>
              <span>{{ selectedNode.data?.contentType || 'N/A' }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="mt-4" v-if="showRawData && selectedNode.data">
        <div class="section-header-static">
          <h6>
            <i class="fas fa-code me-2"></i>
            Raw JSON Data
          </h6>
        </div>
        <div class="section-content">
          <pre class="raw-data">{{ JSON.stringify(selectedNode.data, null, 2) }}</pre>
        </div>
      </div>

      <div v-if="showConcept" class="concept-modal" @click.self="closeConcept">
        <div class="concept-content">
          <div class="concept-header">
            <h5>Concept Description</h5>
            <button class="close-btn" @click="closeConcept">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="concept-body">
            <div v-if="loadingConcept" class="text-center p-4">
              <div class="spinner-border text-primary" role="status"></div>
            </div>
            <div v-else-if="conceptData">
              <div class="concept-info">
                <div class="info-item">
                  <label>ID:</label>
                  <span>{{ conceptData.id }}</span>
                </div>
                 <div class="info-item">
                  <label>ID Short:</label>
                  <span>{{ conceptData.idShort || 'N/A' }}</span>
                </div>
              </div>
            </div>
            <div v-else class="text-center p-4 text-muted">
              Concept description not found
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import apiClient from '@/services/api' // API 통신을 위한 axios 인스턴스

export default {
  name: 'EquipmentDetail',
  // 부모 컴포넌트로부터 전달받는 데이터 정의
  props: {
    // 트리 뷰에서 선택된 노드 객체
    selectedNode: {
      type: Object,
      default: null
    },
    // (현재 코드에서는 사용되지 않음) 상세 데이터를 별도로 받을 경우를 위한 prop
    detailData: {
      type: Object,
      default: null
    }
  },
  setup() {
    // --- 상태 관리 (Reactive State) ---
    const showRawData = ref(true) // Raw JSON 데이터 표시 여부
    const showConcept = ref(false) // Concept Description 모달 표시 여부
    const conceptData = ref(null) // API로 받아온 Concept 데이터 저장
    const loadingConcept = ref(false) // Concept 데이터 로딩 상태

    // --- UI 헬퍼 메소드 ---

    // 노드 타입에 따라 표시할 약어(문자)를 반환
    const getNodeTypeChar = (type) => {
      const charMap = {
        'equipment': 'AAS', 'aas': 'AAS', 'submodel': 'S', 'collection': 'C', 'property': 'P',
        'multilanguageproperty': 'M', 'file': 'F', 'reference': 'R', 'range': 'R', 'blob': 'B', 'element': 'E'
      };
      return charMap[type] || '•'; // 매핑되는 타입이 없으면 기본 문자 반환
    }

    // 노드 타입에 따라 적용할 CSS 클래스를 반환 (아이콘 색상 결정)
    const getNodeIconClass = (type) => {
      const classMap = {
        'equipment': 'icon-equipment', 'aas': 'icon-equipment', 'submodel': 'icon-submodel',
        'collection': 'icon-collection', 'property': 'icon-property', 'multilanguageproperty': 'icon-multilanguage',
        'file': 'icon-file', 'reference': 'icon-reference', 'range': 'icon-range', 'blob': 'icon-blob',
        'element': 'icon-element'
      };
      return classMap[type] || 'icon-default';
    }

    // Semantic ID 객체에서 실제 ID 값을 추출
    const getSemanticId = (semanticId) => {
      if (!semanticId || !semanticId.keys || !semanticId.keys.length) {
        return 'N/A';
      }
      return semanticId.keys[0].value || 'N/A';
    }

    // 다국어 속성(MultiLanguageProperty) 값에서 영어 또는 첫 번째 값을 추출
    const getMultiLanguageValue = (value) => {
      if (!Array.isArray(value) || value.length === 0) return null;
      const enValue = value.find(v => v.language === 'en'); // 영어 값 우선
      if (enValue) return enValue.text;
      return value[0].text; // 영어가 없으면 첫 번째 값
    }

    // 다양한 타입의 값을 화면에 표시하기 좋은 문자열로 포맷팅
    const formatValue = (value, modelType) => {
      if (value === null || value === undefined) return 'N/A';
      
      // 다국어 속성이면 해당 함수로 처리
      if (modelType === 'MultiLanguageProperty') {
        return getMultiLanguageValue(value);
      }
      
      if (Array.isArray(value)) return `Array (${value.length} items)`;
      if (typeof value === 'object' && value !== null) return JSON.stringify(value);
      return value;
    }

    // --- 비동기 메소드 (API 호출) ---

    // 'View Concept' 버튼 클릭 시, Semantic ID에 해당하는 Concept Description 정보를 API로 요청
    const showConceptDescription = async (semanticId) => {
      if (!semanticId || !semanticId.keys || !semanticId.keys.length) return;
      
      const conceptId = semanticId.keys[0].value;
      if (!conceptId) return;
      
      // 모달과 로딩 상태 활성화
      showConcept.value = true;
      loadingConcept.value = true;
      conceptData.value = null;
      
      try {
        const lowercaseId = conceptId.toLowerCase(); // ID를 소문자로 변환
        const encodedId = btoa(lowercaseId); // ID를 Base64로 인코딩하여 URL에 사용
        const response = await apiClient.get(`/concept/description/${encodedId}`);
        
        // 응답 데이터 처리 (API 응답이 배열일 경우 첫 번째 요소 사용)
        if (response.data && response.data.message) {
          const message = Array.isArray(response.data.message) ? response.data.message[0] : response.data.message;
          conceptData.value = message;
        } else {
          conceptData.value = null;
        }
      } catch (error) {
        console.error('Failed to load concept description:', error);
        conceptData.value = null;
      } finally {
        // API 호출 성공/실패 여부와 관계없이 로딩 상태 비활성화
        loadingConcept.value = false;
      }
    }

    // 모달 닫기
    const closeConcept = () => {
      showConcept.value = false;
      conceptData.value = null;
    }

    // 템플릿에서 사용할 수 있도록 상태와 메소드를 반환
    return {
      showRawData,
      showConcept,
      conceptData,
      loadingConcept,
      getNodeTypeChar,
      getNodeIconClass,
      getSemanticId,
      formatValue,
      showConceptDescription,
      closeConcept
    }
  }
}
</script>

<style scoped>
.collection-count {
  color: #6c757d;
  font-size: 0.9em;
  margin-left: 8px;
}

.equipment-detail {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 15px;
}

.equipment-detail::-webkit-scrollbar {
  width: 10px;
}

.equipment-detail::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.equipment-detail::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 5px;
}

.equipment-detail::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #6c757d;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 15px;
  border-bottom: 1px solid #dee2e6;
  margin-bottom: 20px;
}

.detail-title {
  font-size: 16px;
  font-weight: bold;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-header-static {
  padding: 10px 0;
  border-bottom: 2px solid #e9ecef;
  margin-bottom: 15px;
}

.section-header-static h6 {
  margin: 0;
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #2c3e50;
  font-weight: 600;
}

.subsection-header {
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #495057;
  display: flex;
  align-items: center;
}

.section-content {
  padding-left: 15px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item label {
  font-size: 12px;
  color: #6c757d;
  font-weight: 600;
}

.info-item span {
  font-size: 13px;
  color: #212529;
}

.break-word {
  word-break: break-all;
}

.submodel-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.submodel-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  transition: all 0.2s;
}

.submodel-item:hover {
  background-color: #e9ecef;
  border-color: #dee2e6;
}

.submodel-item.has-data {
  border-left: 3px solid #28a745;
}

.submodel-name {
  flex: 1;
  font-size: 13px;
}

.data-indicator {
  color: #28a745;
  font-size: 12px;
}

.element-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.element-item {
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.element-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.element-name {
  font-size: 13px;
  font-weight: 500;
  color: #212529;
}

.element-details {
  margin-top: 8px;
  padding-left: 30px;
}

.element-value {
  display: flex;
  gap: 8px;
  align-items: baseline;
  font-size: 12px;
}

.element-value label {
  color: #6c757d;
  font-weight: 600;
  min-width: 50px;
}

.property-value-display {
  background-color: #e7f3ff;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
}

.node-type-icon {
  min-width: fit-content;
  height: 22px;
  border-radius: 11px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
  color: white;
  padding: 0 10px;
}

.node-type-icon-small {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  color: white;
  flex-shrink: 0;
}

.icon-equipment { background-color: #2196F3; }
.icon-submodel { background-color: #FF9800; }
.icon-collection { background-color: #9E9E9E; }
.icon-property { background-color: #4CAF50; }
.icon-multilanguage { background-color: #009688; }
.icon-file { background-color: #795548; }
.icon-reference { background-color: #9C27B0; }
.icon-range { background-color: #00BCD4; }
.icon-blob { background-color: #FF5722; }
.icon-element { background-color: #607D8B; }
.icon-default { background-color: #BDBDBD; }

.raw-data {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 15px;
  font-size: 12px;
  color: #495057;
  max-height: 400px;
  overflow-y: auto;
  font-family: 'Consolas', 'Monaco', monospace;
}

.detail-actions {
  display: flex;
  gap: 8px;
}

.btn-sm {
  padding: 4px 10px;
  font-size: 12px;
  border-radius: 4px;
}

.btn-link {
  color: #0d6efd;
  text-decoration: none;
}

.btn-link:hover {
  text-decoration: underline;
}

.concept-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.concept-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.concept-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #dee2e6;
}

.concept-header h5 {
  margin: 0;
  color: #212529;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #6c757d;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background-color: #f8f9fa;
  color: #212529;
}

.concept-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.concept-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.description-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.description-item {
  display: flex;
  gap: 10px;
}

.language-tag {
  font-weight: 600;
  color: #6c757d;
  min-width: 40px;
}
</style>