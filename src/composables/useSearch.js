import { ref, reactive, computed, watch } from 'vue' // Vue의 반응성 시스템에서 필요한 함수들을 import
import apiClient, { dataAPI, searchAPI } from '@/services/api' // API 클라이언트 및 특정 API 엔드포인트들을 import
import {
  transformApiToTree,
  transformSubmodelSearch,
  transformConceptSearch,
  updateSelectedNode,
  transformSubmodelElements,
} from '@/utils/dataTransform' // 데이터를 트리 구조로 변환하거나 노드를 조작하는 유틸리티 함수들을 import
import {
  isExcludedComponentAAS,
  filterAASByMenuType,
  calculateMenuCounts,
  getMenuDisplayName,
  MENU_TYPES,
  EQUIPMENT_KEYWORDS,
} from '@/utils/menuFilters' // 메뉴 필터링, 카운트 계산 등 메뉴 관련 유틸리티 함수와 상수들을 import

/**
 * 검색 관련 로직과 상태를 캡슐화한 Composable 함수를 정의
 */
export function useSearch() {
  // --- 상태 관리 --- //
  const loading = ref(false) // 로딩 상태 (데이터를 가져오는 중인지 여부)
  const error = ref(null) // 에러 메시지 저장
  const selectedNode = ref(null) // 트리에서 사용자가 선택한 노드 정보
  const treeData = ref([]) // 화면에 표시될 트리 구조 데이터
  const allData = reactive({
    // 대시보드 및 전체 데이터 캐싱용 객체
    aas: [], // 모든 AAS(Asset Administration Shell) 데이터
    loaded: false, // 모든 데이터 로딩 완료 여부
    loadingInProgress: false, // 중복 로딩 방지를 위한 진행 상태 플래그
  })
  const currentMenu = ref(MENU_TYPES.EQUIPMENT.TIG) // 현재 선택된 메뉴 타입
  const searchFilters = reactive({
    // 검색 필터 조건
    filterType: 'aas', // 필터 종류 - 기본값을 'aas'로 설정
    filterValue: '', // 필터 값
  })
  const menuCounts = ref({}) // 각 메뉴별 데이터 개수
  const pagination = reactive({
    currentPage: 1,
    hasMorePages: true,
    isLoadingMore: false,
  })

  // --- 계산된 속성 (Computed Properties) --- //
  // 현재 메뉴에 따라 동적으로 필터 옵션을 결정
  const filterOptions = computed(() => {
    if (currentMenu.value === MENU_TYPES.SPECIAL.ALL) {
      return [
        { value: 'aas', label: 'AAS' },
        { value: 'submodel', label: 'Submodel' },
        { value: 'conceptdescription', label: 'Concept Description' },
      ]
    }

    // Welding Equipment 필터
    const weldingMenus = [
      'CO2',
      'TIG',
      'MIG',
      'MAG',
      'EBW',
      'FW',
      'OAW',
      'PW',
      'RSEW',
      'RSW',
      'SAW',
      'SMAW',
      'Sold',
      'SW',
      'UW',
    ]
    if (weldingMenus.includes(currentMenu.value)) {
      return [
        { value: 'inputpowervoltage', label: 'Input Power Voltage' },
        { value: 'ratedoutputcurrent', label: 'Rated Output Current' },
        { value: 'dutycycle', label: 'Duty Cycle' },
        { value: 'wirefeedspeed', label: 'Wire Feed Speed' },
        { value: 'weldingspeed', label: 'Welding Speed' },
        { value: 'gasflowrate', label: 'Gas Flow Rate' },
      ]
    }

    // CNC Equipment 필터
    const cncMenus = ['CNC_Milling', 'CNC_Turning', 'CNC_Drilling']
    if (cncMenus.includes(currentMenu.value)) {
      return [
        { value: 'spindlespeed', label: 'Spindle Speed' },
        { value: 'feedrate', label: 'Feed Rate' },
        { value: 'tooldiameter', label: 'Tool Diameter' },
        { value: 'cuttingdepth', label: 'Cutting Depth' },
        { value: 'accuracy', label: 'Accuracy' },
        { value: 'workareasize', label: 'Work Area Size' },
      ]
    }

    // Press Equipment 필터
    const pressMenus = ['Press_Stamping', 'Press_Forming', 'Press_Bending']
    if (pressMenus.includes(currentMenu.value)) {
      return [
        { value: 'pressforce', label: 'Press Force' },
        { value: 'strokelength', label: 'Stroke Length' },
        { value: 'speed', label: 'Speed' },
        { value: 'bedsize', label: 'Bed Size' },
        { value: 'shutheight', label: 'Shut Height' },
        { value: 'energyconsumption', label: 'Energy Consumption' },
      ]
    }

    // AMR 필터
    if (currentMenu.value === 'AMR') {
      return [
        { value: 'modelname', label: 'Model Name' },
        { value: 'loadcapacity', label: 'Load Capacity' },
        { value: 'speed', label: 'Speed' },
        { value: 'batterytype', label: 'Battery Type' },
        { value: 'navigationtype', label: 'Navigation Type' },
        { value: 'status', label: 'Status' },
      ]
    }

    // Boring 필터
    if (currentMenu.value === 'Boring') {
      return [
        { value: 'boringdiameter', label: 'Boring Diameter' },
        { value: 'spindlespeed', label: 'Spindle Speed' },
        { value: 'feedrate', label: 'Feed Rate' },
        { value: 'accuracy', label: 'Accuracy' },
        { value: 'tooltype', label: 'Tool Type' },
        { value: 'coolanttype', label: 'Coolant Type' },
      ]
    }

    // Robot 필터
    if (currentMenu.value === 'Robot') {
      return [
        { value: 'robottype', label: 'Robot Type' },
        { value: 'payload', label: 'Payload' },
        { value: 'reach', label: 'Reach' },
        { value: 'repeatability', label: 'Repeatability' },
        { value: 'axes', label: 'Number of Axes' },
        { value: 'controller', label: 'Controller Type' },
      ]
    }

    // Material 필터
    const materialMenus = Object.values(MENU_TYPES.MATERIAL)
    if (materialMenus.includes(currentMenu.value)) {
      return [
        { value: 'materialgrade', label: 'Material Grade' },
        { value: 'thickness', label: 'Thickness' },
        { value: 'hardness', label: 'Hardness' },
        { value: 'supplier', label: 'Supplier' },
        { value: 'batchnumber', label: 'Batch Number' },
        { value: 'certificate', label: 'Certificate' },
      ]
    }

    // Process 필터
    const processMenus = Object.values(MENU_TYPES.PROCESS)
    if (processMenus.includes(currentMenu.value)) {
      return [
        { value: 'processtime', label: 'Process Time' },
        { value: 'temperature', label: 'Temperature' },
        { value: 'pressure', label: 'Pressure' },
        { value: 'tolerance', label: 'Tolerance' },
        { value: 'processid', label: 'Process ID' },
        { value: 'operator', label: 'Operator' },
      ]
    }

    // Operation 필터
    const operationMenus = Object.values(MENU_TYPES.OPERATION)
    if (operationMenus.includes(currentMenu.value)) {
      return [
        { value: 'equipmentid', label: 'Equipment ID' },
        { value: 'operationstatus', label: 'Operation Status' },
        { value: 'shift', label: 'Shift' },
        { value: 'efficiencyrate', label: 'Efficiency Rate' },
        { value: 'alarmtype', label: 'Alarm Type' },
        { value: 'maintenancetype', label: 'Maintenance Type' },
      ]
    }

    // Quality 필터
    const qualityMenus = Object.values(MENU_TYPES.QUALITY)
    if (qualityMenus.includes(currentMenu.value)) {
      return [
        { value: 'inspectiontype', label: 'Inspection Type' },
        { value: 'passfail', label: 'Pass/Fail' },
        { value: 'defectcode', label: 'Defect Code' },
        { value: 'measurementvalue', label: 'Measurement Value' },
        { value: 'inspectorname', label: 'Inspector Name' },
        { value: 'standard', label: 'Standard' },
      ]
    }

    // Production 필터
    const productionMenus = Object.values(MENU_TYPES.PRODUCTION)
    if (productionMenus.includes(currentMenu.value)) {
      return [
        { value: 'ordernumber', label: 'Order Number' },
        { value: 'productcode', label: 'Product Code' },
        { value: 'productiondate', label: 'Production Date' },
        { value: 'quantity', label: 'Quantity' },
        { value: 'linenumber', label: 'Line Number' },
        { value: 'customer', label: 'Customer' },
      ]
    }

    // 기본 필터 (fallback)
    return [
      { value: 'id', label: 'ID' },
      { value: 'name', label: 'Name' },
      { value: 'type', label: 'Type' },
      { value: 'status', label: 'Status' },
    ]
  })

  // 현재 선택된 필터에 따라 동적으로 플레이스홀더를 결정
  const placeholder = computed(() => {
    // All AAS 메뉴에서 필터 타입별 플레이스홀더
    if (currentMenu.value === MENU_TYPES.SPECIAL.ALL) {
      if (!searchFilters.filterType) {
        return 'Select a filter type first'
      }
      const allMenuExamples = {
        aas: 'Enter AAS ID (e.g., CO2) or leave empty for all',
        submodel: 'Enter Submodel ID (e.g., 180SL7) - Required',
        conceptdescription: 'Enter Concept ID (e.g., homepage) - Required',
      }
      return allMenuExamples[searchFilters.filterType] || 'Enter ID to search'
    }

    // 일반 메뉴에서의 플레이스홀더
    const examples = {
      numberofphases: 'e.g., Three',
      inputpowervoltage: 'e.g., 380, 220',
      ratedfrequency: 'e.g., 60',
      ratedoutputcurrent: 'e.g., 500, 350',
      'inputcapacity/kw': 'e.g., 6.5',
      dutycycle: 'e.g., 60, 100',
    }
    return examples[searchFilters.filterType] || 'Input a value'
  })

  const filteredAAS = computed(() => treeData.value) // 현재 트리 데이터를 외부에 제공하기 위한 computed 속성
  const currentMenuDisplayName = computed(() => getMenuDisplayName(currentMenu.value)) // 현재 메뉴의 표시 이름
  const hasResults = computed(() => treeData.value && treeData.value.length > 0) // 검색 결과 존재 여부
  const selectedNodeDetail = computed(() => (selectedNode.value ? selectedNode.value.data : null)) // 선택된 노드의 상세 데이터

  /**
   * 대시보드용 전체 데이터를 로드
   */
  const loadAllDataForDashboard = async () => {
    // 이미 로드되었거나 로딩 중이면 중복 실행 방지
    if (allData.loaded || allData.loadingInProgress) return
    allData.loadingInProgress = true
    try {
      let allAasItems = []
      let currentPage = 1
      let hasMorePages = true

      // 페이지네이션된 API에서 모든 데이터를 가져올 때까지 반복
      while (hasMorePages) {
        const response = await dataAPI.getAllAAS(currentPage)
        const pageItems = response.message || []
        if (pageItems.length > 0) {
          allAasItems = [...allAasItems, ...pageItems]
          currentPage++
        } else {
          hasMorePages = false // 더 이상 데이터가 없으면 반복 종료
        }
      }
      allData.aas = allAasItems // 가져온 모든 데이터를 저장
      allData.loaded = true // 로딩 완료로 표시
      menuCounts.value = calculateMenuCounts(allData.aas) // 메뉴별 카운트 계산
    } catch (err) {
      console.error('XX 대시보드용 데이터 로딩 실패:', err)
      allData.loaded = false
    } finally {
      allData.loadingInProgress = false // 로딩 진행 상태 해제
    }
  }

  /**
   * 현재 선택된 메뉴에 해당하는 데이터를 화면에 표시
   */
  const displayCurrentMenuData = async (page = 1) => {
    if (page === 1) {
      loading.value = true
      treeData.value = []
      error.value = null
    } else {
      pagination.isLoadingMore = true
    }

    try {
      if (currentMenu.value === MENU_TYPES.SPECIAL.ALL) {
        // 'ALL' 메뉴 선택 시, 빈 상태로 표시 (사용자가 필터를 선택하도록)
        loading.value = false
        return
      }

      // globalAssetId API를 사용하는 메뉴들 정의
      const globalAssetIdMenus = {
        // Welding 장비들 - 모두 WeldingProcess 사용
        'CO2': 'WeldingProcess',
        'TIG': 'WeldingProcess',
        'MIG': 'WeldingProcess',
        'MAG': 'WeldingProcess',
        'EBW': 'WeldingProcess',
        'FW': 'WeldingProcess',
        'OAW': 'WeldingProcess',
        'PW': 'WeldingProcess',
        'RSEW': 'WeldingProcess',
        'RSW': 'WeldingProcess',
        'SAW': 'WeldingProcess',
        'SMAW': 'WeldingProcess',
        'Sold': 'WeldingProcess',
        'SW': 'WeldingProcess',
        'UW': 'WeldingProcess',
        // CNC 장비들
        'CNC_Milling': 'ComputerNumericalControlProcess',
        'CNC_Turning': 'ComputerNumericalControlProcess',
        'CNC_Drilling': 'ComputerNumericalControlProcess',
        // Press 장비들 - 실제 globalAssetId 패턴에 맞게 설정
        'Press_Stamping': 'PressProcessMachine',
        'Press_Forming': 'PressProcess',
        'Press_Bending': 'MechanicalType',  // 특별 처리를 위해 직접 MechanicalType 사용
        'Press_Line': 'PressProcess',
        // 기타 장비들
        'AMR': 'AMR',
        'Boring': 'Boring',
        'Robot': 'Robot'
      }

      // globalAssetId API를 사용하는 메뉴인지 확인
      if (globalAssetIdMenus[currentMenu.value]) {
        const globalAssetIdKeyword = globalAssetIdMenus[currentMenu.value]

        try {
          let response

          // Welding 메뉴들은 combined API 사용
          const weldingMenus = ['CO2', 'TIG', 'MIG', 'MAG', 'EBW', 'FW', 'OAW', 'PW', 'RSEW', 'RSW', 'SAW', 'SMAW', 'Sold', 'SW', 'UW']

          // Press 메뉴들도 combined API 사용
          const pressMenus = ['Press_Stamping', 'Press_Forming', 'Press_Bending', 'Press_Line']

          // CNC 메뉴들도 combined API 사용
          const cncMenus = ['CNC_Milling', 'CNC_Turning', 'CNC_Drilling']

          if (weldingMenus.includes(currentMenu.value)) {
            // 각 타입별 keyword 매핑
            const weldingKeywords = {
              'CO2': 'CO2',
              'TIG': 'TIG',
              'MIG': 'MIG',
              'MAG': 'MAG',
              'EBW': 'ElectronBeam',  // EBW는 ElectronBeamWeldingType 형태
              'FW': 'FW',
              'OAW': 'OAW',
              'PW': 'PW',
              'RSEW': 'RSEW',
              'RSW': 'RSW',
              'SAW': 'SAW',
              'SMAW': 'SMAW',
              'Sold': 'Sold',
              'SW': 'SW',
              'UW': 'UW'
            }

            const typeKeyword = weldingKeywords[currentMenu.value]
            response = await apiClient.get('/aas/search/combined', {
              params: {
                globalAssetId: globalAssetIdKeyword,
                keyword: typeKeyword,
                page
              }
            })
          } else if (pressMenus.includes(currentMenu.value)) {
            // Press 메뉴들도 combined API 사용하여 정확한 필터링
            const pressKeywords = {
              'Press_Stamping': 'Cutoff',
              'Press_Forming': 'HydraulicType',
              'Press_Bending': 'MechanicalType',
              'Press_Line': 'ServoType'
            }

            const typeKeyword = pressKeywords[currentMenu.value]
            const globalAssetIdPattern = 'PressProcess'

            console.log('Press Menu Debug:', {
              currentMenu: currentMenu.value,
              globalAssetIdPattern,
              typeKeyword
            })

            response = await apiClient.get('/aas/search/combined', {
              params: {
                globalAssetId: globalAssetIdPattern,
                keyword: typeKeyword,
                page
              }
            })
          } else if (cncMenus.includes(currentMenu.value)) {
            // CNC 타입별 keyword 매핑
            const cncKeywords = {
              'CNC_Milling': 'A600',
              'CNC_Turning': 'Lynx',
              'CNC_Drilling': 'XD'
            }

            const typeKeyword = cncKeywords[currentMenu.value]
            response = await apiClient.get('/aas/search/combined', {
              params: {
                globalAssetId: globalAssetIdKeyword,
                keyword: typeKeyword,
                page
              }
            })
          } else {
            // 다른 메뉴들은 기존 globalAssetId API 사용
            response = await apiClient.get('/aas/search/globalAssetId', {
              params: { keyword: globalAssetIdKeyword, page }
            })
          }

          if (response.data && response.data.message) {
            // 페이징 응답인 경우 content 필드에서 데이터 추출
            let pageItems = []
            if (response.data.message.content) {
              // 페이징 응답 구조
              pageItems = response.data.message.content || []
              pagination.hasMorePages = !response.data.message.last
            } else if (Array.isArray(response.data.message)) {
              // 배열 응답 구조
              pageItems = response.data.message
              pagination.hasMorePages = pageItems.length >= 10
            } else {
              console.error('Unexpected response structure:', response.data.message)
            }


            if (pageItems.length > 0) {
              const newTreeNodes = transformApiToTree(pageItems, [])
              if (page === 1) {
                treeData.value = newTreeNodes
              } else {
                treeData.value.push(...newTreeNodes)
              }
              pagination.currentPage = page
              // hasMorePages는 위에서 이미 설정됨
            } else {
              if (page === 1) {
                error.value = `${getMenuDisplayName(currentMenu.value)}: No data found.`
              }
            }
          }
        } catch (err) {
          console.error('globalAssetId search failed:', err)
          if (page === 1) {
            error.value = 'Failed to load data. Please try again.'
          }
        }

      } else {
        // 기존 방식 (다른 메뉴들)
        const keywords = EQUIPMENT_KEYWORDS[currentMenu.value] || []
        if (keywords.length > 0) {
          const keyword = keywords[0]
          const responseData = await dataAPI.getAASByKeyword(keyword, page)
          const pageItems = (responseData.message || []).filter((aas) => !isExcludedComponentAAS(aas))

          if (pageItems.length > 0) {
            const newTreeNodes = transformApiToTree(pageItems, [])
            if (page === 1) {
              treeData.value = newTreeNodes
            } else {
              treeData.value.push(...newTreeNodes)
            }
            pagination.currentPage = page
            pagination.hasMorePages = true
          } else {
            pagination.hasMorePages = false
            if (page === 1) {
              error.value = `${getMenuDisplayName(currentMenu.value)}: No data in range.`
            }
          }
        } else {
          error.value = `No API keyword defined for menu: ${currentMenu.value}`
        }
      }
    } catch (err) {
      console.error('Failed to load menu data:', err)
      error.value = 'Failed to load data. Please try again.'
      treeData.value = []
    } finally {
      loading.value = false
      pagination.isLoadingMore = false
    }
  }

  /**
   * 메뉴를 변경하는 함수
   */
  const changeMenu = async (menuType) => {
    if (currentMenu.value === menuType && treeData.value.length > 0) return
    currentMenu.value = menuType
    selectedNode.value = null
    // All AAS 메뉴일 때는 filterType을 'aas'로 설정
    if (menuType === MENU_TYPES.SPECIAL.ALL) {
      searchFilters.filterType = 'aas'
    } else {
      searchFilters.filterType = ''
    }
    searchFilters.filterValue = ''
    error.value = null
    pagination.currentPage = 1
    pagination.hasMorePages = true
    await displayCurrentMenuData(1)
  }

  /**
   * 검색을 수행하는 함수
   */
  const performSearch = async (page = 1) => {
    if (page === 1) {
      // AAS 필터 선택 시 검색어 없어도 전체 검색 가능
      if (
        currentMenu.value === MENU_TYPES.SPECIAL.ALL &&
        searchFilters.filterType === 'aas' &&
        !searchFilters.filterValue.trim()
      ) {
        // 첫 페이지일 때만 초기화
        if (page === 1) {
          loading.value = true
          treeData.value = []
          error.value = null
        } else {
          pagination.isLoadingMore = true
        }

        try {
          const response = await dataAPI.getAllAAS(page)
          const pageItems = response.message || []

          if (pageItems.length > 0) {
            const newTreeNodes = transformApiToTree(pageItems, [])
            if (page === 1) {
              treeData.value = newTreeNodes // 첫 페이지는 데이터 초기화
            } else {
              treeData.value.push(...newTreeNodes) // 이후 페이지는 추가
            }
            pagination.currentPage = page
            // 60개 이상이면 다음 페이지가 있을 가능성이 높음
            pagination.hasMorePages = pageItems.length >= 60
          } else {
            pagination.hasMorePages = false
            if (page === 1) {
              error.value = 'No AAS data found'
            }
          }
        } catch {
          error.value = 'Failed to load AAS data'
          pagination.hasMorePages = false
        } finally {
          if (page === 1) {
            loading.value = false
          } else {
            pagination.isLoadingMore = false
          }
        }
        return
      }

      // Submodel, ConceptDescription 선택 시 검색어 필수
      if (
        currentMenu.value === MENU_TYPES.SPECIAL.ALL &&
        searchFilters.filterType &&
        searchFilters.filterType !== 'aas' &&
        !searchFilters.filterValue.trim()
      ) {
        error.value = 'Please enter search keyword'
        return
      }

      loading.value = true
      treeData.value = []
      error.value = null
    } else {
      pagination.isLoadingMore = true
    }

    try {
      let results = []
      let submodelsFromAPI = [] // Only used in specific cases

      if (currentMenu.value === MENU_TYPES.SPECIAL.ALL) {
        const searchValue = searchFilters.filterValue
        const response = await searchAPI.searchByKeyword(
          searchFilters.filterType,
          searchValue,
          page,
        )

        if (response && response.code === 200) {
          results = response.message || []
          // Fallback for conceptdescription on the first page
          if (
            page === 1 &&
            results.length === 0 &&
            searchFilters.filterType === 'conceptdescription' &&
            searchValue.toLowerCase() !== searchValue
          ) {
            const fallbackResponse = await searchAPI.searchByKeyword(
              searchFilters.filterType,
              searchValue.toLowerCase(),
              page,
            )
            results = fallbackResponse.message || []
          }
        }
      } else {
        const response = await searchAPI.searchByFilter(
          searchFilters.filterType,
          searchFilters.filterValue,
        )
        if (response && response.code === 200 && response.message && response.message.length > 0) {
          const firstMessage = response.message[0]
          const searchedAAS = firstMessage.aas
            ? Array.isArray(firstMessage.aas)
              ? firstMessage.aas
              : [firstMessage.aas]
            : []
          submodelsFromAPI = firstMessage.submodels
            ? Array.isArray(firstMessage.submodels)
              ? firstMessage.submodels
              : [firstMessage.submodels]
            : []
          results = filterAASByMenuType(searchedAAS, currentMenu.value)
        }
      }

      if (results.length > 0) {
        let newTreeNodes
        if (searchFilters.filterType === 'submodel') {
          newTreeNodes = transformSubmodelSearch(results, searchFilters.filterValue)
        } else if (searchFilters.filterType === 'conceptdescription') {
          newTreeNodes = transformConceptSearch(results)
        } else {
          newTreeNodes = transformApiToTree(results, submodelsFromAPI, searchFilters.filterValue)
        }
        if (page === 1) {
          treeData.value = newTreeNodes // 첫 페이지는 데이터 초기화
        } else {
          treeData.value.push(...newTreeNodes) // 이후 페이지는 추가
        }
        pagination.currentPage = page
        pagination.hasMorePages = true
      } else {
        pagination.hasMorePages = false
        if (page === 1) {
          error.value = 'No search results found for the current menu.'
        }
      }
    } catch (err) {
      error.value = err.message || 'An error occurred during the search.'
      if (page === 1) treeData.value = []
    } finally {
      if (page === 1) loading.value = false
      pagination.isLoadingMore = false
    }
  }

  /**
   * 검색 필터를 초기화하고 원래 메뉴 데이터로 돌아가는 함수
   */
  const clearSearch = async () => {
    searchFilters.filterValue = ''
    selectedNode.value = null
    error.value = null
    pagination.currentPage = 1
    pagination.hasMorePages = true
    await displayCurrentMenuData(1)
  }

  /**
   * 트리의 노드를 확장하거나 축소하는 함수
   */
  const toggleNode = async (nodeId) => {
    // 재귀적으로 노드를 찾아 상태를 변경하는 내부 함수
    const findAndToggle = async (nodes) => {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        if (node.id === nodeId) {
          node.expanded = !node.expanded
          // 서브모델 노드를 처음 확장할 때, 자식 데이터(Submodel Elements)를 API로 요청
          if (
            node.type === 'submodel' &&
            node.expanded &&
            (!node.children || node.children[0]?.type === 'placeholder')
          ) {
            try {
              node.children = [{ type: 'placeholder', id: 'loading', name: 'Loading...' }]
              const encodedId = btoa(node.id) // ID를 Base64로 인코딩
              const response = await apiClient.get(`/submodel/${encodedId}`)
              if (response.data && response.data.message) {
                node.data = response.data.message // 노드에 상세 데이터 저장

                // Submodel Elements가 있으면 트리 자식 노드로 변환
                if (node.data.submodelElements && Array.isArray(node.data.submodelElements)) {
                  node.children = transformSubmodelElements(node.data.submodelElements, node.id)
                } else {
                  node.children = []
                }
              }
            } catch (error) {
              console.error('Submodel data load failed:', error)
              node.children = [{ type: 'element', id: 'error', name: 'Failed to load data' }]
            }
          }
          return true // 노드를 찾았으면 true 반환
        }
        if (node.children && (await findAndToggle(node.children))) return true // 자식 노드에서 재귀적으로 탐색
      }
      return false
    }
    await findAndToggle(treeData.value)

    // Vue가 배열의 변경을 감지하도록 새로운 배열을 할당하여 트리 뷰를 강제로 업데이트
    treeData.value = [...treeData.value]
  }

  // 트리의 노드를 선택하는 함수
  const selectNode = async (node) => {
    selectedNode.value = node

    // 서브모델 노드를 선택했고, 상세 데이터가 아직 로드되지 않았다면 API로 요청
    if (node.type === 'submodel' && !node.data) {
      try {
        loading.value = true
        const encodedId = btoa(node.id)
        const response = await apiClient.get(`/submodel/${encodedId}`)
        if (response.data.message) {
          node.data = response.data.message
          if (node.data.submodelElements && Array.isArray(node.data.submodelElements)) {
            node.children = transformSubmodelElements(node.data.submodelElements, node.id)
          } else {
            node.children = []
          }
        }
      } catch (error) {
        error.value = 'Failed to load submodel data.'
      } finally {
        loading.value = false
      }
    }
    // 선택된 노드 정보를 업데이트 (반응성 유지를 위해 복사본 생성)
    selectedNode.value = { ...node }
    // 트리 데이터 내에서 선택된 노드의 'selected' 상태를 업데이트
    treeData.value = updateSelectedNode(treeData.value, node.id)
  }

  // --- 반환 (Return) --- //
  const loadMore = () => {
    if (!pagination.hasMorePages || pagination.isLoadingMore || loading.value) return

    // All AAS 메뉴에서 AAS 필터 선택하고 검색어가 없는 경우 (전체 AAS 검색)
    if (
      currentMenu.value === MENU_TYPES.SPECIAL.ALL &&
      searchFilters.filterType === 'aas' &&
      !searchFilters.filterValue.trim()
    ) {
      performSearch(pagination.currentPage + 1)
      return
    }

    const isSearchActive = searchFilters.filterValue.trim() !== ''

    if (
      isSearchActive ||
      (currentMenu.value === MENU_TYPES.SPECIAL.ALL && searchFilters.filterType)
    ) {
      performSearch(pagination.currentPage + 1)
    } else {
      displayCurrentMenuData(pagination.currentPage + 1)
    }
  }

  watch(currentMenu, () => {
    // All AAS 메뉴일 때는 기본값을 'aas'로 설정
    if (currentMenu.value === MENU_TYPES.SPECIAL.ALL) {
      searchFilters.filterType = 'aas'
    } else {
      searchFilters.filterType = ''
    }
    searchFilters.filterValue = ''
  })

  // 자동 페이지 로딩 - 페이지 1 로드 후 자동으로 페이지 2, 3 로드
  watch(
    treeData,
    (newData) => {
      // Automatically load up to page 3.
      const loadNextPage = (page) => {
        if (
          pagination.currentPage === page - 1 &&
          pagination.hasMorePages &&
          !pagination.isLoadingMore
        ) {
          console.log(`Auto-loading page ${page}...`)
          loadMore()
        }
      }

      if (pagination.currentPage === 1 && newData.length > 0) {
        setTimeout(() => loadNextPage(2), 500)
      }
      if (pagination.currentPage === 2 && newData.length > 0) {
        setTimeout(() => loadNextPage(3), 500)
      }
    },
    { deep: true },
  )

  return {
    loading,
    error,
    selectedNode,
    treeData,
    searchFilters,
    filterOptions,
    placeholder,
    pagination,
    currentMenu,
    allData,
    filteredAAS,
    menuCounts,
    currentMenuDisplayName,
    hasResults,
    selectedNodeDetail,
    loadAllDataForDashboard,
    loadInitialData: loadAllDataForDashboard,
    changeMenu,
    performSearch,
    clearSearch,
    toggleNode,
    selectNode,
    loadMore,
  }
}
