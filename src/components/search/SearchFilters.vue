<template>
  <div class="search-section">
    <div class="filter-row">
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
      
      <div class="filter-group">
        <label class="filter-label">&nbsp;</label>
        <div class="button-group">
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
    <div class="quick-search-section">
        <span class="quick-search-label">Quick Search</span>
        <div class="quick-search-buttons">
          <button 
            @click="quickSearch('inputpowervoltage', '380')"
            class="btn btn-outline-info btn-sm"
            :disabled="loading"
          >
            Input Power Voltage 380V
          </button>
          
          <button 
            @click="quickSearch('numberofphases', 'Three')"
            class="btn btn-outline-info btn-sm"
            :disabled="loading"
          >
            Number of Phases Three
          </button>
          
          <button 
            @click="quickSearch('dutycycle', '60')"
            class="btn btn-outline-info btn-sm"
            :disabled="loading"
          >
            Duty Cycle 60%
          </button>
          
          <button 
            @click="quickSearch('inputcapacity/kw', '6.5')"
            class="btn btn-outline-info btn-sm"
            :disabled="loading"
          >
            Input Capacity 6.5kW
          </button>
        </div>
      </div>
    
  </div>
</template>

<script>
import { computed, ref } from 'vue'

export default {
  name: 'SearchFilters',
  props: {
    filters: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: null
    },
  },
  emits: ['search', 'reset', 'filter-type-change'],
  setup(props, { emit }) {
    
    // [수정] filterOptions의 value를 모두 API 문서에 맞게 소문자로 변경
    const filterOptions = ref([
      { value: 'numberofphases', label: 'Number of Phases' },
      { value: 'inputpowervoltage', label: 'Input Power Voltage' },
      { value: 'ratedfrequency', label: 'Rated Frequency' },
      { value: 'ratedoutputcurrent', label: 'Rated Output Current' },
      { value: 'inputcapacity/kw', label: 'Input Capacity' },
      { value: 'dutycycle', label: 'Duty Cycle' }
    ]);
    
    const placeholderExamples = {
      'numberofphases': 'e.g., Three',
      'inputpowervoltage': 'e.g., 380, 220',
      'ratedfrequency': 'e.g., 60',
      'ratedoutputcurrent': 'e.g., 500, 350',
      'inputcapacity/kw': 'e.g., 6.5',
      'dutycycle': 'e.g., 60, 100'
    };

    const currentPlaceholder = computed(() => {
      // 키 값도 소문자로 접근하도록 수정
      return placeholderExamples[props.filters.filterType] || 'Input a value';
    });
    
    const quickSearch = (filterType, value) => {
      props.filters.filterType = filterType
      props.filters.filterValue = value
      emit('search')
    }
    
    return {
      filterOptions,
      quickSearch,
      currentPlaceholder
    }
  }
}
</script>

<style scoped>
/* style 부분은 변경 사항 없습니다. */
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
</style>