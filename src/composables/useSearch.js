import { ref, reactive, computed, watch } from 'vue' // Vue의 반응성 시스템에서 필요한 함수들을 import
import apiClient from '@/services/api' // API 클라이언트를 import
import { aasService } from '@/services/aasService' // AAS 서비스를 import
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
  getMenuDisplayName,
  MENU_TYPES,
  EQUIPMENT_KEYWORDS,
} from '@/utils/menuFilters' // 메뉴 필터링 등 메뉴 관련 유틸리티 함수와 상수들을 import

/**
 * 검색 관련 로직과 상태를 캡슐화한 Composable 함수를 정의
 */
export function useSearch() {
  // --- 상태 관리 --- //
  const loading = ref(false) // 로딩 상태 (데이터를 가져오는 중인지 여부)
  const error = ref(null) // 에러 메시지 저장
  const selectedNode = ref(null) // 트리에서 사용자가 선택한 노드 정보
  const treeData = ref([]) // 화면에 표시될 트리 구조 데이터
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

    // Welding Equipment 필터 - 백엔드 API에 맞춰 수정
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
        { value: 'welding/search/inputpowervoltage', label: 'Input Power Voltage' },
        { value: 'welding/search/ratedoutputcurrent', label: 'Rated Output Current' },
        { value: 'welding/search/dutycycle', label: 'Duty Cycle' },
        { value: 'welding/search/inputcapacity/kw', label: 'Input Capacity (kW)' },
        { value: 'welding/search/ratedfrequency', label: 'Rated Frequency' },
        { value: 'welding/search/numberofphases', label: 'Number of Phases' },
      ]
    }

    // CNC Equipment 필터
    if (currentMenu.value === 'CNC') {
      return [
        { value: 'cnc/search/spindle/max-speedofrotation', label: 'Max Speed of Rotation' },
        { value: 'cnc/search/spindle/maxtorque', label: 'Max Torque' },
        { value: 'cnc/search/spindle/maxoutputpower', label: 'Max Output Power' },
        { value: 'cnc/search/n-postrapidtransferspeed', label: 'Rapid Transfer Speed' },
        { value: 'cnc/search/allowablevolume/min-allowableload', label: 'Min Allowable Load' },
        { value: 'cnc/search/allowablevolume/max-allowablematerialdiameter', label: 'Max Material Diameter' },
        { value: 'cnc/search/automatictoolchanger/numberoftool', label: 'Number of Tool (ATC)' },
      ]
    }

    // Press Equipment 필터
    const pressMenus = ['Press_Cutting', 'Press_Hydr', 'Press_Mechanical_Type', 'Press_Servo']
    if (pressMenus.includes(currentMenu.value)) {
      // Press_Cutting 전용 필터
      if (currentMenu.value === 'Press_Cutting') {
        return [
          { value: 'press/search/cuttinglength', label: 'Cutting Length' },
          { value: 'press/search/cuttingthickness', label: 'Cutting Thickness' },
          { value: 'press/search/pressurecapacity', label: 'Pressure Capacity' },
          { value: 'press/search/stroke', label: 'Stroke' },
          { value: 'press/search/strokesperminute', label: 'Strokes Per Minute' },
          { value: 'press/search/dieheight', label: 'Die Height' },
        ]
      }
      // 다른 Press 메뉴들의 공통 필터
      return [
        { value: 'press/search/pressurecapacity', label: 'Pressure Capacity' },
        { value: 'press/search/stroke', label: 'Stroke' },
        { value: 'press/search/strokesperminute', label: 'Strokes Per Minute' },
        { value: 'press/search/dieheight', label: 'Die Height' },
        { value: 'press/search/slideadjustment', label: 'Slide Adjustment' },
        { value: 'press/search/slideopening', label: 'Slide Opening' },
        { value: 'press/search/bolsteropening', label: 'Bolster Opening' },
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
   * 통합된 검색 함수 - 모든 메뉴에서 일관된 페이징 지원
   */
  const searchWithKeywords = async (keywords, apiEndpoint, globalAssetId, currentPage) => {
    let allResults = []
    const uniqueIds = new Set()

    console.log(`Searching with keywords: ${keywords.join(', ')}, API: ${apiEndpoint}, GlobalAssetId: ${globalAssetId}`)

    // 모든 키워드로 검색하여 결과 수집
    for (const keyword of keywords) {
      let page = 1
      let hasMore = true
      let keywordResults = 0

      // 각 키워드별로 모든 페이지 가져오기 (최대 20페이지)
      while (hasMore && page <= 20) {
        try {
          const res = await apiClient.get(apiEndpoint, {
            params: {
              ...(globalAssetId && { globalAssetId }),
              keyword: keyword,
              page: page
            }
          })

          if (res.data && res.data.message) {
            let items = []
            if (res.data.message.content) {
              // 페이징 응답
              items = res.data.message.content || []
              hasMore = !res.data.message.last
            } else if (Array.isArray(res.data.message)) {
              // 배열 응답
              items = res.data.message
              hasMore = items.length >= 10
            }

            items.forEach(item => {
              if (item.id && !uniqueIds.has(item.id)) {
                uniqueIds.add(item.id)
                allResults.push(item)
                keywordResults++
              }
            })

            if (items.length === 0) {
              hasMore = false
            }
            page++
          } else {
            hasMore = false
          }
        } catch (err) {
          console.log(`Failed to fetch ${keyword} page ${page}:`, err)
          hasMore = false
        }
      }
      console.log(`Keyword "${keyword}" found ${keywordResults} results`)
    }

    // 결과를 페이지 크기로 나누어 반환
    const pageSize = 10
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const pageResults = allResults.slice(startIndex, endIndex)

    console.log(`Total unique results: ${allResults.length}, Current page: ${currentPage}, Showing: ${startIndex}-${endIndex}`)

    return {
      data: {
        message: {
          content: pageResults,
          last: endIndex >= allResults.length,
          totalElements: allResults.length
        }
      }
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
      pagination.currentPage = 1
      pagination.hasMorePages = true
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
        // CNC 장비 - 통합
        'CNC': 'ComputerNumericalControlProcess',
        // Press 장비들 - 폴더명대로
        'Press_Cutting': 'PressProcess',
        'Press_Hydr': 'PressProcess',
        'Press_Mechanical_Type': 'PressProcess',
        'Press_Servo': 'PressProcess',
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

          // 메뉴별 키워드 정의 - 실제 DB의 idShort 값과 매칭
          const menuKeywords = {
            // Welding 키워드 - DB의 실제 classify 값들
            'CO2': ['CO2Type-classify', 'CO2Type', 'CO2'],
            'TIG': ['TungstenInsertGasType-classify', 'TIG', 'TungstenInsertGas'],
            'MIG': ['MetalInsertGasType-classify', 'MIG', 'MetalInsertGas'],
            'MAG': ['MetalActiveGasType-classify', 'MAG', 'MetalActiveGas'],
            'EBW': ['ElectronBeamWeldingType-classify', 'EBW', 'ElectronBeam'],
            'FW': ['FlasfButtType', 'FrictionWeldingType-classify', 'FW', 'Friction'],
            'OAW': ['OxyAcetyleneWeldingType-classify', 'OAW', 'OxyAcetylene'],
            'PW': ['ProjectionWeldingType-classify', 'PW', 'Projection'],
            'RSEW': ['ResistanceSeamWeldingType-classify', 'RSEW', 'ResistanceSeam'],
            'RSW': ['ResistanceSpotWeldingType-classify', 'RSW', 'ResistanceSpot'],
            'SAW': ['SubmergedArcWeldingType-classify', 'SAW', 'SubmergedArc'],
            'SMAW': ['ShieldedMetalArcType-classify', 'SMAW', 'ShieldedMetal'],
            'Sold': ['SolderingType-classify', 'Sold', 'Soldering'],
            'SW': ['StudWeldingType-classify', 'SW', 'Stud'],
            'UW': ['UltrasonicWeldingType-classify', 'UW', 'Ultrasonic'],
            // CNC 키워드
            'CNC': ['CNCMechanics', 'CNC', 'ComputerNumericalControl'],
            // Press 키워드
            'Press_Cutting': ['Shearing', 'PressMachineShearing', 'Cutting', 'CuttingType', 'Cutoff'],
            'Press_Hydr': ['Hydr', 'HydraulicType', 'Hydraulic'],
            'Press_Mechanical_Type': ['MechanicalType', 'Mechanical'],
            'Press_Servo': ['Servo', 'ServoType'],
            // 기타 장비 키워드
            'AMR': ['AMR', 'HD1500', 'LD90', 'MD650'],
            'Boring': ['Boring', 'DBC130', 'BoringMachine'],
            'Robot': ['Robot', 'HH4', 'IndustrialRobot']
          }

          const keywords = menuKeywords[currentMenu.value]

          if (keywords) {
            // combined API를 사용하는 메뉴들
            const combinedApiMenus = ['CO2', 'TIG', 'MIG', 'MAG', 'EBW', 'FW', 'OAW', 'PW', 'RSEW', 'RSW', 'SAW', 'SMAW', 'Sold', 'SW', 'UW', 'CNC', 'Press_Cutting', 'Press_Hydr', 'Press_Mechanical_Type', 'Press_Servo']

            if (combinedApiMenus.includes(currentMenu.value)) {
              response = await searchWithKeywords(keywords, 'aas/search/combined', globalAssetIdKeyword, page)
            } else {
              // globalAssetId API 사용 (AMR, Boring, Robot)
              response = await searchWithKeywords(keywords, 'aas/search/globalAssetId', null, page)
            }
          } else {
            // 키워드가 정의되지 않은 경우 기본 검색
            response = await apiClient.get('aas/search/globalAssetId', {
              params: { keyword: globalAssetIdKeyword, page }
            })
          }

          if (response && response.data && response.data.message) {
            // 페이징 응답인 경우 content 필드에서 데이터 추출
            let pageItems = []

            if (response.data.message.content) {
              // 페이징 응답 구조
              pageItems = response.data.message.content || []
              pagination.hasMorePages = !response.data.message.last
              console.log(`Page ${page} - content items: ${pageItems.length}`)
            } else if (Array.isArray(response.data.message)) {
              // 배열 응답 구조
              pageItems = response.data.message
              pagination.hasMorePages = pageItems.length >= 10
              console.log(`Page ${page} - array items: ${pageItems.length}`)
            } else {
              console.error('Unexpected response structure:', response.data.message)
            }

            if (pageItems.length > 0) {
              const newTreeNodes = transformApiToTree(pageItems, [])
              console.log(`Transformed ${pageItems.length} items to ${newTreeNodes.length} tree nodes`)

              if (page === 1) {
                treeData.value = newTreeNodes
              } else {
                // 중복 체크를 위해 기존 ID 수집
                const existingIds = new Set(treeData.value.map(item => item.id))
                // 중복되지 않은 항목만 추가
                const uniqueNewNodes = newTreeNodes.filter(node => !existingIds.has(node.id))
                if (uniqueNewNodes.length > 0) {
                  treeData.value.push(...uniqueNewNodes)
                }
              }
              pagination.currentPage = page
              console.log(`Total tree nodes after page ${page}: ${treeData.value.length}`)
            } else {
              console.log(`Page ${page} - No items found`)
            }
            // 에러 설정 부분을 완전히 제거
            // 자동 페이지 로딩이 있으므로 첫 페이지가 비어있어도 문제없음
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
          const responseData = await aasService.searchAASByKeyword(keyword, page)
          const pageItems = (responseData.message || []).filter((aas) => !isExcludedComponentAAS(aas))

          if (pageItems.length > 0) {
            const newTreeNodes = transformApiToTree(pageItems, [])
            if (page === 1) {
              treeData.value = newTreeNodes
            } else {
              // 중복 체크를 위해 기존 ID 수집
              const existingIds = new Set(treeData.value.map(item => item.id))
              // 중복되지 않은 항목만 추가
              const uniqueNewNodes = newTreeNodes.filter(node => !existingIds.has(node.id))
              if (uniqueNewNodes.length > 0) {
                treeData.value.push(...uniqueNewNodes)
              }
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

      // 첫 페이지 로드 후 자동으로 추가 페이지 로드 (최대 10페이지까지)
      if (page === 1 && pagination.hasMorePages) {
        // 약간의 지연 후 추가 페이지 로드
        setTimeout(async () => {
          for (let i = 2; i <= 10; i++) {
            if (pagination.hasMorePages) {
              await displayCurrentMenuData(i)
              // 데이터가 있으면 에러 메시지 제거
              if (treeData.value.length > 0) {
                error.value = null
              }
            }
          }
        }, 100)
      }
    }
  }

  /**
   * 메뉴를 변경하는 함수
   */
  const changeMenu = async (menuType) => {
    console.log('changeMenu called with:', menuType)
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
    console.log('After changeMenu - treeData length:', treeData.value.length)
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
          const response = await aasService.getAllAAS(page)
          const pageItems = response.message || []

          if (pageItems.length > 0) {
            const newTreeNodes = transformApiToTree(pageItems, [])
            if (page === 1) {
              treeData.value = newTreeNodes // 첫 페이지는 데이터 초기화
            } else {
              // 중복 체크를 위해 기존 ID 수집
              const existingIds = new Set(treeData.value.map(item => item.id))
              // 중복되지 않은 항목만 추가
              const uniqueNewNodes = newTreeNodes.filter(node => !existingIds.has(node.id))
              if (uniqueNewNodes.length > 0) {
                treeData.value.push(...uniqueNewNodes) // 이후 페이지는 추가
              }
            }
            pagination.currentPage = page
            // 10개 이상이면 다음 페이지가 있을 가능성이 있음 (페이지 크기가 10이므로)
            pagination.hasMorePages = pageItems.length >= 10
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

            // 첫 페이지 로드 후 자동으로 추가 페이지 로드 (최대 10페이지까지)
            if (pagination.hasMorePages) {
              setTimeout(async () => {
                for (let i = 2; i <= 10; i++) {
                  if (pagination.hasMorePages) {
                    await performSearch(i)
                    // 데이터가 있으면 에러 메시지 제거
                    if (treeData.value.length > 0) {
                      error.value = null
                    }
                  }
                }
              }, 100)
            }
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

      // ALL 메뉴 검색
      if (currentMenu.value === MENU_TYPES.SPECIAL.ALL) {
        const searchValue = searchFilters.filterValue
        console.log(`All AAS 검색 - filterType: ${searchFilters.filterType}, searchValue: ${searchValue}, page: ${page}`)

        const response = await aasService.searchByKeyword(
          searchFilters.filterType,
          searchValue,
          page,
        )

        if (response && response.code === 200) {
          results = response.message || []
          console.log(`All AAS 검색 결과 - page ${page}: ${results.length}개`)

          // Fallback for conceptdescription on the first page
          if (
            page === 1 &&
            results.length === 0 &&
            searchFilters.filterType === 'conceptdescription' &&
            searchValue.toLowerCase() !== searchValue
          ) {
            const fallbackResponse = await aasService.searchByKeyword(
              searchFilters.filterType,
              searchValue.toLowerCase(),
              page,
            )
            results = fallbackResponse.message || []
          }
        }
      } else if (currentMenu.value !== MENU_TYPES.SPECIAL.ALL) {
        if (searchFilters.filterType && searchFilters.filterType.includes('/')) {
          const filterPath = searchFilters.filterType
          let response

          if (filterPath.startsWith('welding/search/')) {
            response = await apiClient.get(`/repository/${filterPath}`, { params: { value: searchFilters.filterValue || null } })
          } else if (filterPath.startsWith('cnc/search/')) {
            if (filterPath === 'cnc/search/automatictoolchanger/numberoftool') {
              response = await apiClient.get(`/repository/${filterPath}`)
            } else {
              response = await apiClient.get(`/repository/${filterPath}`, { params: { value: searchFilters.filterValue || null } })
            }
          } else if (filterPath.startsWith('press/search/')) {
            response = await apiClient.get(`/repository/${filterPath}`, { params: { value: searchFilters.filterValue || null } })
          }

          if (response && response.data && response.data.code === 200 && response.data.message) {
            let responseData = []
            const message = response.data.message

            if (Array.isArray(message)) {
              responseData = message
            } else if (typeof message === 'object' && message !== null) {
              if (Array.isArray(message.data)) {
                responseData = message.data
              } else if (message.data) {
                // message.data가 배열이 아닌 경우 (단일 객체) 배열로 감싸줌
                responseData = [message.data]
              } else {
                // aas, submodels를 직접 포함하는 객체일 경우
                responseData = [message]
              }
            }

            if (responseData.length > 0) {
              const firstItem = responseData[0]
              if (firstItem && firstItem.aas) {
                const allAAS = []
                const allSubmodels = []
                responseData.forEach(item => {
                  if (item.aas) allAAS.push(...(Array.isArray(item.aas) ? item.aas : [item.aas]))
                  if (item.submodels) allSubmodels.push(...(Array.isArray(item.submodels) ? item.submodels : [item.submodels]))
                })
                submodelsFromAPI = allSubmodels
                results = filterAASByMenuType(allAAS, currentMenu.value)
              } else {
                results = filterAASByMenuType(responseData, currentMenu.value)
              }
            }
          }
        } else {
          const response = await aasService.searchByFilter(searchFilters.filterType, searchFilters.filterValue)
          if (response && response.code === 200 && response.message && response.message.length > 0) {
            const firstMessage = response.message[0]
            const searchedAAS = firstMessage.aas ? (Array.isArray(firstMessage.aas) ? firstMessage.aas : [firstMessage.aas]) : []
            submodelsFromAPI = firstMessage.submodels ? (Array.isArray(firstMessage.submodels) ? firstMessage.submodels : [firstMessage.submodels]) : []
            results = filterAASByMenuType(searchedAAS, currentMenu.value)
          }
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
          // 중복 체크를 위해 기존 ID 수집
          const existingIds = new Set(treeData.value.map(item => item.id))
          // 중복되지 않은 항목만 추가
          const uniqueNewNodes = newTreeNodes.filter(node => !existingIds.has(node.id))
          if (uniqueNewNodes.length > 0) {
            treeData.value.push(...uniqueNewNodes) // 이후 페이지는 추가
          }
        }
        pagination.currentPage = page
        // 검색 결과가 10개 이상이면 다음 페이지가 있을 가능성
        pagination.hasMorePages = results.length >= 10
        console.log(`페이지 ${page} 처리 완료 - hasMorePages: ${pagination.hasMorePages}`)
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
      if (page === 1) {
        loading.value = false

        // 첫 페이지 로드 후 자동으로 추가 페이지 로드 (검색 모드에서도)
        if (pagination.hasMorePages && searchFilters.filterValue) {
          console.log('검색 모드에서 추가 페이지 자동 로드 시작')
          setTimeout(async () => {
            for (let i = 2; i <= 10; i++) {
              if (pagination.hasMorePages) {
                await performSearch(i)
                // 데이터가 있으면 에러 메시지 제거
                if (treeData.value.length > 0) {
                  error.value = null
                }
              }
            }
          }, 100)
        }
      } else {
        pagination.isLoadingMore = false
      }
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
  let lastLoadMoreCall = 0 // 마지막 loadMore 호출 시간 추적
  const loadMore = () => {
    // 중복 호출 방지: 500ms 이내 재호출 차단
    const now = Date.now()
    if (now - lastLoadMoreCall < 500) return
    lastLoadMoreCall = now

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

  // 자동 페이지 로딩 비활성화 - 중복 호출 문제 해결
  // CNC Drilling 등에서 여러 키워드 검색 시 중복 호출되는 문제가 있어 제거
  // 필요시 사용자가 수동으로 "Load More" 버튼을 클릭하도록 변경

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
    filteredAAS,
    menuCounts,
    currentMenuDisplayName,
    hasResults,
    selectedNodeDetail,
    changeMenu,
    performSearch,
    clearSearch,
    toggleNode,
    selectNode,
    loadMore,
  }
}
