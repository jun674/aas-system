<template>
  <div class="search-section">
    <div class="filter-row" :class="{ 'mobile-layout': isMobile }">
      <div class="filter-group">
        <label class="filter-label">Please select</label>
        <select 
          v-model="filters.filterType" 
          class="form-select"
          @change="$emit('filter-type-change')"
          :disabled="loading"
        >
          <option value="" disabled>-- Please Select --</option>
          
          <option 
            v-for="option in filterOptions" 
            :key="option.value" 
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>
      
      <div class="filter-group">
        <label class="filter-label">Input a value</label>
        <input 
          v-model="filters.filterValue"
          type="text" 
          class="form-control"
          :disabled="loading"
          @keyup.enter="$emit('search')"
          :placeholder="currentPlaceholder"
        />
      </div>
      
      <div class="filter-group button-group-wrapper">
        <label class="filter-label">&nbsp;</label>
        <div class="button-group" :class="{ 'mobile-buttons': isMobile }">
          <button 
            @click="$emit('search')" 
            class="btn btn-primary"
            :disabled="loading || !filters.filterValue.trim()"
          >
            <i v-if="loading" class="fas fa-spinner fa-spin me-1"></i>
            <i v-else class="fas fa-search me-1"></i>
            Search
          </button>
          
          <button 
            @click="$emit('reset')" 
            class="btn btn-secondary"
            :disabled="loading"
          >
            <i class="fas fa-undo me-1"></i>
            Reset
          </button>
        </div>
      </div>
    </div>
    
    <div class="quick-search-section" :class="{ 'mobile-quick-search': isMobile }">
      <span class="quick-search-label">Quick Search</span>
      <div class="quick-search-buttons">
        <button 
          @click="quickSearch('inputpowervoltage', '380')"
          class="btn btn-outline-info btn-sm"
          :disabled="loading"
        >
          <span class="mobile-short">380V</span>
          <span class="desktop-full">Input Power Voltage 380V</span>
        </button>
        
        <button 
          @click="quickSearch('numberofphases', 'Three')"
          class="btn btn-outline-info btn-sm"
          :disabled="loading"
        >
          <span class="mobile-short">3 Phase</span>
          <span class="desktop-full">Number of Phases Three</span>
        </button>
        
        <button 
          @click="quickSearch('dutycycle', '60')"
          class="btn btn-outline-info btn-sm"
          :disabled="loading"
        >
          <span class="mobile-short">60%</span>
          <span class="desktop-full">Duty Cycle 60%</span>
        </button>
        
        <button 
          @click="quickSearch('inputcapacity/kw', '6.5')"
          class="btn btn-outline-info btn-sm"
          :disabled="loading"
        >
          <span class="mobile-short">6.5kW</span>
          <span class="desktop-full">Input Capacity 6.5kW</span>
        </button>
      </div>
    </div>
    
  </div>
</template>

<script> 
import { computed, ref, onMounted, onUnmounted } from 'vue'

export default {
  
  name: 'SearchFilters', // 컴포넌트의 이름 정의

  // 부모 컴포넌트로부터 전달받는 데이터(속성) 정의
  props: {    
    filters: { // 검색 필터 상태를 담고 있는 객체 (상위 컴포넌트와 v-model로 연결될 수 있음)
      type: Object,
      required: true // 필수 props로 지정
    },    
    loading: { // 검색 진행 중 로딩 상태를 나타내는 boolean 값
      type: Boolean,
      default: false
    },    
    error: { // 검색 중 발생한 에러 메시지
      type: String,
      default: null
    },
  },

  // 부모 컴포넌트로 이벤트를 전달하기 위한 'emits' 정의
  emits: ['search', 'reset', 'filter-type-change'],

  
  setup(props, { emit }) {
    // 현재 화면이 모바일 크기인지 여부를 저장하는 반응형 상태
    const isMobile = ref(false)
    
    // 검색 필터 종류를 선택하는 드롭다운에 표시될 옵션 목록
    const filterOptions = ref([
      { value: 'numberofphases', label: 'Number of Phases' },
      { value: 'inputpowervoltage', label: 'Input Power Voltage' },
      { value: 'ratedfrequency', label: 'Rated Frequency' },
      { value: 'ratedoutputcurrent', label: 'Rated Output Current' },
      { value: 'inputcapacity/kw', label: 'Input Capacity' },
      { value: 'dutycycle', label: 'Duty Cycle' }
    ]);
    
    // 각 필터 종류에 따라 검색 입력창에 보여줄 예시 placeholder 텍스트
    const placeholderExamples = {
      'numberofphases': 'e.g., Three',
      'inputpowervoltage': 'e.g., 380, 220',
      'ratedfrequency': 'e.g., 60',
      'ratedoutputcurrent': 'e.g., 500, 350',
      'inputcapacity/kw': 'e.g., 6.5',
      'dutycycle': 'e.g., 60, 100'
    };

    // 현재 선택된 필터 종류에 따라 동적으로 placeholder 텍스트를 반환하는 계산된 속성(computed property)
    const currentPlaceholder = computed(() => {
      return placeholderExamples[props.filters.filterType] || 'Input a value';
    });
    
    /**
     * 빠른 검색을 위한 함수
     */
    const quickSearch = (filterType, value) => {
      // 부모로부터 받은 filters 객체의 값을 직접 변경
      props.filters.filterType = filterType
      props.filters.filterValue = value
      // 부모 컴포넌트에 'search' 이벤트를 발생시켜 실제 검색을 요청
      emit('search')
    }
    
    // 화면 너비를 체크하여 isMobile 상태를 업데이트하는 함수
    const checkScreenSize = () => {
      isMobile.value = window.innerWidth <= 768
    }

    // --- 생명주기 훅 (Lifecycle Hooks) ---

    // 컴포넌트가 마운트(생성)될 때 실행
    onMounted(() => {
      checkScreenSize() // 초기 화면 크기 체크
      window.addEventListener('resize', checkScreenSize) // 화면 크기 변경 이벤트를 감지
    })

    // 컴포넌트가 제거될 때 실행
    onUnmounted(() => {
      // 메모리 누수 방지를 위해 등록했던 이벤트 리스너를 제거
      window.removeEventListener('resize', checkScreenSize)
    })
    
    // setup 함수에서 반환하는 모든 값들은 템플릿(<template>)에서 사용 가능
    return {
      filterOptions,
      quickSearch,
      currentPlaceholder,
      isMobile
    }
  }
}
</script>

<style scoped>
.search-section {
  background: white;
  margin: 0;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
  width: 100%;
  box-sizing: border-box;
}

.filter-row {
  display: flex;
  gap: 15px;
  align-items: end;
  margin-bottom: 15px;
}

.filter-group {
  flex: 1;
}

.filter-group:last-child {
  flex: 0 0 auto;
}

.filter-label {
  font-size: 12px;
  color: #2c3e50;
  margin-bottom: 5px;
  font-weight: normal;
  display: block;
}

.form-select, .form-control {
  font-size: 12px;
  height: 32px;
  border: 1px solid #bdc3c7;
}

.button-group {
  display: flex;
  gap: 8px;
}

.btn-primary {
  background-color: #3498db;
  border-color: #3498db;
  font-size: 12px;
  padding: 6px 15px;
  height: 32px;
}

.btn-secondary {
  background-color: #95a5a6;
  border-color: #95a5a6;
  font-size: 12px;
  padding: 6px 15px;
  height: 32px;
}

.quick-search-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.quick-search-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-outline-info {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 12px;
}

.quick-search-label {
  font-size: 12px;
  font-weight: bold;
  color: #2c3e50;
  white-space: nowrap;
}

/* 모바일 전용 스타일 */
@media (max-width: 768px) {
  .search-section {
    padding: 15px;
  }
  
  /* 모바일 레이아웃 - 검색필터와 버튼을 한 줄에 */
  .filter-row.mobile-layout {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 10px;
  }
  
  .filter-row.mobile-layout .filter-group:first-child,
  .filter-row.mobile-layout .filter-group:nth-child(2) {
    grid-column: 1 / -1;
  }
  
  .filter-row.mobile-layout .filter-group:last-child {
    grid-column: 1 / -1;
  }
  
  .button-group-wrapper {
    margin-top: 5px;
  }
  
  /* 모바일 버튼 - 가로 배치 유지 */
  .button-group.mobile-buttons {
    display: flex;
    flex-direction: row;
    width: 100%;
    gap: 10px;
  }
  
  .button-group.mobile-buttons .btn {
    flex: 1;
    height: 36px;
    font-size: 13px;
    padding: 6px 12px;
  }
  
  /* 모바일 Quick Search */
  .quick-search-section.mobile-quick-search {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid #e9ecef;
  }
  
  .mobile-quick-search .quick-search-label {
    font-size: 11px;
    color: #6c757d;
  }
  
  .mobile-quick-search .quick-search-buttons {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 5px;
  }
  
  .mobile-quick-search .btn-outline-info {
    font-size: 10px;
    padding: 6px 4px;
    border-radius: 8px;
    white-space: nowrap;
  }
  
  /* 모바일에서는 짧은 텍스트 표시 */
  .mobile-short {
    display: inline;
  }
  
  .desktop-full {
    display: none;
  }
}

/* 데스크톱에서는 전체 텍스트 표시 */
@media (min-width: 769px) {
  .mobile-short {
    display: none;
  }
  
  .desktop-full {
    display: inline;
  }
}
</style>