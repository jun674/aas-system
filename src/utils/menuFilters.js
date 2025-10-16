/**
 * 메뉴별 AAS 필터링 유틸리티
 */

// 메뉴 타입 정의
export const MENU_TYPES = {
  // Equipment 카테고리 - Welding 장비들
  EQUIPMENT: {
    CO2: 'CO2',
    TIG: 'TIG',
    MIG: 'MIG',
    MAG: 'MAG',
    EBW: 'EBW',
    FW: 'FW',
    OAW: 'OAW',
    PW: 'PW',
    RSEW: 'RSEW',
    RSW: 'RSW',
    SAW: 'SAW',
    SMAW: 'SMAW',
    Sold: 'Sold',
    SW: 'SW',
    UW: 'UW',
    // CNC 장비 - 통합
    CNC: 'CNC',
    // Press 장비들 - 폴더명대로
    PRESS_CUTTING: 'Press_Cutting',
    PRESS_HYDR: 'Press_Hydr',
    PRESS_MECHANICAL_TYPE: 'Press_Mechanical_Type',
    PRESS_SERVO: 'Press_Servo',
    // AMR (Autonomous Mobile Robot)
    AMR: 'AMR',
    // Boring
    BORING: 'Boring',
    // Robot
    ROBOT: 'Robot',
  },
  // Material 카테고리
  MATERIAL: {
    STEEL: 'Steel',
    ALUMINUM: 'Aluminum',
    STAINLESS_STEEL: 'Stainless Steel',
  },
  // Process 카테고리
  PROCESS: {
    WELDING: 'Welding',
    CUTTING: 'Cutting',
    BRAZING: 'Brazing',
  },
  // Operation 카테고리
  OPERATION: {
    PLANNING: 'Operation_Planning',
    MONITORING: 'Operation_Monitoring',
    CONTROL: 'Operation_Control',
  },
  // Quality 카테고리
  QUALITY: {
    INSPECTION: 'Quality_Inspection',
    CONTROL: 'Quality_Control',
    ASSURANCE: 'Quality_Assurance',
  },
  // Production 카테고리
  PRODUCTION: {
    PLANNING: 'Production_Planning',
    TRACKING: 'Production_Tracking',
    ANALYSIS: 'Production_Analysis',
  },
  // Special
  SPECIAL: {
    ALL: 'ALL',
    AASX: 'AASX',
  },
}

// 설비 타입별 필터링 키워드
export const EQUIPMENT_KEYWORDS = {
  // Welding 장비 키워드
  [MENU_TYPES.EQUIPMENT.CO2]: ['CO2Type'],
  [MENU_TYPES.EQUIPMENT.TIG]: ['TungstenInsertGasType'],
  [MENU_TYPES.EQUIPMENT.MIG]: ['MetalInsertGasType'],
  [MENU_TYPES.EQUIPMENT.MAG]: ['MetalActiveGasType'],
  [MENU_TYPES.EQUIPMENT.EBW]: ['ElectronBeamWeldingType'],
  [MENU_TYPES.EQUIPMENT.FW]: ['FrictionWeldingType'],
  [MENU_TYPES.EQUIPMENT.OAW]: ['OxyAcetyleneWeldingType'],
  [MENU_TYPES.EQUIPMENT.PW]: ['ProjectionWeldingType'],
  [MENU_TYPES.EQUIPMENT.RSEW]: ['ResistanceSeamWeldingType'],
  [MENU_TYPES.EQUIPMENT.RSW]: ['ResistanceSpotWeldingType'],
  [MENU_TYPES.EQUIPMENT.SAW]: ['SubmergedArcWeldingType'],
  [MENU_TYPES.EQUIPMENT.SMAW]: ['ShieldedMetalArcWeldingType'],
  [MENU_TYPES.EQUIPMENT.Sold]: ['SolderingType'],
  [MENU_TYPES.EQUIPMENT.SW]: ['StudWeldingType'],
  [MENU_TYPES.EQUIPMENT.UW]: ['UltrasonicWeldingType'],

  // CNC 장비 키워드 - globalAssetId API 사용
  [MENU_TYPES.EQUIPMENT.CNC]: [],

  // Press 장비 키워드 - globalAssetId API 사용
  [MENU_TYPES.EQUIPMENT.PRESS_CUTTING]: ['Shearing', 'PressMachineShearing', 'PressProcess/Shearing'],
  [MENU_TYPES.EQUIPMENT.PRESS_HYDR]: [],
  [MENU_TYPES.EQUIPMENT.PRESS_MECHANICAL_TYPE]: [],
  [MENU_TYPES.EQUIPMENT.PRESS_SERVO]: [],

  // AMR 키워드
  [MENU_TYPES.EQUIPMENT.AMR]: ['HD1500', 'LD90', 'MD650', 'AMR'],

  // Boring 키워드
  [MENU_TYPES.EQUIPMENT.BORING]: ['DBC130', 'Boring'],

  // Robot 키워드
  [MENU_TYPES.EQUIPMENT.ROBOT]: ['HH4', 'Robot'],
}

// 재료 타입별 필터링 키워드
export const MATERIAL_KEYWORDS = {
  [MENU_TYPES.MATERIAL.STEEL]: ['Steel'],
  [MENU_TYPES.MATERIAL.ALUMINUM]: ['Aluminum'],
  [MENU_TYPES.MATERIAL.STAINLESS_STEEL]: ['Stainless Steel'],
}

// 프로세스 타입별 필터링 키워드
export const PROCESS_KEYWORDS = {
  [MENU_TYPES.PROCESS.WELDING]: ['Welding'],
  [MENU_TYPES.PROCESS.CUTTING]: ['Cutting'],
  [MENU_TYPES.PROCESS.BRAZING]: ['Brazing'],
}

// 운영 타입별 필터링 키워드
export const OPERATION_KEYWORDS = {
  [MENU_TYPES.OPERATION.PLANNING]: ['Operation_Planning'],
  [MENU_TYPES.OPERATION.MONITORING]: ['Operation_Monitoring'],
  [MENU_TYPES.OPERATION.CONTROL]: ['Operation_Control'],
}

// 품질 타입별 필터링 키워드
export const QUALITY_KEYWORDS = {
  [MENU_TYPES.QUALITY.INSPECTION]: ['Quality_Inspection'],
  [MENU_TYPES.QUALITY.CONTROL]: ['Quality_Control'],
  [MENU_TYPES.QUALITY.ASSURANCE]: ['Quality_Assurance'],
}

// 생산 타입별 필터링 키워드
export const PRODUCTION_KEYWORDS = {
  [MENU_TYPES.PRODUCTION.PLANNING]: ['Production_Planning'],
  [MENU_TYPES.PRODUCTION.TRACKING]: ['Production_Tracking'],
  [MENU_TYPES.PRODUCTION.ANALYSIS]: ['Production_Analysis'],
}

/**
 * AAS 데이터에서 특정 키워드 배열 중 하나라도 포함하는지 확인하는 헬퍼 함수
 */
function hasKeywords(aas, keywords) {
  if (!aas || !keywords || keywords.length === 0) return false

  // ID의 전체 문자열을 검색하도록 변경
  const searchFields = [
    aas.id, // ID 전체를 검색 필드에 포함
    aas.idShort,
    aas.assetInformation?.globalAssetId,
    aas.assetInformation?.assetKind,
    ...(aas.description?.map((d) => d.text) || []),
  ]

  const searchText = searchFields
    .filter((field) => field)
    .join(' ')
    .toLowerCase()

  const found = keywords.some((keyword) => searchText.includes(keyword.toLowerCase()))
  return found
}

/**
 * AAS가 제외되어야 할 타입인지 판단하는 함수
 */
export function isExcludedComponentAAS(aas) {
  // trim()을써 공백이 있는 경우도 처리
  const idShortLower = (aas.idShort || '').trim().toLowerCase()

  // 제외할 idShort 목록
  const excludedIdShorts = [
    'component',
    'safetydevice',
    'accessories'
  ]

  if (excludedIdShorts.includes(idShortLower)) {
    return true // 제외 목록에 있으면 제외
  }
  return false
}

/**
 * 주어진 AAS가 속하는 모든 메뉴 카테고리(들)을 반환합니다.
 * 하나의 AAS가 여러 카테고리에 속할 수 있으므로 배열로 반환합니다.
 * @param {Object} aas - AAS 객체
 * @returns {Array<string>} - AAS가 속하는 메뉴 카테고리(들)의 배열
 */
export function getAASCategories(aas) {
  const categories = []

  // Equipment 카테고리 처리
  Object.values(MENU_TYPES.EQUIPMENT).forEach((type) => {
    if (hasKeywords(aas, EQUIPMENT_KEYWORDS[type])) {
      categories.push(type)
    }
  })

  // Material 카테고리 처리
  Object.values(MENU_TYPES.MATERIAL).forEach((type) => {
    if (hasKeywords(aas, MATERIAL_KEYWORDS[type])) {
      categories.push(type)
    }
  })

  // Process 카테고리 처리
  Object.values(MENU_TYPES.PROCESS).forEach((type) => {
    if (hasKeywords(aas, PROCESS_KEYWORDS[type])) {
      categories.push(type)
    }
  })

  // Operation 카테고리 처리
  Object.values(MENU_TYPES.OPERATION).forEach((type) => {
    if (hasKeywords(aas, OPERATION_KEYWORDS[type])) {
      categories.push(type)
    }
  })

  // Quality 카테고리 처리
  Object.values(MENU_TYPES.QUALITY).forEach((type) => {
    if (hasKeywords(aas, QUALITY_KEYWORDS[type])) {
      categories.push(type)
    }
  })

  // Production 카테고리 처리
  Object.values(MENU_TYPES.PRODUCTION).forEach((type) => {
    if (hasKeywords(aas, PRODUCTION_KEYWORDS[type])) {
      categories.push(type)
    }
  })

  return categories
}

/**
 * AAS 데이터를 한 번만 순회하여 메뉴별 그룹과 카운트를 계산하는 최적화된 함수
 * @param {Array} allAAS - 전체 AAS 배열
 * @returns {Object} - { aasList: { menuType: [aas] }, menuCounts: { menuType: count } } 형태의 객체
 */
export function processAASData(allAAS) {
  if (!allAAS || !Array.isArray(allAAS)) {
    return { aasList: {}, menuCounts: {} }
  }

  const aasList = {}
  const menuCounts = {}

  // 모든 메뉴 타입 목록 생성 및 카운트 초기화
  const allMenuTypes = [
    ...Object.values(MENU_TYPES.EQUIPMENT),
    ...Object.values(MENU_TYPES.MATERIAL),
    ...Object.values(MENU_TYPES.PROCESS),
    ...Object.values(MENU_TYPES.OPERATION),
    ...Object.values(MENU_TYPES.QUALITY),
    ...Object.values(MENU_TYPES.PRODUCTION),
  ]

  allMenuTypes.forEach((type) => {
    aasList[type] = []
    menuCounts[type] = 0
  })

  const processedAAS = allAAS.filter((aas) => !isExcludedComponentAAS(aas))

  processedAAS.forEach((aas) => {
    const categories = getAASCategories(aas)
    categories.forEach((category) => {
      if (aasList[category]) {
        aasList[category].push(aas)
        menuCounts[category]++
      }
    })
  })

  // 'ALL' 메뉴에 대한 데이터와 카운트 추가
  aasList[MENU_TYPES.SPECIAL.ALL] = processedAAS
  menuCounts[MENU_TYPES.SPECIAL.ALL] = processedAAS.length

  console.log('Processed AAS Data:', { aasList, menuCounts })
  return { aasList, menuCounts }
}

/**
 * 메뉴 타입에 따라 AAS 필터링 (최적화된 함수 사용)
 * @param {Array} allAAS - 전체 AAS 배열
 * @param {string} menuType - 메뉴 타입
 * @returns {Array} - 필터링된 AAS 배열
 */
export function filterAASByMenuType(allAAS, menuType) {
  const { aasList } = processAASData(allAAS)
  return aasList[menuType] || []
}

/**
 * 메뉴별 카운트 계산 (최적화된 함수 사용)
 * @param {Array} allAAS - 전체 AAS 배열
 * @returns {Object} - 메뉴별 카운트 객체
 */
export function calculateMenuCounts(allAAS) {
  const { menuCounts } = processAASData(allAAS)
  return menuCounts
}

/**
 * 검색 결과 필터링 (현재 메뉴 기준)
 */
export function filterSearchResults(searchResults, currentMenu) {
  if (!searchResults || !searchResults.message || !searchResults.message[0]) {
    return searchResults
  }

  const filteredAAS = filterAASByMenuType(searchResults.message[0].aas, currentMenu)

  return {
    ...searchResults,
    message: [
      {
        ...searchResults.message[0],
        aas: filteredAAS,
      },
    ],
  }
}

/**
 * 메뉴 표시 이름 가져오기
 * @param {string} menuType - 메뉴 타입
 * @returns {string} - 표시 이름
 */
export function getMenuDisplayName(menuType) {
  const displayNames = {
    // Equipment - Welding
    [MENU_TYPES.EQUIPMENT.CO2]: 'CO2 Welding',
    [MENU_TYPES.EQUIPMENT.TIG]: 'TIG Welding',
    [MENU_TYPES.EQUIPMENT.MIG]: 'MIG Welding',
    [MENU_TYPES.EQUIPMENT.MAG]: 'MAG Welding',
    [MENU_TYPES.EQUIPMENT.EBW]: 'EBW Welding',
    [MENU_TYPES.EQUIPMENT.FW]: 'FW Welding',
    [MENU_TYPES.EQUIPMENT.OAW]: 'OAW Welding',
    [MENU_TYPES.EQUIPMENT.PW]: 'PW Welding',
    [MENU_TYPES.EQUIPMENT.RSEW]: 'RSEW Welding',
    [MENU_TYPES.EQUIPMENT.RSW]: 'RSW Welding',
    [MENU_TYPES.EQUIPMENT.SAW]: 'SAW Welding',
    [MENU_TYPES.EQUIPMENT.SMAW]: 'SMAW Welding',
    [MENU_TYPES.EQUIPMENT.Sold]: 'Soldering',
    [MENU_TYPES.EQUIPMENT.SW]: 'SW Welding',
    [MENU_TYPES.EQUIPMENT.UW]: 'UW Welding',

    // Equipment - CNC
    [MENU_TYPES.EQUIPMENT.CNC]: 'CNC',

    // Equipment - Press
    [MENU_TYPES.EQUIPMENT.PRESS_CUTTING]: 'Press Cutting',
    [MENU_TYPES.EQUIPMENT.PRESS_HYDR]: 'Press Hydr',
    [MENU_TYPES.EQUIPMENT.PRESS_MECHANICAL_TYPE]: 'Press Mechanical Type',
    [MENU_TYPES.EQUIPMENT.PRESS_SERVO]: 'Press Servo',

    // Equipment - AMR
    [MENU_TYPES.EQUIPMENT.AMR]: 'AMR',

    // Equipment - Boring
    [MENU_TYPES.EQUIPMENT.BORING]: 'Boring',

    // Equipment - Robot
    [MENU_TYPES.EQUIPMENT.ROBOT]: 'Robot',

    // Material
    [MENU_TYPES.MATERIAL.STEEL]: 'Steel',
    [MENU_TYPES.MATERIAL.ALUMINUM]: 'Aluminum',
    [MENU_TYPES.MATERIAL.STAINLESS_STEEL]: 'Stainless Steel',

    // Process
    [MENU_TYPES.PROCESS.WELDING]: 'Welding',
    [MENU_TYPES.PROCESS.CUTTING]: 'Cutting',
    [MENU_TYPES.PROCESS.BRAZING]: 'Brazing',

    // Operation
    [MENU_TYPES.OPERATION.PLANNING]: 'Operation Planning',
    [MENU_TYPES.OPERATION.MONITORING]: 'Operation Monitoring',
    [MENU_TYPES.OPERATION.CONTROL]: 'Operation Control',

    // Quality
    [MENU_TYPES.QUALITY.INSPECTION]: 'Quality Inspection',
    [MENU_TYPES.QUALITY.CONTROL]: 'Quality Control',
    [MENU_TYPES.QUALITY.ASSURANCE]: 'Quality Assurance',

    // Production
    [MENU_TYPES.PRODUCTION.PLANNING]: 'Production Planning',
    [MENU_TYPES.PRODUCTION.TRACKING]: 'Production Tracking',
    [MENU_TYPES.PRODUCTION.ANALYSIS]: 'Production Analysis',

    // Special
    [MENU_TYPES.SPECIAL.ALL]: 'All AAS Data',
    [MENU_TYPES.SPECIAL.AASX]: 'AASX File Upload',
  }

  return displayNames[menuType] || menuType
}
