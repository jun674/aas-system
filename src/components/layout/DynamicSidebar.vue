<template>
  <div>
    <!-- 모바일 오버레이 -->
    <div 
      v-if="showSidebar && isOpen && isMobile"
      class="sidebar-overlay"
      @click="$emit('close-sidebar')"
    ></div>
    
    <!-- 사이드바 본체 -->
    <div 
      class="dynamic-sidebar" 
      v-if="showSidebar"
      :class="{ 'is-open': isOpen, 'is-mobile': isMobile }"
    >
      <!-- 모바일 닫기 버튼 -->
      <button 
        v-if="isMobile"
        class="mobile-close-btn"
        @click="$emit('close-sidebar')"
      >
        <i class="fas fa-times"></i>
      </button>
      
      <div class="sidebar-header">
        <i class="fas" :class="getCategoryIcon()"></i>
        {{ getCategoryTitle() }}
      </div>
   
      <nav class="sidebar-nav">
        <template v-if="activeCategory === 'equipment'">
          <a
            class="nav-link d-flex align-items-center"
            href="#"
            :class="{ expanded: expandedMenus.welding }"
            @click.prevent="toggleMenu('welding')"
          >
            <span>
              <i class="fas fa-fire"></i>
              Welding
            </span>
            <i class="fas fa-chevron-down ms-auto"></i>
          </a>
          
          <div class="submenu" :class="{ show: expandedMenus.welding }">
            <a
              v-for="item in weldingItems"
              :key="item"
              class="nav-link submenu-item"
              :class="{ active: activeMenu === item }"
              @click="selectMenu(item)"
            >
              <i class="fas fa-circle"></i>
              {{ item }}
            </a>
          </div>

          <a
            class="nav-link d-flex align-items-center"
            href="#"
            :class="{ expanded: expandedMenus.cnc }"
            @click.prevent="toggleMenu('cnc')"
          >
            <span>
              <i class="fas fa-tools"></i>
              CNC
            </span>
            <i class="fas fa-chevron-down ms-auto"></i>
          </a>
          
          <div class="submenu" :class="{ show: expandedMenus.cnc }">
            <a class="nav-link submenu-item">
              <i class="fas fa-circle"></i>
              CNC Machine 1
            </a>
            <a class="nav-link submenu-item">
              <i class="fas fa-circle"></i>
              CNC Machine 2
            </a>
          </div>
        </template>

        <template v-if="activeCategory === 'material'">
          <a
            v-for="item in materialItems"
            :key="item.value"
            class="nav-link"
            :class="{ active: activeMenu === item.value }"
            @click="selectMenu(item.value)"
          >
            <i class="fas fa-circle"></i>
            {{ item.label }}
          </a>
        </template>

        <template v-if="activeCategory === 'process'">
          <a
            v-for="item in processItems"
            :key="item"
            class="nav-link"
            :class="{ active: activeMenu === item }"
            @click="selectMenu(item)"
          >
            <i class="fas fa-circle"></i>
            {{ item }}
          </a>
        </template>
      </nav>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'

export default {
  // 컴포넌트의 이름 정의
  name: 'DynamicSidebar',
  
  // 부모 컴포넌트로부터 전달받는 데이터(속성) 정의
  props: {
    // 현재 활성화된 주 카테고리
    activeCategory: {
      type: String,
      default: 'equipment'
    },
    // 각 메뉴 항목 옆에 표시될 숫자 카운트
    menuCounts: {
      type: Object,
      default: () => ({})
    },
    // 사이드바가 열려있는지 여부
    isOpen: {
      type: Boolean,
      default: true
    }
  },
  
  // 부모 컴포넌트로 이벤트를 전달하기 위한 'emits' 정의
  emits: ['menu-selected', 'close-sidebar'],
  
  setup(props, { emit }) {
    // --- 상태 관리 (Reactive State) ---

    // 현재 활성화(선택)된 서브 메뉴를 저장 (기본값: 'CO2')
    const activeMenu = ref('CO2') 
    
    // 확장 가능한 메뉴들의 열림/닫힘 상태를 관리하는 객체
    const expandedMenus = reactive({
      welding: true, // 'welding' 메뉴는 기본적으로 열린 상태
      cnc: false   // 'cnc' 메뉴는 기본적으로 닫힌 상태
    })
    
    // 현재 화면이 모바일 크기인지 여부를 저장
    const isMobile = ref(false)

    // --- 메뉴 데이터 ---

    // 'Equipment' 카테고리의 'Welding' 서브 메뉴 아이템 목록
    const weldingItems = ['CO2', 'EBW', 'FW', 'MAG', 'MIG', 'OAW', 'PW', 'RSEW', 'RSW', 'SAW', 'SMAW', 'Sold', 'SW', 'TIG', 'UW']
    
    // 'Material' 카테고리의 서브 메뉴 아이템 목록
    const materialItems = [
      { value: 'Steel', label: 'Steel' },
      { value: 'Aluminum', label: 'Aluminum' },
      { value: 'Stainless Steel', label: 'Stainless Steel' }
    ]
    
    // 'Process' 카테고리의 서브 메뉴 아이템 목록
    const processItems = ['Welding', 'Cutting', 'Brazing']

    // --- 계산된 속성 (Computed Properties) ---

    // 서브 메뉴가 있는 특정 카테고리일 때만 사이드바 내용을 보여주기 위한 computed 속성
    const showSidebar = computed(() => {
      const categoriesWithSubmenu = ['equipment', 'material', 'process']
      return categoriesWithSubmenu.includes(props.activeCategory)
    })

    // --- 메소드 (Methods) ---

    // 현재 활성화된 카테고리에 맞는 아이콘 클래스를 반환하는 함수
    const getCategoryIcon = () => {
      const iconMap = {
        equipment: 'fa-cogs',
        material: 'fa-cube',
        process: 'fa-sync-alt',
        operation: 'fa-tachometer-alt',
        quality: 'fa-check-circle',
        production: 'fa-industry'
      }
      return iconMap[props.activeCategory] || 'fa-folder' // 매핑되는 아이콘이 없으면 기본 아이콘 반환
    }

    // 현재 활성화된 카테고리의 제목을 반환하는 함수
    const getCategoryTitle = () => {
      const titleMap = {
        equipment: 'Equipment',
        material: 'Material',
        process: 'Process',
        operation: 'Operation',
        quality: 'Quality',
        production: 'Production'
      }
      return titleMap[props.activeCategory] || 'Menu' // 매핑되는 제목이 없으면 기본 제목 반환
    }

    // 메뉴의 확장/축소 상태를 토글하는 함수
    const toggleMenu = (menu) => {
      expandedMenus[menu] = !expandedMenus[menu]
    }

    // 서브 메뉴를 선택했을 때 실행되는 함수
    const selectMenu = (menuName) => {
      activeMenu.value = menuName // 선택된 메뉴를 활성 상태로 변경
      emit('menu-selected', menuName) // 부모 컴포넌트에 'menu-selected' 이벤트를 전달
      
      // 모바일 화면에서는 메뉴를 선택하면 자동으로 사이드바를 닫도록 이벤트를 전달
      if (isMobile.value) {
        emit('close-sidebar')
      }
    }

    // 화면 너비를 체크하여 모바일 여부를 판단하는 함수
    const checkScreenSize = () => {
      isMobile.value = window.innerWidth <= 768 // 너비가 768px 이하이면 모바일로 간주
    }

    // --- 생명주기 훅 (Lifecycle Hooks) ---

    // 컴포넌트가 마운트(생성)될 때 실행
    onMounted(() => {
      checkScreenSize() // 초기 화면 크기 체크
      window.addEventListener('resize', checkScreenSize) // 화면 크기 변경 이벤트를 감지
    })

    // 컴포넌트가 언마운트(제거)될 때 실행
    onUnmounted(() => {
      window.removeEventListener('resize', checkScreenSize) // 메모리 누수 방지를 위해 이벤트 리스너 제거
    })

    // setup 함수에서 반환하는 모든 값들은 템플릿에서 사용할 수 있음
    return {
      activeMenu,
      expandedMenus,
      weldingItems,
      materialItems,
      processItems,
      showSidebar,
      getCategoryIcon,
      getCategoryTitle,
      toggleMenu,
      selectMenu,
      isMobile
    }
  }
}
</script>

<style scoped>
/* 기본 사이드바 스타일 */
.dynamic-sidebar {
  position: fixed;
  left: 0;
  top: 50px;
  bottom: 0;
  width: 240px;
  background-color: #f8f9fa;
  border-right: 1px solid #dee2e6;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 1000;
  transition: transform 0.3s ease;
}

/* 데스크톱에서 닫힌 상태 */
@media (min-width: 769px) {
  .dynamic-sidebar:not(.is-open) {
    transform: translateX(-100%);
  }
}

/* 모바일 스타일 */
@media (max-width: 768px) {
  .dynamic-sidebar {
    transform: translateX(-100%);
    box-shadow: 2px 0 10px rgba(0,0,0,0.1);
  }
  
  .dynamic-sidebar.is-open {
    transform: translateX(0);
  }
  
  /* 모바일 오버레이 */
  .sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }
  
  /* 모바일 닫기 버튼 */
  .mobile-close-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 20px;
    color: #495057;
    cursor: pointer;
    padding: 5px 10px;
    z-index: 1;
  }
  
  .mobile-close-btn:hover {
    color: #212529;
  }
}

/* 기존 스타일들 유지 */
.sidebar-header {
  background-color: #e9ecef;
  color: #495057;
  padding: 15px 20px;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #dee2e6;
}

.sidebar-header i {
  color: #6c757d;
}

.sidebar-nav {
  padding: 10px;
}

.nav-link {
  color: #495057;
  padding: 10px 15px;
  border-radius: 6px;
  text-decoration: none;
  display: flex;
  align-items: center;
  font-size: 13px;
  transition: all 0.2s;
  margin-bottom: 4px;
  cursor: pointer;
}

.nav-link:hover {
  background-color: #e9ecef;
  color: #212529;
}

.nav-link.active {
  background-color: #0d6efd;
  color: white;
}

.nav-link.expanded {
  background-color: #e9ecef;
}

.nav-link i {
  margin-right: 10px;
  width: 16px;
  text-align: center;
  font-size: 12px;
}

.fa-chevron-down {
  transition: transform 0.2s;
  font-size: 10px;
}

.nav-link.expanded .fa-chevron-down {
  transform: rotate(180deg);
}

.submenu {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
  margin-left: 10px;
  margin-bottom: 5px;
}

.submenu.show {
  max-height: 600px;
  overflow-y: auto;
}

.submenu-item {
  padding: 8px 15px 8px 30px;
  font-size: 12px;
  background-color: transparent;
}

.submenu-item:hover {
  background-color: #dee2e6;
}

.submenu-item.active {
  background-color: #6c757d;
  color: white;
}

.submenu-item i {
  font-size: 6px;
}

/* 스크롤바 스타일 */
.dynamic-sidebar::-webkit-scrollbar {
  width: 6px;
}

.dynamic-sidebar::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.dynamic-sidebar::-webkit-scrollbar-thumb {
  background: #adb5bd;
  border-radius: 3px;
}

.dynamic-sidebar::-webkit-scrollbar-thumb:hover {
  background: #6c757d;
}
</style>