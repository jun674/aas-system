<template>
  <div class="equipment-detail">
    <div v-if="!selectedNode" class="empty-state">
      <div class="empty-container">
        <i class="fas fa-hand-pointer empty-icon"></i>
        <h3>No Selection</h3>
        <p>Select an item from the tree to view details</p>
      </div>
    </div>
    <div v-else class="detail-container">
      <div class="detail-header">
        <div class="detail-title">
          <span class="node-type-badge" :class="getNodeIconClass(selectedNode.type)">
            {{ getNodeTypeChar(selectedNode.type) }}
          </span>
          <span class="node-name">{{ selectedNode.name }}</span>
        </div>
        <div class="detail-actions">
          <button
            class="action-btn"
            :class="{ active: showRawData }"
            @click="showRawData = !showRawData"
            title="Toggle JSON view"
          >
            <i :class="showRawData ? 'fas fa-eye-slash' : 'fas fa-code'"></i>
            {{ showRawData ? 'Hide' : 'Show' }} JSON
          </button>
        </div>
      </div>

      <div class="detail-body">
        <!-- AAS Information -->
        <div
          v-if="selectedNode.type === 'equipment' || selectedNode.type === 'aas'"
          class="info-section"
        >
          <div class="section-header">
            <i class="fas fa-server"></i>
            <h3>AAS Information</h3>
          </div>
          <div class="info-content">
            <div class="info-grid">
              <div class="info-item">
                <label>ID</label>
                <span class="info-value">{{ selectedNode.id }}</span>
              </div>
              <div class="info-item">
                <label>Short ID</label>
                <span class="info-value">{{
                  selectedNode.data?.idShort || selectedNode.name
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Submodel Information -->
        <div v-else-if="selectedNode.type === 'submodel'" class="info-section">
          <div class="section-header">
            <i class="fas fa-folder"></i>
            <h3>Submodel Details</h3>
          </div>
          <div class="info-content">
            <div class="info-grid">
              <div class="info-item full-width">
                <label>ID</label>
                <span class="info-value">{{ selectedNode.id }}</span>
              </div>
              <div class="info-item">
                <label>Short ID</label>
                <span class="info-value">{{
                  selectedNode.data?.idShort || selectedNode.name
                }}</span>
              </div>
              <div class="info-item">
                <label>Model Type</label>
                <span class="info-value">{{ selectedNode.data?.modelType || 'Submodel' }}</span>
              </div>
            </div>
          </div>

          <div
            v-if="selectedNode.children && selectedNode.children.length > 0"
            class="elements-section"
          >
            <div class="section-header">
              <i class="fas fa-list"></i>
              <h3>Elements</h3>
              <span class="element-count">{{ selectedNode.children.length }}</span>
            </div>
            <div class="elements-list">
              <div v-for="element in selectedNode.children" :key="element.id" class="element-card">
                <div class="element-header">
                  <span class="element-badge" :class="getNodeIconClass(element.type)">
                    {{ getNodeTypeChar(element.type) }}
                  </span>
                  <span class="element-name">
                    {{ element.name }}
                    <span
                      v-if="element.type === 'collection' && element.data?.value"
                      class="element-meta"
                    >
                      {{ element.data.value.length }} items
                    </span>
                  </span>
                </div>
                <div
                  v-if="element.data?.value !== undefined && element.type !== 'collection'"
                  class="element-value"
                >
                  <span class="value-label">Value:</span>
                  <span class="value-content">{{
                    formatValue(element.data.value, element.data.modelType)
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Collection Information -->
        <div v-else-if="selectedNode.type === 'collection'" class="info-section">
          <div class="section-header">
            <i class="fas fa-layer-group"></i>
            <h3>Collection Details</h3>
          </div>
          <div class="info-content">
            <div class="info-grid">
              <div class="info-item full-width">
                <label>ID</label>
                <span class="info-value">{{ selectedNode.id }}</span>
              </div>
              <div class="info-item">
                <label>Short ID</label>
                <span class="info-value">{{
                  selectedNode.data?.idShort || selectedNode.name
                }}</span>
              </div>
              <div class="info-item">
                <label>Total Elements</label>
                <span class="info-value">{{ selectedNode.children?.length || 0 }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Property Information -->
        <div
          v-else-if="
            selectedNode.type === 'property' || selectedNode.type === 'multilanguageproperty'
          "
          class="info-section"
        >
          <div class="section-header">
            <i class="fas fa-tag"></i>
            <h3>Property Details</h3>
          </div>
          <div class="info-content">
            <div class="info-grid">
              <div class="info-item full-width">
                <label>ID</label>
                <span class="info-value">{{ selectedNode.id }}</span>
              </div>
              <div class="info-item">
                <label>Short ID</label>
                <span class="info-value">{{
                  selectedNode.data?.idShort || selectedNode.name
                }}</span>
              </div>
              <div class="info-item">
                <label>Current Value</label>
                <span class="info-value highlight">{{
                  formatValue(selectedNode.data?.value, selectedNode.data?.modelType)
                }}</span>
              </div>
              <div class="info-item">
                <label>Data Type</label>
                <span class="info-value">{{ selectedNode.data?.valueType || 'string' }}</span>
              </div>
              <div class="info-item full-width" v-if="selectedNode.data?.semanticId">
                <label>Semantic Reference</label>
                <div class="semantic-value">
                  <span class="semantic-id">{{ getSemanticId(selectedNode.data.semanticId) }}</span>
                  <button
                    class="concept-btn"
                    @click="showConceptDescription(selectedNode.data.semanticId)"
                  >
                    <i class="fas fa-book"></i>
                    View Concept
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- File Information -->
        <div v-else-if="selectedNode.type === 'file'" class="info-section">
          <div class="section-header">
            <i class="fas fa-file"></i>
            <h3>File Details</h3>
          </div>
          <div class="info-content">
            <div class="info-grid">
              <div class="info-item full-width">
                <label>ID</label>
                <span class="info-value">{{ selectedNode.id }}</span>
              </div>
              <div class="info-item">
                <label>Short ID</label>
                <span class="info-value">{{
                  selectedNode.data?.idShort || selectedNode.name
                }}</span>
              </div>
              <div class="info-item">
                <label>MIME Type</label>
                <span class="info-value">{{ selectedNode.data?.contentType || 'Unknown' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Reference Information -->
        <div v-else-if="selectedNode.type === 'reference'" class="info-section">
          <div class="section-header">
            <i class="fas fa-link"></i>
            <h3>Reference Details</h3>
          </div>
          <div class="info-content">
            <div class="info-grid">
              <div class="info-item full-width">
                <label>ID</label>
                <span class="info-value">{{ selectedNode.id }}</span>
              </div>
              <div class="info-item">
                <label>Short ID</label>
                <span class="info-value">{{
                  selectedNode.data?.idShort || selectedNode.name
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Range Information -->
        <div v-else-if="selectedNode.type === 'range'" class="info-section">
          <div class="section-header">
            <i class="fas fa-arrows-alt-h"></i>
            <h3>Range Details</h3>
          </div>
          <div class="info-content">
            <div class="info-grid">
              <div class="info-item full-width">
                <label>ID</label>
                <span class="info-value">{{ selectedNode.id }}</span>
              </div>
              <div class="info-item">
                <label>Short ID</label>
                <span class="info-value">{{
                  selectedNode.data?.idShort || selectedNode.name
                }}</span>
              </div>
              <div class="info-item">
                <label>Min Value</label>
                <span class="info-value">{{ selectedNode.data?.min || 'Not specified' }}</span>
              </div>
              <div class="info-item">
                <label>Max Value</label>
                <span class="info-value">{{ selectedNode.data?.max || 'Not specified' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Element Information (Generic) -->
        <div
          v-else-if="selectedNode.type === 'element' || selectedNode.type === 'blob'"
          class="info-section"
        >
          <div class="section-header">
            <i class="fas fa-cube"></i>
            <h3>Element Details</h3>
          </div>
          <div class="info-content">
            <div class="info-grid">
              <div class="info-item full-width">
                <label>ID</label>
                <span class="info-value">{{ selectedNode.id }}</span>
              </div>
              <div class="info-item">
                <label>Short ID</label>
                <span class="info-value">{{
                  selectedNode.data?.idShort || selectedNode.name
                }}</span>
              </div>
              <div class="info-item">
                <label>Type</label>
                <span class="info-value">{{ selectedNode.type }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Concept Description Information -->
        <div v-else-if="selectedNode.type === 'concept'" class="info-section">
          <div class="section-header">
            <i class="fas fa-book"></i>
            <h3>Concept Description</h3>
          </div>
          <div class="info-content">
            <div class="info-grid">
              <div class="info-item full-width">
                <label>ID</label>
                <span class="info-value">{{ selectedNode.id }}</span>
              </div>
              <div class="info-item">
                <label>Short ID</label>
                <span class="info-value">{{
                  selectedNode.data?.idShort || selectedNode.name
                }}</span>
              </div>
            </div>

            <!-- Data Specifications -->
            <div
              v-if="selectedNode.data?.embeddedDataSpecifications?.length > 0"
              class="spec-section"
            >
              <h4 class="spec-title">Data Specifications</h4>
              <div
                v-for="(spec, index) in selectedNode.data.embeddedDataSpecifications"
                :key="index"
                class="spec-content"
              >
                <div v-if="spec.dataSpecificationContent">
                  <div v-if="spec.dataSpecificationContent.preferredName" class="spec-item">
                    <label>Preferred Name</label>
                    <div class="lang-values">
                      <div
                        v-for="(name, idx) in spec.dataSpecificationContent.preferredName"
                        :key="idx"
                        class="lang-item"
                      >
                        <span class="lang-code">{{ name.language }}</span>
                        <span class="lang-text">{{ name.text }}</span>
                      </div>
                    </div>
                  </div>

                  <div v-if="spec.dataSpecificationContent.definition" class="spec-item">
                    <label>Definition</label>
                    <div class="lang-values">
                      <div
                        v-for="(def, idx) in spec.dataSpecificationContent.definition"
                        :key="idx"
                        class="lang-item"
                      >
                        <span class="lang-code">{{ def.language }}</span>
                        <span class="lang-text definition">{{ def.text }}</span>
                      </div>
                    </div>
                  </div>

                  <div v-if="spec.dataSpecificationContent.dataType" class="spec-item">
                    <label>Data Type</label>
                    <span class="info-value highlight">{{
                      spec.dataSpecificationContent.dataType
                    }}</span>
                  </div>

                  <div v-if="spec.dataSpecificationContent.unit !== undefined" class="spec-item">
                    <label>Unit</label>
                    <span class="info-value">{{
                      spec.dataSpecificationContent.unit || 'No unit'
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Raw JSON Data -->
        <div v-if="showRawData && selectedNode.data" class="json-section">
          <div class="section-header">
            <i class="fas fa-code"></i>
            <h3>Raw JSON Data</h3>
            <button
              class="copy-btn"
              @click="copyJsonData"
              :class="{ success: copyButtonText === 'Copied!' }"
            >
              <i :class="copyButtonIcon"></i>
              {{ copyButtonText }}
            </button>
          </div>
          <div class="json-content">
            <pre class="json-data">{{ JSON.stringify(selectedNode.data, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- Concept Description Modal -->
      <div v-if="showConcept" class="modal-overlay" @click.self="closeConcept">
        <div class="modal-container">
          <div class="modal-header">
            <h2>
              <i class="fas fa-book-open"></i>
              Concept Description
            </h2>
            <button class="modal-close" @click="closeConcept">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div v-if="loadingConcept" class="loading-state">
              <i class="fas fa-circle-notch fa-spin"></i>
              <p>Loading concept data...</p>
            </div>
            <div v-else-if="conceptData" class="concept-data">
              <div class="concept-section">
                <h3>Basic Information</h3>
                <div class="concept-grid">
                  <div class="concept-item">
                    <label>Identifier</label>
                    <span>{{ conceptData.id }}</span>
                  </div>
                  <div class="concept-item">
                    <label>Short ID</label>
                    <span>{{ conceptData.idShort || 'Not specified' }}</span>
                  </div>
                </div>
              </div>

              <!-- Data Specifications -->
              <div
                v-if="conceptData.embeddedDataSpecifications?.length > 0"
                class="concept-section"
              >
                <h3>
                  <i class="fas fa-database"></i>
                  Data Specifications
                </h3>

                <div
                  v-for="(spec, index) in conceptData.embeddedDataSpecifications"
                  :key="index"
                  class="spec-card"
                >
                  <div v-if="spec.dataSpecificationContent?.dataType" class="spec-item">
                    <label>Data Type</label>
                    <span class="spec-badge">{{ spec.dataSpecificationContent.dataType }}</span>
                  </div>

                  <div v-if="spec.dataSpecificationContent?.preferredName" class="spec-item">
                    <label>Preferred Names</label>
                    <div class="lang-values">
                      <div
                        v-for="(name, idx) in spec.dataSpecificationContent.preferredName"
                        :key="idx"
                        class="lang-item"
                      >
                        <span class="lang-code">{{ name.language }}</span>
                        <span class="lang-text">{{ name.text }}</span>
                      </div>
                    </div>
                  </div>

                  <div v-if="spec.dataSpecificationContent?.definition" class="spec-item">
                    <label>Definitions</label>
                    <div class="lang-values">
                      <div
                        v-for="(def, idx) in spec.dataSpecificationContent.definition"
                        :key="idx"
                        class="definition-block"
                      >
                        <span class="lang-code">{{ def.language }}</span>
                        <p class="definition-text">{{ def.text }}</p>
                      </div>
                    </div>
                  </div>

                  <div v-if="spec.dataSpecificationContent?.unit !== undefined" class="spec-item">
                    <label>Unit</label>
                    <span class="spec-badge">{{
                      spec.dataSpecificationContent.unit || 'No unit'
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="no-data-state">
              <i class="fas fa-info-circle"></i>
              <p>No concept description available</p>
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
      default: null,
    },
    // (현재 코드에서는 사용되지 않음) 상세 데이터를 별도로 받을 경우를 위한 prop
    detailData: {
      type: Object,
      default: null,
    },
  },
  setup(props) {
    // --- 상태 관리 (Reactive State) ---
    const showRawData = ref(true) // Raw JSON 데이터 표시 여부
    const showConcept = ref(false) // Concept Description 모달 표시 여부
    const conceptData = ref(null) // API로 받아온 Concept 데이터 저장
    const loadingConcept = ref(false) // Concept 데이터 로딩 상태
    const copyButtonText = ref('Copy') // 복사 버튼 텍스트
    const copyButtonIcon = ref('fas fa-copy') // 복사 버튼 아이콘

    // --- UI 헬퍼 메소드 ---

    // 노드 타입에 따라 표시할 약어(문자)를 반환 - 아이콘 스타일
    const getNodeTypeChar = (type) => {
      const charMap = {
        equipment: 'A',
        aas: 'A',
        submodel: 'S',
        collection: 'C',
        property: 'P',
        multilanguageproperty: 'M',
        file: 'F',
        reference: 'R',
        range: 'R',
        blob: 'B',
        element: 'E',
        concept: 'D',
      }
      return charMap[type] || '•' // 매핑되는 타입이 없으면 기본 문자 반환
    }

    // 노드 타입에 따라 적용할 CSS 클래스를 반환 (아이콘 색상 결정)
    const getNodeIconClass = (type) => {
      const classMap = {
        equipment: 'badge-equipment',
        aas: 'badge-equipment',
        submodel: 'badge-submodel',
        collection: 'badge-collection',
        property: 'badge-property',
        multilanguageproperty: 'badge-multilanguage',
        file: 'badge-file',
        reference: 'badge-reference',
        range: 'badge-range',
        blob: 'badge-blob',
        element: 'badge-element',
        concept: 'badge-concept',
      }
      return classMap[type] || 'badge-default'
    }

    // Semantic ID 객체에서 실제 ID 값을 추출
    const getSemanticId = (semanticId) => {
      if (!semanticId || !semanticId.keys || !semanticId.keys.length) {
        return 'N/A'
      }
      return semanticId.keys[0].value || 'N/A'
    }

    // 다국어 속성(MultiLanguageProperty) 값에서 영어 또는 첫 번째 값을 추출
    const getMultiLanguageValue = (value) => {
      if (!Array.isArray(value) || value.length === 0) return null
      const enValue = value.find((v) => v.language === 'en') // 영어 값 우선
      if (enValue) return enValue.text
      return value[0].text // 영어가 없으면 첫 번째 값
    }

    // 다양한 타입의 값을 화면에 표시하기 좋은 문자열로 포맷팅
    const formatValue = (value, modelType) => {
      if (value === null || value === undefined) return 'N/A'

      // 다국어 속성이면 해당 함수로 처리
      if (modelType === 'MultiLanguageProperty') {
        return getMultiLanguageValue(value)
      }

      if (Array.isArray(value)) return `Array (${value.length} items)`
      if (typeof value === 'object' && value !== null) return JSON.stringify(value)
      return value
    }

    // --- 비동기 메소드 (API 호출) ---

    // 'View Concept' 버튼 클릭 시, Semantic ID에 해당하는 Concept Description 정보를 API로 요청
    const showConceptDescription = async (semanticId) => {
      if (!semanticId || !semanticId.keys || !semanticId.keys.length) return

      const conceptId = semanticId.keys[0].value
      if (!conceptId) return

      // 모달과 로딩 상태 활성화
      showConcept.value = true
      loadingConcept.value = true
      conceptData.value = null

      try {
        const lowercaseId = conceptId.toLowerCase() // ID를 소문자로 변환
        const encodedId = btoa(lowercaseId) // ID를 Base64로 인코딩하여 URL에 사용
        const response = await apiClient.get(`/concept/description/${encodedId}`)

        // 응답 데이터 처리 (API 응답이 배열일 경우 첫 번째 요소 사용)
        if (response.data && response.data.message) {
          const message = Array.isArray(response.data.message)
            ? response.data.message[0]
            : response.data.message
          conceptData.value = message
        } else {
          conceptData.value = null
        }
      } catch (error) {
        console.error('Failed to load concept description:', error)
        conceptData.value = null
      } finally {
        // API 호출 성공/실패 여부와 관계없이 로딩 상태 비활성화
        loadingConcept.value = false
      }
    }

    // 모달 닫기
    const closeConcept = () => {
      showConcept.value = false
      conceptData.value = null
    }

    // JSON 데이터 클립보드에 복사
    const copyJsonData = async () => {
      try {
        const jsonText = JSON.stringify(props.selectedNode.data, null, 2)
        await navigator.clipboard.writeText(jsonText)

        // 복사 성공 시 버튼 텍스트와 아이콘 변경
        copyButtonText.value = 'Copied!'
        copyButtonIcon.value = 'fas fa-check'

        // 2초 후 원래 상태로 복원
        setTimeout(() => {
          copyButtonText.value = 'Copy'
          copyButtonIcon.value = 'fas fa-copy'
        }, 2000)
      } catch (error) {
        console.error('Failed to copy:', error)
        copyButtonText.value = 'Failed'
        copyButtonIcon.value = 'fas fa-times'

        setTimeout(() => {
          copyButtonText.value = 'Copy'
          copyButtonIcon.value = 'fas fa-copy'
        }, 2000)
      }
    }

    // 템플릿에서 사용할 수 있도록 상태와 메소드를 반환
    return {
      showRawData,
      showConcept,
      conceptData,
      loadingConcept,
      copyButtonText,
      copyButtonIcon,
      getNodeTypeChar,
      getNodeIconClass,
      getSemanticId,
      formatValue,
      showConceptDescription,
      closeConcept,
      copyJsonData,
    }
  },
}
</script>

<style scoped>
/* 메인 컨테이너 */
.equipment-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fafbfc;
}

/* 빈 상태 */
.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
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

/* 상세 정보 컨테이너 */
.detail-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 헤더 */
.detail-header {
  padding: 20px;
  background: white;
  border-bottom: 1px solid #e1e4e8;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.detail-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.node-name {
  font-size: 18px;
  font-weight: 600;
  color: #24292e;
}

.detail-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  padding: 8px 16px;
  border: 1px solid #e1e4e8;
  background: white;
  border-radius: 6px;
  font-size: 14px;
  color: #586069;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-btn:hover {
  background: #f6f8fa;
  border-color: #d1d5da;
}

.action-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

/* 상세 정보 본문 */
.detail-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: white;
}

/* 스크롤바 */
.detail-body::-webkit-scrollbar {
  width: 8px;
}

.detail-body::-webkit-scrollbar-track {
  background: #f1f3f4;
}

.detail-body::-webkit-scrollbar-thumb {
  background: #dadce0;
  border-radius: 4px;
}

.detail-body::-webkit-scrollbar-thumb:hover {
  background: #bdc1c6;
}

/* 정보 섹션 */
.info-section {
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e1e4e8;
}

.section-header i {
  font-size: 20px;
  color: #667eea;
}

.section-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #24292e;
  margin: 0;
  flex: 1;
}

.element-count {
  background: #f6f8fa;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  color: #586069;
  font-weight: 500;
}

/* 정보 그리드 */
.info-content {
  padding-left: 30px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item label {
  font-size: 12px;
  font-weight: 600;
  color: #586069;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 14px;
  color: #24292e;
  padding: 8px 12px;
  background: #f6f8fa;
  border-radius: 6px;
  border: 1px solid #e1e4e8;
  word-break: break-all;
  overflow-wrap: break-word;
}

.info-value.highlight {
  background: #e7f3ff;
  border-color: #667eea;
  font-weight: 500;
}

/* Semantic 값 */
.semantic-value {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.semantic-id {
  font-size: 13px;
  color: #24292e;
  padding: 8px 12px;
  background: #f6f8fa;
  border-radius: 6px;
  font-family: 'Consolas', 'Monaco', monospace;
  word-break: break-all;
  overflow-wrap: break-word;
}

.concept-btn {
  align-self: flex-start;
  padding: 6px 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.concept-btn:hover {
  background: #5a67d8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* Elements 섹션 */
.elements-section {
  margin-top: 30px;
}

.elements-list {
  display: grid;
  gap: 12px;
  padding-left: 30px;
}

.element-card {
  padding: 16px;
  background: #f6f8fa;
  border-radius: 8px;
  border: 1px solid #e1e4e8;
  transition: all 0.2s ease;
}

.element-card:hover {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.element-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.element-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
  margin-right: 8px;
}

.element-name {
  font-size: 14px;
  font-weight: 500;
  color: #24292e;
  display: flex;
  align-items: center;
  gap: 8px;
}

.element-meta {
  font-size: 12px;
  color: #586069;
  font-weight: normal;
}

.element-value {
  margin-top: 10px;
  padding-left: 34px;
  display: flex;
  gap: 8px;
  align-items: baseline;
}

.value-label {
  font-size: 12px;
  color: #586069;
  font-weight: 600;
}

.value-content {
  font-size: 13px;
  color: #24292e;
  background: #e7f3ff;
  padding: 4px 8px;
  border-radius: 4px;
}

/* 노드 타입 배지 - 아이콘 스타일 */
.node-type-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 13px;
  font-weight: 700;
  margin-right: 10px;
}

/* 배지 색상 - 심플한 스타일 */
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

.badge-concept {
  background: #fef3e2;
  color: #92400e;
  border: 1px solid #fcd34d;
}

/* Spec section styles */
.spec-section {
  margin-top: 20px;
}

.spec-title {
  font-size: 14px;
  font-weight: 600;
  color: #24292e;
  margin-bottom: 12px;
}

.spec-content {
  background: #f6f8fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.spec-item {
  margin-bottom: 16px;
}

.spec-item:last-child {
  margin-bottom: 0;
}

.spec-item label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #586069;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.lang-values {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lang-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.lang-code {
  font-size: 11px;
  font-weight: 600;
  color: #586069;
  text-transform: uppercase;
  min-width: 30px;
  padding-top: 2px;
}

.lang-text {
  font-size: 14px;
  color: #24292e;
  flex: 1;
}

.lang-text.definition {
  line-height: 1.5;
}

/* JSON 섹션 */
.json-section {
  margin-top: 30px;
}

.json-content {
  padding-left: 30px;
}

.json-data {
  background: #f6f8fa;
  border: 1px solid #e1e4e8;
  border-radius: 8px;
  padding: 20px;
  font-size: 13px;
  font-family: 'Consolas', 'Monaco', monospace;
  color: #24292e;
  max-height: 400px;
  overflow-y: auto;
  line-height: 1.6;
}

.copy-btn {
  padding: 6px 12px;
  background: white;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.copy-btn:hover {
  background: #f6f8fa;
  border-color: #d1d5da;
}

.copy-btn.success {
  background: #28a745;
  color: white;
  border-color: #28a745;
}

/* 모달 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(2px);
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #e1e4e8;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #24292e;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-header h2 i {
  color: #667eea;
}

.modal-close {
  width: 36px;
  height: 36px;
  border: none;
  background: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: #586069;
}

.modal-close:hover {
  background: #f6f8fa;
  color: #24292e;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

/* 로딩 상태 */
.loading-state {
  text-align: center;
  padding: 60px;
}

.loading-state i {
  font-size: 3em;
  color: #667eea;
  margin-bottom: 20px;
  display: block;
}

.loading-state p {
  font-size: 16px;
  color: #586069;
}

/* Concept 데이터 */
.concept-section {
  margin-bottom: 30px;
}

.concept-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #24292e;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.concept-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.concept-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.concept-item label {
  font-size: 12px;
  font-weight: 600;
  color: #586069;
  text-transform: uppercase;
}

.concept-item span {
  font-size: 14px;
  color: #24292e;
  padding: 8px 12px;
  background: #f6f8fa;
  border-radius: 6px;
}

/* Spec 카드 */
.spec-card {
  background: #f6f8fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
}

.spec-item {
  margin-bottom: 20px;
}

.spec-item:last-child {
  margin-bottom: 0;
}

.spec-item label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #586069;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.spec-badge {
  display: inline-block;
  padding: 6px 12px;
  background: #667eea;
  color: white;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
}

.lang-values {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lang-item {
  display: flex;
  gap: 10px;
  align-items: baseline;
}

.lang-code {
  font-size: 11px;
  font-weight: 600;
  color: #586069;
  text-transform: uppercase;
  min-width: 40px;
}

.lang-text {
  font-size: 14px;
  color: #24292e;
}

.definition-block {
  margin-bottom: 12px;
}

.definition-text {
  margin-top: 4px;
  font-size: 14px;
  color: #24292e;
  line-height: 1.6;
}

/* 데이터 없음 상태 */
.no-data-state {
  text-align: center;
  padding: 60px;
}

.no-data-state i {
  font-size: 3em;
  color: #e1e4e8;
  margin-bottom: 20px;
  display: block;
}

.no-data-state p {
  font-size: 16px;
  color: #586069;
}
</style>
