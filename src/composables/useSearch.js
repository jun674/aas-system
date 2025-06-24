import { ref, reactive, computed, watch } from 'vue'
import apiClient, { dataAPI, searchAPI } from '@/services/api'
import { transformApiToTree, toggleNodeExpanded, updateSelectedNode, transformSubmodelElements } from '@/utils/dataTransform'
import { isExcludedComponentAAS, filterAASByMenuType, calculateMenuCounts, getMenuDisplayName, MENU_TYPES, EQUIPMENT_KEYWORDS } from '@/utils/menuFilters'

export function useSearch() {
  const loading = ref(false)
  const error = ref(null)
  const selectedNode = ref(null)
  const treeData = ref([])
  const allData = reactive({
    aas: [],
    loaded: false,
    loadingInProgress: false,
  })
  const submodelCache = ref(new Map())
  const currentMenu = ref(MENU_TYPES.EQUIPMENT.TIG)
  const searchFilters = reactive({
    filterType: '',
    filterValue: ''
  })
  const menuCounts = ref({})

  const filterOptions = [
    { value: 'numberofphases', label: 'Number of Phases' },
    { value: 'inputpowervoltage', label: 'Input Power Voltage' },
    { value: 'ratedfrequency', label: 'Rated Frequency' },
    { value: 'ratedoutputcurrent', label: 'Rated Output Current' },
    { value: 'inputcapacity/kw', label: 'Input Capacity' },
    { value: 'dutycycle', label: 'Duty Cycle' }
  ]

  const filteredAAS = computed(() => treeData.value)
  const currentMenuDisplayName = computed(() => getMenuDisplayName(currentMenu.value))
  const hasResults = computed(() => treeData.value && treeData.value.length > 0)
  const selectedNodeDetail = computed(() => selectedNode.value ? selectedNode.value.data : null)

  const loadAllDataForDashboard = async () => {
    if (allData.loaded || allData.loadingInProgress) return;
    allData.loadingInProgress = true;
    try {
      let allAasItems = [];
      let currentPage = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        const response = await dataAPI.getAllAAS(currentPage);
        const pageItems = response.message || [];
        if (pageItems.length > 0) {
          allAasItems = [...allAasItems, ...pageItems];
          currentPage++;
        } else {
          hasMorePages = false;
        }
      }
      allData.aas = allAasItems;
      allData.loaded = true;
      menuCounts.value = calculateMenuCounts(allData.aas);
    } catch (err) {
      console.error('XX 대시보드용 데이터 로딩 실패:', err);
      allData.loaded = false;
    } finally {
      allData.loadingInProgress = false;
    }
  };

  const displayCurrentMenuData = async () => {
    loading.value = true
    treeData.value = []
    error.value = null
    let allAasForMenu = []; // catch 블록에서도 참조할 수 있도록 외부로 선언

    try {
      const keywords = EQUIPMENT_KEYWORDS[currentMenu.value] || [];
      
      if (currentMenu.value === MENU_TYPES.SPECIAL.ALL) {
        error.value = 'Please start by searching or select a category.';
      } else if (keywords.length > 0) {
        const keyword = keywords[0];
        let currentPage = 1;
        let hasMorePages = true;

        while (hasMorePages) {
          const responseData = await dataAPI.getAASByKeyword(keyword, currentPage);
          const pageItems = responseData.message || [];
          
          if (pageItems.length > 0) {
            allAasForMenu.push(...pageItems);
            currentPage++;
          } else {
            hasMorePages = false;
          }
        }
        
        const filteredList = allAasForMenu.filter(aas => !isExcludedComponentAAS(aas));

        if (filteredList.length === 0) {
          error.value = `${getMenuDisplayName(currentMenu.value)}: No data in range.`;
        }
        treeData.value = transformApiToTree(filteredList, []);

      } else {
         error.value = `No API keyword defined for menu: ${currentMenu.value}`;
      }

    } catch (err) {
      // [수정] 에러 디버깅을 위한 상세 로그 추가
      console.error("==================================================");
      console.error("XX 메뉴 데이터 처리 중 심각한 오류 발생 XX");
      console.error("- 에러 객체:", err);
      console.error("- 오류 발생 시점의 메뉴:", currentMenu.value);
      // 에러가 발생하기 직전에 받은 전체 데이터가 allAasForMenu에 들어있을 수 있습니다.
      // 이 데이터를 출력하여 어떤 데이터에서 문제가 발생하는지 확인합니다.
      console.error("- 오류를 유발한 것으로 추정되는 원본 데이터:", allAasForMenu);
      console.error("==================================================");
      
      error.value = 'Failed to load data. Please try again.';
      treeData.value = [];
    } finally {
      loading.value = false
    }
  };

  const changeMenu = async (menuType) => {
    if (currentMenu.value === menuType && treeData.value.length > 0) return;
    currentMenu.value = menuType
    selectedNode.value = null
    searchFilters.filterValue = ''
    error.value = null
    await displayCurrentMenuData()
  };

  const performSearch = async () => {
    if (!searchFilters.filterValue.trim()) {
      error.value = 'Please enter a search term.';
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const searchResult = await searchAPI.searchByFilter(
        searchFilters.filterType,
        searchFilters.filterValue
      );

      if (searchResult && searchResult.code === 200) {
        let searchedAAS = [];
        let submodelsFromAPI = [];

        if (searchResult.message && searchResult.message.length > 0) {
          const firstMessage = searchResult.message[0];
          searchedAAS = firstMessage.aas ? (Array.isArray(firstMessage.aas) ? firstMessage.aas : [firstMessage.aas]) : [];
          submodelsFromAPI = firstMessage.submodels ? (Array.isArray(firstMessage.submodels) ? firstMessage.submodels : [firstMessage.submodels]) : [];
        }
        
        const finalAAS = filterAASByMenuType(searchedAAS, currentMenu.value);

        if (finalAAS.length === 0) {
          error.value = 'No search results found for the current menu.';
          treeData.value = [];
        } else {
          treeData.value = transformApiToTree(finalAAS, submodelsFromAPI, searchFilters.filterValue);
        }
      } else {
        throw new Error('Search returned no results.');
      }
    } catch (err) {
      error.value = err.message || 'An error occurred during the search.';
      treeData.value = [];
    } finally {
      loading.value = false;
    }
  };
  
  const clearSearch = async () => {
    searchFilters.filterValue = ''
    selectedNode.value = null
    error.value = null
    await displayCurrentMenuData()
  };

  const toggleNode = async (nodeId) => {
    const findAndToggle = async (nodes) => {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.id === nodeId) {
          node.expanded = !node.expanded;
          if (node.type === 'submodel' && node.expanded && (!node.children || node.children[0]?.type === 'placeholder')) {
            try {
              node.children = [{type: 'placeholder', id: 'loading', name: 'Loading...'}];
              const encodedId = btoa(node.id);
              const response = await apiClient.get(`/submodel/${encodedId}`);
              if (response.data && response.data.message) {
                node.data = response.data.message;
                if (node.data.submodelElements && Array.isArray(node.data.submodelElements)) {
                  node.children = transformSubmodelElements(node.data.submodelElements, node.id);
                } else {
                  node.children = [];
                }
              }
            } catch (error) {
              console.error('Submodel data load failed:', error);
              node.children = [{type: 'element', id: 'error', name: 'Failed to load data'}];
            }
          }
          return true;
        }
        if (node.children && await findAndToggle(node.children)) return true;
      }
      return false;
    };
    await findAndToggle(treeData.value);
    treeData.value = [...treeData.value];
  };

  const selectNode = async (node) => {
    selectedNode.value = node;
    
    if (node.type === 'submodel' && !node.data) {
      try {
        loading.value = true;
        const encodedId = btoa(node.id);
        const response = await apiClient.get(`/submodel/${encodedId}`);
        if(response.data.message){
            node.data = response.data.message;
            if (node.data.submodelElements && Array.isArray(node.data.submodelElements)) {
              node.children = transformSubmodelElements(node.data.submodelElements, node.id);
            } else {
              node.children = [];
            }
        }
      } catch (error) {
        error.value = 'Failed to load submodel data.';
      } finally {
        loading.value = false;
      }
    }
    selectedNode.value = { ...node };
    treeData.value = updateSelectedNode(treeData.value, node.id);
  };
  
  return {
    loading, error, selectedNode, treeData, searchFilters, filterOptions,
    currentMenu, allData, filteredAAS, menuCounts, currentMenuDisplayName,
    hasResults, selectedNodeDetail, 
    loadAllDataForDashboard, 
    loadInitialData: loadAllDataForDashboard,
    changeMenu, 
    performSearch, 
    clearSearch, 
    toggleNode, 
    selectNode
  };
}