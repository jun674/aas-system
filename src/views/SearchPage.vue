<template>
  <div class="search-page-container">
    <DynamicSidebar
      v-if="showSidebar"
      :active-category="activeCategory"
      :menu-counts="menuCounts"
      @menu-selected="onMenuSelected"
    />
   
    <div class="main-content" :class="{ 'with-sidebar': showSidebar }">
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
       
        <div class="search-results">
          <div class="results-tree">
            <TreeView
              :tree-data="treeData"
              :loading="loading"
              :error="error"
              @node-toggle="toggleNode"
              @node-select="selectNode"
            />
          </div>
         
          <div class="results-detail">
            <EquipmentDetail
              :selected-node="selectedNode"
              :detail-data="selectedNodeDetail"
            />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
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

/**
 * [수정] 라우터 쿼리 처리 로직을 명확한 if-else if 체인으로 변경
 */
const handleQuery = async (query) => {
  console.log("Handling query:", query);

  // 우선순위 1: 필터 검색 (대시보드 바로가기 포함)
  if (query.filterType && query.value) {
    // 검색 컨텍스트를 'ALL'로 설정
    if (query.menu === 'ALL') {
      await onMenuSelected('ALL');
    }
    searchFilters.filterType = query.filterType;
    searchFilters.filterValue = query.value;
    await performSearch();
  } 
  // 우선순위 2: 키워드 검색
  else if (query.keyword) {
    await onMenuSelected('ALL'); // 키워드 검색은 항상 전체 데이터 대상
    searchFilters.filterType = 'numberofphases';
    searchFilters.filterValue = query.keyword;
    await performSearch();
  } 
  // 우선순위 3: 메뉴 선택 (TopBar 등)
  else if (query.menu) {
    await onMenuSelected(query.menu);
  } 
  // 우선순위 4: 카테고리 선택 (TopBar 등)
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
  // 우선순위 5: 아무 조건도 없는 기본 상태
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

@media (max-width: 1200px) {
  .main-content.with-sidebar {
    margin-left: 0; 
  }
}

@media (max-width: 768px) {
  .search-results {
    flex-direction: column;
    height: auto;
  }
  .results-tree, .results-detail {
    width: 100%;
    height: 50%;
  }
}
</style>