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
        <span class="header-title">{{ getCategoryTitle() }}</span>
        <button
          class="sidebar-collapse-btn"
          @click="$emit('close-sidebar')"
          title="Hide sidebar"
        >
          <i class="fas fa-times"></i>
        </button>
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
    // 현재 활성화된 주 카테고리 (예: 'equipment', 'material')
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
  
  // Vue 3 Composition API의 진입점
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
  top: 56px;
  bottom: 0;
  width: 260px;
  background-color: #ffffff;
  border-right: 1px solid #e1e4e8;
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
    top: 52px;
    transform: translateX(-100%);
    box-shadow: 4px 0 20px rgba(0,0,0,0.1);
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
    top: 15px;
    right: 15px;
    background: #f6f8fa;
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    font-size: 18px;
    color: #586069;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    z-index: 1;
  }
  
  .mobile-close-btn:hover {
    background: #e1e4e8;
    color: #24292e;
  }
}

/* 사이드바 헤더 */
.sidebar-header {
  background: linear-gradient(135deg, #f6f8fa 0%, #ffffff 100%);
  color: #24292e;
  padding: 15px 24px;
  font-weight: 600;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #e1e4e8;
  letter-spacing: 0.3px;
  min-height: 60px;
  position: relative;
}

.sidebar-header i {
  color: #586069;
  font-size: 18px;
}

.header-title {
  flex: 1;
}

.sidebar-collapse-btn {
  background: #f6f8fa;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #586069;
  margin-left: auto;
  font-size: 18px;
}

.sidebar-collapse-btn:hover {
  background: #e1e4e8;
  color: #24292e;
}

.sidebar-collapse-btn i {
  font-size: 18px;
}

/* 네비게이션 */
.sidebar-nav {
  padding: 16px 12px;
}

/* 메인 네비게이션 링크 */
.nav-link {
  color: #24292e;
  padding: 12px 16px;
  border-radius: 8px;
  text-decoration: none;
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  margin-bottom: 4px;
  cursor: pointer;
  position: relative;
}

.nav-link:hover {
  background-color: #f6f8fa;
  color: #0969da;
}

.nav-link.active {
  background-color: #dbeafe;
  color: #0969da;
}

.nav-link.expanded {
  background-color: #f6f8fa;
  color: #0969da;
}

.nav-link i {
  margin-right: 12px;
  width: 20px;
  text-align: center;
  font-size: 14px;
  opacity: 0.8;
}

.nav-link:hover i,
.nav-link.active i,
.nav-link.expanded i {
  opacity: 1;
}

/* 화살표 아이콘 */
.fa-chevron-down {
  transition: transform 0.2s ease;
  font-size: 12px;
  opacity: 0.6;
}

.nav-link.expanded .fa-chevron-down {
  transform: rotate(180deg);
}

/* 서브메뉴 */
.submenu {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
  margin: 4px 0 8px 0;
  padding-left: 12px;
}

.submenu.show {
  max-height: 600px;
  overflow-y: auto;
}

/* 서브메뉴 아이템 */
.submenu-item {
  padding: 10px 16px 10px 36px;
  font-size: 13px;
  font-weight: 400;
  color: #586069;
  background-color: transparent;
  position: relative;
  transition: all 0.2s ease;
}

.submenu-item::before {
  content: '';
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 4px;
  background-color: #d1d5db;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.submenu-item:hover {
  background-color: #f6f8fa;
  color: #24292e;
}

.submenu-item:hover::before {
  background-color: #0969da;
  width: 6px;
  height: 6px;
}

.submenu-item.active {
  background-color: #e7f3ff;
  color: #0969da;
  font-weight: 500;
}

.submenu-item.active::before {
  background-color: #0969da;
  width: 6px;
  height: 6px;
}

.submenu-item i {
  display: none;
}

/* 스크롤바 스타일 */
.dynamic-sidebar::-webkit-scrollbar {
  width: 6px;
}

.dynamic-sidebar::-webkit-scrollbar-track {
  background: #f6f8fa;
}

.dynamic-sidebar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.dynamic-sidebar::-webkit-scrollbar-thumb:hover {
  background: #adb5bd;
}

/* 호버 효과 강화 */
@media (hover: hover) {
  .nav-link {
    position: relative;
    overflow: hidden;
  }
  
  .nav-link::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 3px;
    height: 100%;
    background-color: #0969da;
    transform: translateX(-100%);
    transition: transform 0.2s ease;
  }
  
  .nav-link:hover::after,
  .nav-link.active::after,
  .nav-link.expanded::after {
    transform: translateX(0);
  }
}
</style>