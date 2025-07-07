import { ref, reactive, computed, watch } from 'vue' // Vue의 반응성 시스템에서 필요한 함수들을 import
import apiClient, { dataAPI, searchAPI } from '@/services/api' // API 클라이언트 및 특정 API 엔드포인트들을 import
import { transformApiToTree, transformSubmodelSearch, transformConceptSearch, toggleNodeExpanded, updateSelectedNode, transformSubmodelElements } from '@/utils/dataTransform'// 데이터를 트리 구조로 변환하거나 노드를 조작하는 유틸리티 함수들을 import
import { isExcludedComponentAAS, filterAASByMenuType, calculateMenuCounts, getMenuDisplayName, MENU_TYPES, EQUIPMENT_KEYWORDS } from '@/utils/menuFilters' // 메뉴 필터링, 카운트 계산 등 메뉴 관련 유틸리티 함수와 상수들을 import

/**
 * 검색 관련 로직과 상태를 캡슐화한 Composable 함수를 정의
 */
export function useSearch() {
   // --- 상태 관리 --- //
  const loading = ref(false) // 로딩 상태 (데이터를 가져오는 중인지 여부)
  const error = ref(null) // 에러 메시지 저장
  const selectedNode = ref(null) // 트리에서 사용자가 선택한 노드 정보
  const treeData = ref([]) // 화면에 표시될 트리 구조 데이터
  const allData = reactive({ // 대시보드 및 전체 데이터 캐싱용 객체
    aas: [], // 모든 AAS(Asset Administration Shell) 데이터
    loaded: false, // 모든 데이터 로딩 완료 여부
    loadingInProgress: false, // 중복 로딩 방지를 위한 진행 상태 플래그
  })
  const submodelCache = ref(new Map()) // 서브모델 데이터 캐싱용 Map
  const currentMenu = ref(MENU_TYPES.EQUIPMENT.TIG) // 현재 선택된 메뉴 타입
  const searchFilters = reactive({ // 검색 필터 조건
    filterType: '', // 필터 종류
    filterValue: '' // 필터 값
  })
  const menuCounts = ref({}) // 각 메뉴별 데이터 개수
  const pagination = reactive({
    currentPage: 1,
    hasMorePages: true,
    isLoadingMore: false
  })

  // --- 계산된 속성 (Computed Properties) --- //
  // 현재 메뉴에 따라 동적으로 필터 옵션을 결정
  const filterOptions = computed(() => {
    if (currentMenu.value === MENU_TYPES.SPECIAL.ALL) {
      return [
        { value: 'aas', label: 'AAS' },
        { value: 'submodel', label: 'Submodel' },
        { value: 'conceptdescription', label: 'Concept Description' },
      ];
    }
    return [
      { value: 'numberofphases', label: 'Number of Phases' },
      { value: 'inputpowervoltage', label: 'Input Power Voltage' },
      { value: 'ratedfrequency', label: 'Rated Frequency' },
      { value: 'ratedoutputcurrent', label: 'Rated Output Current' },
      { value: 'inputcapacity/kw', label: 'Input Capacity' },
      { value: 'dutycycle', label: 'Duty Cycle' }
    ];
  });

  // 현재 선택된 필터에 따라 동적으로 플레이스홀더를 결정
  const placeholder = computed(() => {
    const examples = {
      'aas': 'e.g., CO2',
      'submodel': 'e.g., 180SL7',
      'conceptdescription': 'e.g., homepage, secondarykeytype',
      'numberofphases': 'e.g., Three',
      'inputpowervoltage': 'e.g., 380, 220',
      'ratedfrequency': 'e.g., 60',
      'ratedoutputcurrent': 'e.g., 500, 350',
      'inputcapacity/kw': 'e.g., 6.5',
      'dutycycle': 'e.g., 60, 100'
    };
    return examples[searchFilters.filterType] || 'Input a value';
  });

  const filteredAAS = computed(() => treeData.value) // 현재 트리 데이터를 외부에 제공하기 위한 computed 속성
  const currentMenuDisplayName = computed(() => getMenuDisplayName(currentMenu.value)) // 현재 메뉴의 표시 이름
  const hasResults = computed(() => treeData.value && treeData.value.length > 0) // 검색 결과 존재 여부
  const selectedNodeDetail = computed(() => selectedNode.value ? selectedNode.value.data : null) // 선택된 노드의 상세 데이터

  /**
   * 대시보드용 전체 데이터를 로드
   */
  const loadAllDataForDashboard = async () => {
    // 이미 로드되었거나 로딩 중이면 중복 실행 방지
    if (allData.loaded || allData.loadingInProgress) return;
    allData.loadingInProgress = true;
    try {
      let allAasItems = [];
      let currentPage = 1;
      let hasMorePages = true;

      // 페이지네이션된 API에서 모든 데이터를 가져올 때까지 반복
      while (hasMorePages) {
        const response = await dataAPI.getAllAAS(currentPage);
        const pageItems = response.message || [];
        if (pageItems.length > 0) {
          allAasItems = [...allAasItems, ...pageItems];
          currentPage++;
        } else {
          hasMorePages = false; // 더 이상 데이터가 없으면 반복 종료
        }
      }
      allData.aas = allAasItems; // 가져온 모든 데이터를 저장
      allData.loaded = true; // 로딩 완료로 표시
      menuCounts.value = calculateMenuCounts(allData.aas); // 메뉴별 카운트 계산
    } catch (err) {
      console.error('XX 대시보드용 데이터 로딩 실패:', err);
      allData.loaded = false;
    } finally {
      allData.loadingInProgress = false; // 로딩 진행 상태 해제
    }
  };

  /**
   * 현재 선택된 메뉴에 해당하는 데이터를 화면에 표시
   */
  const displayCurrentMenuData = async (page = 1) => {
    if (page === 1) {
      loading.value = true;
      treeData.value = [];
      error.value = null;
    } else {
      pagination.isLoadingMore = true;
    }

    try {
      const keywords = EQUIPMENT_KEYWORDS[currentMenu.value] || [];
      if (currentMenu.value === MENU_TYPES.SPECIAL.ALL) {
        // 'ALL' 메뉴 선택 시, 바로 전체 검색 실행
        await performSearch(page);
        loading.value = false;
        return;
      }
      
      if (keywords.length > 0) {
        const keyword = keywords[0];
        const responseData = await dataAPI.getAASByKeyword(keyword, page);
        const pageItems = (responseData.message || []).filter(aas => !isExcludedComponentAAS(aas));

        if (pageItems.length > 0) {
          const newTreeNodes = transformApiToTree(pageItems, []);
          treeData.value.push(...newTreeNodes);
          pagination.currentPage = page;
          pagination.hasMorePages = true; // Assume more pages until an empty response
        } else {
          pagination.hasMorePages = false;
          if (page === 1) {
            error.value = `${getMenuDisplayName(currentMenu.value)}: No data in range.`;
          }
        }
      } else {
        error.value = `No API keyword defined for menu: ${currentMenu.value}`;
      }
    } catch (err) {
      error.value = 'Failed to load data. Please try again.';
      treeData.value = [];
    } finally {
      loading.value = false;
      pagination.isLoadingMore = false;
    }
  };

  /**
   * 메뉴를 변경하는 함수
   */
  const changeMenu = async (menuType) => {
    if (currentMenu.value === menuType && treeData.value.length > 0) return;
    currentMenu.value = menuType
    selectedNode.value = null
    searchFilters.filterValue = ''
    error.value = null
    pagination.currentPage = 1;
    pagination.hasMorePages = true;
    await displayCurrentMenuData(1)
  };

  /**
   * 검색을 수행하는 함수
   */
  const performSearch = async (page = 1) => {
    if (page === 1) {
      // Allow empty search, so remove the check:
      // if (!searchFilters.filterValue.trim()) { ... }
      loading.value = true;
      treeData.value = [];
      error.value = null;
    } else {
      pagination.isLoadingMore = true;
    }

    try {
      let results = [];
      let submodelsFromAPI = []; // Only used in specific cases

      if (currentMenu.value === MENU_TYPES.SPECIAL.ALL) {
        const searchValue = searchFilters.filterValue;
        const response = await searchAPI.searchByKeyword(searchFilters.filterType, searchValue, page);
        
        if (response && response.code === 200) {
          results = response.message || [];
          // Fallback for conceptdescription on the first page
          if (page === 1 && results.length === 0 && searchFilters.filterType === 'conceptdescription' && searchValue.toLowerCase() !== searchValue) {
            const fallbackResponse = await searchAPI.searchByKeyword(searchFilters.filterType, searchValue.toLowerCase(), page);
            results = fallbackResponse.message || [];
          }
        }
      } else {
        const response = await searchAPI.searchByFilter(searchFilters.filterType, searchFilters.filterValue);
        if (response && response.code === 200 && response.message && response.message.length > 0) {
          const firstMessage = response.message[0];
          const searchedAAS = firstMessage.aas ? (Array.isArray(firstMessage.aas) ? firstMessage.aas : [firstMessage.aas]) : [];
          submodelsFromAPI = firstMessage.submodels ? (Array.isArray(firstMessage.submodels) ? firstMessage.submodels : [firstMessage.submodels]) : [];
          results = filterAASByMenuType(searchedAAS, currentMenu.value);
        }
      }

      if (results.length > 0) {
        let newTreeNodes;
        if (searchFilters.filterType === 'submodel') {
          newTreeNodes = transformSubmodelSearch(results, searchFilters.filterValue);
        } else if (searchFilters.filterType === 'conceptdescription') {
          newTreeNodes = transformConceptSearch(results);
        } else {
          newTreeNodes = transformApiToTree(results, submodelsFromAPI, searchFilters.filterValue);
        }
        treeData.value.push(...newTreeNodes);
        pagination.currentPage = page;
        pagination.hasMorePages = true;
      } else {
        pagination.hasMorePages = false;
        if (page === 1) {
          error.value = 'No search results found for the current menu.';
        }
      }
    } catch (err) {
      error.value = err.message || 'An error occurred during the search.';
      if (page === 1) treeData.value = [];
    } finally {
      if (page === 1) loading.value = false;
      pagination.isLoadingMore = false;
    }
  };
  
  /**
   * 검색 필터를 초기화하고 원래 메뉴 데이터로 돌아가는 함수
   */
  const clearSearch = async () => {
    searchFilters.filterValue = ''
    selectedNode.value = null
    error.value = null
    pagination.currentPage = 1;
    pagination.hasMorePages = true;
    await displayCurrentMenuData(1)
  };

  /**
   * 트리의 노드를 확장하거나 축소하는 함수
   */
  const toggleNode = async (nodeId) => {
    // 재귀적으로 노드를 찾아 상태를 변경하는 내부 함수
    const findAndToggle = async (nodes) => {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.id === nodeId) {
          node.expanded = !node.expanded;
          // 서브모델 노드를 처음 확장할 때, 자식 데이터(Submodel Elements)를 API로 요청
          if (node.type === 'submodel' && node.expanded && (!node.children || node.children[0]?.type === 'placeholder')) {
            try {
              node.children = [{type: 'placeholder', id: 'loading', name: 'Loading...'}];
              const encodedId = btoa(node.id); // ID를 Base64로 인코딩
              const response = await apiClient.get(`/submodel/${encodedId}`);
              if (response.data && response.data.message) {
                node.data = response.data.message;// 노드에 상세 데이터 저장

                // Submodel Elements가 있으면 트리 자식 노드로 변환
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
          return true; // 노드를 찾았으면 true 반환
        }
        if (node.children && await findAndToggle(node.children)) return true; // 자식 노드에서 재귀적으로 탐색
      }
      return false;
    };
    await findAndToggle(treeData.value);

    // Vue가 배열의 변경을 감지하도록 새로운 배열을 할당하여 트리 뷰를 강제로 업데이트
    treeData.value = [...treeData.value];
  };

  // 트리의 노드를 선택하는 함수
  const selectNode = async (node) => {
    selectedNode.value = node;
    
    // 서브모델 노드를 선택했고, 상세 데이터가 아직 로드되지 않았다면 API로 요청
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
    // 선택된 노드 정보를 업데이트 (반응성 유지를 위해 복사본 생성)
    selectedNode.value = { ...node };
    // 트리 데이터 내에서 선택된 노드의 'selected' 상태를 업데이트
    treeData.value = updateSelectedNode(treeData.value, node.id);
  };
  
  // --- 반환 (Return) --- //
  const loadMore = () => {
    if (!pagination.hasMorePages || pagination.isLoadingMore || loading.value) return;
    
    const isSearchActive = searchFilters.filterValue.trim() !== '';
    
    if (isSearchActive) {
      performSearch(pagination.currentPage + 1);
    } else {
      displayCurrentMenuData(pagination.currentPage + 1);
    }
  };

  watch(currentMenu, () => {
    searchFilters.filterType = '';
    searchFilters.filterValue = '';
  });

  watch(treeData, (newData) => {
    // Automatically load up to page 3.
    const loadNextPage = (page) => {
      if (pagination.currentPage === page - 1 && pagination.hasMorePages && !pagination.isLoadingMore) {
        console.log(`Auto-loading page ${page}...`);
        loadMore();
      }
    };

    if (pagination.currentPage === 1 && newData.length > 0) {
      setTimeout(() => loadNextPage(2), 1000);
    }
    if (pagination.currentPage === 2 && newData.length > 0) {
      setTimeout(() => loadNextPage(3), 1000);
    }
  }, { deep: true });

  return {
    loading, error, selectedNode, treeData, searchFilters, filterOptions, placeholder, pagination,
    currentMenu, allData, filteredAAS, menuCounts, currentMenuDisplayName,
    hasResults, selectedNodeDetail,
    loadAllDataForDashboard,
    loadInitialData: loadAllDataForDashboard,
    changeMenu,
    performSearch,
    clearSearch,
    toggleNode,
    selectNode,
    loadMore
  };
}