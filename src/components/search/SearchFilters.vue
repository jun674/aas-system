<template>
  <div class="search-section">
    <div class="filter-row" :class="{ 'mobile-layout': isMobile }">
      <div class="filter-group">
        <label class="filter-label">Please select</label>
        <select
          :value="filters.filterType"
          class="form-select"
          @change="$emit('update:filters', { ...filters, filterType: $event.target.value }); $emit('filter-type-change')"
          :disabled="loading"
        >
          <option v-if="currentMenu !== 'ALL'" value="" disabled>-- Please Select --</option>
          <option v-for="option in filterOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">Input a value</label>
        <input
          :value="filters.filterValue"
          type="text"
          class="form-control"
          :disabled="loading"
          @input="$emit('update:filters', { ...filters, filterValue: $event.target.value })"
          @keyup.enter="$emit('search')"
          :placeholder="currentPlaceholder"
        />
      </div>

      <div class="filter-group button-group-wrapper">
        <label class="filter-label">&nbsp;</label>
        <div class="button-group" :class="{ 'mobile-buttons': isMobile }">
          <button @click="$emit('search')" class="btn btn-primary" :disabled="loading">
            <i v-if="loading" class="fas fa-spinner fa-spin me-1"></i>
            <i v-else class="fas fa-search me-1"></i>
            Search
          </button>

          <button @click="$emit('reset')" class="btn btn-secondary" :disabled="loading">
            <i class="fas fa-undo me-1"></i>
            Reset
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="currentMenu !== 'ALL' && quickSearchButtons.length > 0"
      class="quick-search-section"
      :class="{ 'mobile-quick-search': isMobile }"
    >
      <span class="quick-search-label">Quick Search</span>
      <div class="quick-search-buttons">
        <button
          v-for="(btn, index) in quickSearchButtons"
          :key="index"
          @click="quickSearch(btn.filterType, btn.value)"
          class="btn btn-outline-info btn-sm"
          :disabled="loading"
        >
          <span class="mobile-short">{{ btn.shortLabel }}</span>
          <span class="desktop-full">{{ btn.fullLabel }}</span>
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
    filters: {
      type: Object,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    error: {
      type: String,
      default: null,
    },
    currentMenu: {
      type: String,
      required: true,
    },
    // 부모로부터 필터 옵션을 동적으로 받도록 수정
    filterOptions: {
      type: Array,
      required: true,
    },
    // 부모로부터 플레이스홀더를 동적으로 받도록 수정
    placeholder: {
      type: String,
      default: 'Input a value',
    },
  },

  emits: ['search', 'reset', 'filter-type-change', 'update:filters'],

  setup(props, { emit }) {
    const isMobile = ref(false)

    // currentPlaceholder를 props.placeholder를 직접 사용하도록 변경
    const currentPlaceholder = computed(() => props.placeholder)

    // 메뉴별 Quick Search 버튼 정의
    const quickSearchButtons = computed(() => {
      const weldingMenus = ['CO2', 'TIG', 'MIG', 'MAG', 'EBW', 'FW', 'OAW', 'PW', 'RSEW', 'RSW', 'SAW', 'SMAW', 'Sold', 'SW', 'UW']
      const cncMenu = 'CNC'
      const pressMenus = ['Press_Cutting', 'Press_Hydr', 'Press_Mechanical_Type', 'Press_Servo']

      // Welding 장비 Quick Search
      if (weldingMenus.includes(props.currentMenu)) {
        return [
          { filterType: 'welding/search/inputpowervoltage', value: '380', shortLabel: '380V', fullLabel: 'Input Power Voltage 380V' },
          { filterType: 'welding/search/ratedoutputcurrent', value: '500', shortLabel: '500A', fullLabel: 'Rated Output Current 500A' },
          { filterType: 'welding/search/dutycycle', value: '60', shortLabel: '60%', fullLabel: 'Duty Cycle 60%' },
          { filterType: 'welding/search/inputcapacity/kw', value: '6.5', shortLabel: '6.5kW', fullLabel: 'Input Capacity 6.5kW' }
        ]
      }

      // CNC Quick Search
      if (props.currentMenu === cncMenu) {
        return [
          { filterType: 'cnc/search/spindle/max-speedofrotation', value: '8000', shortLabel: '8000rpm', fullLabel: 'Max Speed 8000rpm' },
          { filterType: 'cnc/search/spindle/maxtorque', value: '48', shortLabel: '48Nm', fullLabel: 'Max Torque 48Nm' },
          { filterType: 'cnc/search/spindle/maxoutputpower', value: '3.7', shortLabel: '3.7kW', fullLabel: 'Max Output Power 3.7kW' },
          { filterType: 'cnc/search/n-postrapidtransferspeed', value: '60', shortLabel: '60m/min', fullLabel: 'Rapid Transfer 60m/min' }
        ]
      }

      // Press Quick Search
      if (pressMenus.includes(props.currentMenu)) {
        // Press_Cutting 전용 Quick Search
        if (props.currentMenu === 'Press_Cutting') {
          return [
            { filterType: 'press/search/cuttinglength', value: '1800', shortLabel: '1800mm', fullLabel: 'Cutting Length 1800mm' },
            { filterType: 'press/search/cuttingthickness', value: '175', shortLabel: '175mm', fullLabel: 'Cutting Thickness 175mm' },
            { filterType: 'press/search/pressurecapacity', value: '100', shortLabel: '100ton', fullLabel: 'Pressure Capacity 100ton' },
            { filterType: 'press/search/strokesperminute', value: '50', shortLabel: '50spm', fullLabel: 'Strokes Per Minute 50spm' }
          ]
        }
        // 다른 Press 메뉴들의 Quick Search
        return [
          { filterType: 'press/search/pressurecapacity', value: '100', shortLabel: '100ton', fullLabel: 'Pressure Capacity 100ton' },
          { filterType: 'press/search/stroke', value: '300', shortLabel: '300mm', fullLabel: 'Stroke 300mm' },
          { filterType: 'press/search/strokesperminute', value: '50', shortLabel: '50spm', fullLabel: 'Strokes Per Minute 50spm' },
          { filterType: 'press/search/dieheight', value: '200', shortLabel: '200mm', fullLabel: 'Die Height 200mm' }
        ]
      }

      // AMR Quick Search
      if (props.currentMenu === 'AMR') {
        return [
          { filterType: 'loadcapacity', value: '1500', shortLabel: '1500kg', fullLabel: 'Load Capacity 1500kg' },
          { filterType: 'speed', value: '1.5', shortLabel: '1.5m/s', fullLabel: 'Speed 1.5m/s' },
          { filterType: 'batterytype', value: 'Lithium', shortLabel: 'Li-ion', fullLabel: 'Battery Type Lithium' },
          { filterType: 'navigationtype', value: 'SLAM', shortLabel: 'SLAM', fullLabel: 'Navigation Type SLAM' }
        ]
      }

      // Boring Quick Search
      if (props.currentMenu === 'Boring') {
        return [
          { filterType: 'boringdiameter', value: '130', shortLabel: '130mm', fullLabel: 'Boring Diameter 130mm' },
          { filterType: 'spindlespeed', value: '2000', shortLabel: '2000rpm', fullLabel: 'Spindle Speed 2000rpm' },
          { filterType: 'feedrate', value: '500', shortLabel: '500mm/min', fullLabel: 'Feed Rate 500mm/min' },
          { filterType: 'accuracy', value: '0.005', shortLabel: '±0.005mm', fullLabel: 'Accuracy ±0.005mm' }
        ]
      }

      // Robot Quick Search
      if (props.currentMenu === 'Robot') {
        return [
          { filterType: 'payload', value: '10', shortLabel: '10kg', fullLabel: 'Payload 10kg' },
          { filterType: 'reach', value: '1000', shortLabel: '1000mm', fullLabel: 'Reach 1000mm' },
          { filterType: 'repeatability', value: '0.02', shortLabel: '±0.02mm', fullLabel: 'Repeatability ±0.02mm' },
          { filterType: 'axes', value: '6', shortLabel: '6-Axis', fullLabel: 'Number of Axes 6' }
        ]
      }

      // 기본값 (다른 메뉴들)
      return []
    })

    const quickSearch = (filterType, value) => {
      emit('update:filters', {
        filterType: filterType,
        filterValue: value
      })
      emit('search')
    }

    const checkScreenSize = () => {
      isMobile.value = window.innerWidth <= 768
    }

    onMounted(() => {
      checkScreenSize()
      window.addEventListener('resize', checkScreenSize)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', checkScreenSize)
    })

    return {
      quickSearch,
      quickSearchButtons,
      currentPlaceholder,
      isMobile,
    }
  },
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

.form-select,
.form-control {
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
