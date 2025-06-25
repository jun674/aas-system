<template>
  <div class="search-page-container">
    <!-- 모바일 슬라이드 토글 버튼 - 사이드바가 닫혀있을 때만 표시 -->
    <button 
      v-if="showSidebar && !sidebarOpen"
      class="mobile-menu-toggle"
      @click="toggleSidebar"
      title="Open sidebar"
    >
      <svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 2L8 8L2 14" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    
    <DynamicSidebar
      v-if="showSidebar"
      :active-category="activeCategory"
      :menu-counts="menuCounts"
      :is-open="sidebarOpen"
      @menu-selected="onMenuSelected"
      @close-sidebar="closeSidebar"
    />
   
    <div class="main-content" :class="{ 'with-sidebar': showSidebar && sidebarOpen && !isMobile }">
      <template v-if="currentMenu === 'AASX'">
        <div class="content-header">
          <i class="fas fa-exchange-alt"></i>
          AASX File Register Upload
        </div>
        <div class="aasx-wrapper">
          <AasxUploadPage/>
        </div>
      </template>
     
      <template v-else>
        <div class="content-header">
          <i class="fas" :class="getHeaderIcon()"></i>
          <div class="header-info">
            <span class="header-title">{{ currentMenuDisplayName }}</span>
          </div>
          <div v-if="loading" class="header-loading">
            <div class="spinner-border spinner-border-sm" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
       
        <SearchFilters
          :filters="searchFilters"
          :filter-options="filterOptions"
          :loading="loading"
          :current-menu="currentMenu"
          :filtered-count="filteredAAS.length"
          @search="performSearch"
          @reset="clearSearch"
          @filter-type-change="onFilterTypeChange"
        />
       
        <div class="search-results" :class="{ 'mobile-view': isMobile }">
          <div class="results-tree" v-show="!isMobile || mobileView === 'tree'">
            <TreeView
              :tree-data="treeData"
              :loading="loading"
              :error="error"
              @node-toggle="toggleNode"
              @node-select="selectNode"
            />
          </div>
         
          <div class="results-detail" v-show="!isMobile || mobileView === 'detail'">
            <EquipmentDetail
              :selected-node="selectedNode"
              :detail-data="selectedNodeDetail"
            />
          </div>
        </div>
        
        <!-- 모바일 뷰 전환 버튼 -->
        <div v-if="isMobile && currentMenu !== 'AASX'" class="mobile-view-switcher">
          <button 
            class="view-btn"
            :class="{ active: mobileView === 'tree' }"
            @click="mobileView = 'tree'"
          >
            <i class="fas fa-sitemap"></i>
            Tree
          </button>
          <button 
            class="view-btn"
            :class="{ active: mobileView === 'detail' }"
            @click="mobileView = 'detail'"
            :disabled="!selectedNode"
          >
            <i class="fas fa-info-circle"></i>
            Detail
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import DynamicSidebar from '@/components/layout/DynamicSidebar.vue';
import SearchFilters from '@/components/search/SearchFilters.vue';
import TreeView from '@/components/common/TreeView.vue';
import EquipmentDetail from '@/components/search/EquipmentDetail.vue';
import AasxUploadPage from '@/views/AasxUploadPage.vue';
import { useSearch } from '@/composables/useSearch';
import { MENU_TYPES } from '@/utils/menuFilters';

const props = defineProps({
  query: {
    type: Object,
    default: () => ({})
  }
});

const {
  loading, error, selectedNode, treeData, searchFilters,
  filterOptions, currentMenu, filteredAAS, menuCounts,
  currentMenuDisplayName, changeMenu, performSearch, 
  clearSearch, toggleNode, selectNode
} = useSearch();

const activeCategory = ref('equipment');
const sidebarOpen = ref(true);
const isMobile = ref(false);
const mobileView = ref('tree');

const showSidebar = computed(() => {
  const categoriesWithSubmenu = ['equipment', 'material', 'process'];
  return categoriesWithSubmenu.includes(activeCategory.value);
});

const getHeaderIcon = () => {
  const iconMap = {
    [MENU_TYPES.SPECIAL.ALL]: 'fa-globe',
    [MENU_TYPES.SPECIAL.AASX]: 'fa-exchange-alt'
  };
  const category = activeCategory.value;
  if (category === 'equipment') return 'fa-fire';
  if (category === 'material') return 'fa-cube';
  if (category === 'process') return 'fa-sync-alt';
  return iconMap[currentMenu.value] || 'fa-cog';
};

const getCategoryForMenu = (menu) => {
  for (const categoryKey in MENU_TYPES) {
    const categoryObj = MENU_TYPES[categoryKey];
    if (typeof categoryObj === 'object') {
      for (const menuKey in categoryObj) {
        if (categoryObj[menuKey] === menu) {
          const lowerCaseCategory = categoryKey.toLowerCase();
          return lowerCaseCategory === 'special' ? null : lowerCaseCategory;
        }
      }
    }
  }
  return null;
};

const onMenuSelected = async (menuName) => {
  await changeMenu(menuName);
  const category = getCategoryForMenu(menuName);
  activeCategory.value = category || null;
};

const onFilterTypeChange = () => {
  searchFilters.filterValue = '';
};

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

const closeSidebar = () => {
  sidebarOpen.value = false;
};

// 노드 선택 시 모바일에서는 자동으로 상세 뷰로 전환
const handleSelectNode = (node) => {
  selectNode(node);
  if (isMobile.value) {
    mobileView.value = 'detail';
  }
};

// 화면 크기 체크
const checkScreenSize = () => {
  const wasMobile = isMobile.value;
  isMobile.value = window.innerWidth <= 768;
  
  // 데스크톱으로 전환 시 사이드바 열기
  if (wasMobile && !isMobile.value) {
    sidebarOpen.value = true;
  }
};

onMounted(() => {
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);
  
  // 모바일에서는 초기에 사이드바 닫기
  if (isMobile.value) {
    sidebarOpen.value = false;
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize);
});

// selectNode 메서드 오버라이드
watch(() => selectedNode.value, (newNode) => {
  if (newNode && isMobile.value) {
    mobileView.value = 'detail';
  }
});

const handleQuery = async (query) => {
  console.log("Handling query:", query);

  if (query.filterType && query.value) {
    if (query.menu === 'ALL') {
      await onMenuSelected('ALL');
    }
    searchFilters.filterType = query.filterType;
    searchFilters.filterValue = query.value;
    await performSearch();
  } 
  else if (query.keyword) {
    await onMenuSelected('ALL');
    searchFilters.filterType = 'numberofphases';
    searchFilters.filterValue = query.keyword;
    await performSearch();
  } 
  else if (query.menu) {
    await onMenuSelected(query.menu);
  } 
  else if (query.category) {
    const category = query.category;
    activeCategory.value = category;
    const categoryKey = category.toUpperCase();
    const singleLevelMenus = ['operation', 'quality', 'production'];

    if (singleLevelMenus.includes(category)) {
      await onMenuSelected(category.charAt(0).toUpperCase() + category.slice(1));
    } else if (MENU_TYPES[categoryKey]) {
      const defaultMenu = Object.values(MENU_TYPES[categoryKey])[0];
      if (defaultMenu) {
        await onMenuSelected(defaultMenu);
      }
    }
  } 
  else {
    activeCategory.value = 'equipment';
    await onMenuSelected(MENU_TYPES.EQUIPMENT.TIG);
  }
};

watch(() => props.query, (newQuery) => {
  handleQuery(newQuery);
}, { immediate: true, deep: true });
</script>

<style scoped>
.search-page-container {
  display: flex;
  height: 100%;
  width: 100%;
  background-color: #f8f9fa;
  position: relative;
}

/* 모바일 슬라이드 토글 버튼 - 사이드바 닫혀있을 때만 */
.mobile-menu-toggle {
  position: fixed;
  top: 70px;
  left: 0;
  z-index: 1001;
  background-color: #0d6efd;
  border: none;
  border-radius: 0 12px 12px 0;
  width: 24px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 2px 2px 6px rgba(0,0,0,0.15);
  transition: all 0.3s ease;
  padding: 0;
  padding-left: 2px;
}

.mobile-menu-toggle:hover {
  background-color: #0b5ed7;
  width: 28px;
}

/* 버튼 클릭 효과 */
.mobile-menu-toggle:active {
  transform: scale(0.95);
}

/* 모바일에서 햄버거 버튼 표시 */
@media (max-width: 768px) {
  .mobile-menu-toggle {
    display: block;
  }
}

/* 데스크톱에서 햄버거 버튼 숨김 */
@media (min-width: 769px) {
  .mobile-menu-toggle {
    display: none;
  }
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  transition: margin-left 0.3s ease;
  background-color: #f8f9fa;
}

.main-content.with-sidebar {
  margin-left: 240px;
}

@media (max-width: 768px) {
  .main-content.with-sidebar {
    margin-left: 0;
  }
}

.main-content:not(.with-sidebar) {
  margin-left: auto;
  margin-right: auto;
  max-width: 1600px;
}

.content-header {
  flex-shrink: 0;
  background: white;
  border-bottom: 1px solid #dee2e6;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-height: 60px;
}

.content-header i {
  margin-right: 12px;
  color: #f39c12;
  font-size: 18px;
}

.header-info {
  flex: 1;
}

.header-title {
  font-size: 16px;
  font-weight: bold;
  color: #2c3e50;
}

.header-loading {
  margin-left: 10px;
}

.aasx-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: #f8f9fa;
}

.search-results {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}

.results-tree,
.results-detail {
  width: 50%;
  background: white;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.results-tree {
  border-right: 1px solid #dee2e6;
}

/* 모바일 스타일 */
@media (max-width: 768px) {
  .search-results.mobile-view {
    position: relative;
  }
  
  .results-tree,
  .results-detail {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  
  /* 모바일 뷰 전환 버튼 */
  .mobile-view-switcher {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 10px;
    background-color: white;
    padding: 8px;
    border-radius: 25px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 100;
  }
  
  .view-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border: none;
    border-radius: 20px;
    background-color: #f8f9fa;
    color: #495057;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .view-btn:hover:not(:disabled) {
    background-color: #e9ecef;
  }
  
  .view-btn.active {
    background-color: #0d6efd;
    color: white;
  }
  
  .view-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .view-btn i {
    font-size: 16px;
  }
}

/* 데스크톱에서 모바일 뷰 스위처 숨김 */
@media (min-width: 769px) {
  .mobile-view-switcher {
    display: none;
  }
}

@media (max-width: 1200px) {
  .main-content.with-sidebar {
    margin-left: 0; 
  }
}
</style>