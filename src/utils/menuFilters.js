/**
 * 메뉴별 AAS 필터링 유틸리티
 */

// 메뉴 타입 정의 (기존과 동일)
export const MENU_TYPES = {
  // Equipment
  EQUIPMENT: {
    CO2: 'CO2',
    EBW: 'EBW',
    FW: 'FW',
    MAG: 'MAG',
    MIG: 'MIG',
    OAW: 'OAW',
    PW: 'PW',
    RSEW: 'RSEW',
    RSW: 'RSW',
    SAW: 'SAW',
    SMAW: 'SMAW',
    Sold: 'Sold',
    SW: 'SW',
    TIG: 'TIG',
    UW: 'UW'
  },
  // Material
  MATERIAL: {
    STEEL: 'Steel',
    ALUMINUM: 'Aluminum',
    STAINLESS_STEEL: 'Stainless Steel'
  },
  // Process
  PROCESS: {
    WELDING: 'Welding',
    CUTTING: 'Cutting',
    BRAZING: 'Brazing'
  },
  // Management
  MANAGEMENT: {
    OPERATION: 'Operation',
    QUALITY: 'Quality',
    PRODUCTION: 'Production'
  },
  // Special
  SPECIAL: {
    ALL: 'ALL',
    AASX: 'AASX'
  }
}

// 설비 타입별 필터링 키워드
export const EQUIPMENT_KEYWORDS = {
  [MENU_TYPES.EQUIPMENT.CO2]: ['CO2Type'],
  [MENU_TYPES.EQUIPMENT.EBW]: ['ElectronBeamWeldingType'],
  [MENU_TYPES.EQUIPMENT.FW]: ['FlasfButtType'],
  [MENU_TYPES.EQUIPMENT.MAG]: ['MetalActiveGasType'],
  [MENU_TYPES.EQUIPMENT.MIG]: ['MetalInsertGasType'],
  [MENU_TYPES.EQUIPMENT.OAW]: ['OxyAcetyleneWeldingType'],
  [MENU_TYPES.EQUIPMENT.PW]: ['ProjectionWeldingType'],
  [MENU_TYPES.EQUIPMENT.RSEW]: ['ResistanceSeamWeldingType'],
  [MENU_TYPES.EQUIPMENT.RSW]: ['ResistanceSeamWeldingType'],
  [MENU_TYPES.EQUIPMENT.SAW]: ['SubmergedArcWeldType'],
  [MENU_TYPES.EQUIPMENT.SMAW]: ['ShieldedMetalArcWeldingType'],
  [MENU_TYPES.EQUIPMENT.Sold]: ['SoldringWeldingType'],
  [MENU_TYPES.EQUIPMENT.SW]: ['StudWeldingType'],
  [MENU_TYPES.EQUIPMENT.TIG]: ['TungstenInsertGasType'],
  [MENU_TYPES.EQUIPMENT.UW]: ['UpsetWelderType']
}

// 재료 타입별 필터링 키워드
export const MATERIAL_KEYWORDS = {
  [MENU_TYPES.MATERIAL.STEEL]: ['steel', 'Steel', 'carbon steel', 'mild steel'],
  [MENU_TYPES.MATERIAL.ALUMINUM]: ['aluminum', 'Aluminum', 'aluminium', 'Al'],
  [MENU_TYPES.MATERIAL.STAINLESS_STEEL]: ['stainless', 'Stainless', 'stainless steel', 'SS']
}

// 프로세스 타입별 필터링 키워드
export const PROCESS_KEYWORDS = {
  [MENU_TYPES.PROCESS.WELDING]: ['welding', 'Welding', 'weld', 'arc welding'],
  [MENU_TYPES.PROCESS.CUTTING]: ['cutting', 'Cutting', 'cut', 'plasma cutting'],
  [MENU_TYPES.PROCESS.BRAZING]: ['brazing', 'Brazing', 'braze', 'soldering']
}

// 관리(Management) 타입별 필터링 키워드
export const MANAGEMENT_KEYWORDS = {
  [MENU_TYPES.MANAGEMENT.OPERATION]: ['operation'],
  [MENU_TYPES.MANAGEMENT.QUALITY]: ['quality'],
  [MENU_TYPES.MANAGEMENT.PRODUCTION]: ['production']
};


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
    ...(aas.description?.map(d => d.text) || [])
  ]

  const searchText = searchFields
    .filter(field => field)
    .join(' ')
    .toLowerCase()

  const found = keywords.some(keyword => searchText.includes(keyword.toLowerCase()));
  return found;
}

/**
 * AAS가 제외되어야 할 'Component' 타입인지 판단하는 함수
 */
export function isExcludedComponentAAS(aas) {
  // trim()을써 공백이 있는 경우도 처리
  const idShortLower = (aas.idShort || '').trim().toLowerCase();
  
  if (idShortLower === 'component') {
      return true; // idShort가 'component'이면 제외
  }
  return false;
}


/**
 * 주어진 AAS가 속하는 모든 메뉴 카테고리(들)을 반환합니다.
 * 하나의 AAS가 여러 카테고리에 속할 수 있으므로 배열로 반환합니다.
 * @param {Object} aas - AAS 객체
 * @returns {Array<string>} - AAS가 속하는 메뉴 카테고리(들)의 배열
 */
export function getAASCategories(aas) {
    const categories = [];

    // Equipment
    Object.values(MENU_TYPES.EQUIPMENT).forEach(type => {
        if (hasKeywords(aas, EQUIPMENT_KEYWORDS[type])) {
            categories.push(type);
        }
    });

    // Material
    Object.values(MENU_TYPES.MATERIAL).forEach(type => {
        if (hasKeywords(aas, MATERIAL_KEYWORDS[type])) {
            categories.push(type);
        }
    });

    // Process
    Object.values(MENU_TYPES.PROCESS).forEach(type => {
        if (hasKeywords(aas, PROCESS_KEYWORDS[type])) {
            categories.push(type);
        }
    });

    // Management
    Object.values(MENU_TYPES.MANAGEMENT).forEach(type => {
        if (hasKeywords(aas, MANAGEMENT_KEYWORDS[type])) {
            categories.push(type);
        }
    });

    return categories;
}


/**
 * 메뉴 타입에 따라 AAS 필터링
 * @param {Array} allAAS - 전체 AAS 배열
 * @param {string} menuType - 메뉴 타입
 * @returns {Array} - 필터링된 AAS 배열
 */
export function filterAASByMenuType(allAAS, menuType) {
  if (!allAAS || !Array.isArray(allAAS)) return []

  // 먼저 '제외되어야 할 Component' AAS를 필터링합니다.
  const processedAAS = allAAS.filter(aas => !isExcludedComponentAAS(aas));
  
  console.log(`[filterAASByMenuType] 초기 AAS 개수 (모든 AAS): ${allAAS.length}, Component 제외 후: ${processedAAS.length}`);

  // 'ALL' 메뉴는 '제외되어야 할 Component' AAS를 제외한 모든 AAS를 반환
  if (menuType === MENU_TYPES.SPECIAL.ALL) {
    console.log(`[filterAASByMenuType] 'ALL' 메뉴 선택: ${processedAAS.length}개 AAS 반환.`);
    return processedAAS;
  }
  
  // 나머지 메뉴 타입은 getAASCategories 함수를 사용하여 필터링
  const filtered = processedAAS.filter(aas => {
      const aasCategories = getAASCategories(aas);
      const isIncluded = aasCategories.includes(menuType);
      return isIncluded;
  });
  
  console.log(`[filterAASByMenuType] '${menuType}' 메뉴 필터링 최종 결과: ${filtered.length}개 AAS.`);
  return filtered;
}

/**
 * 메뉴별 카운트 계산
 * @param {Array} allAAS - 전체 AAS 배열
 * @returns {Object} - 메뉴별 카운트 객체
 */
export function calculateMenuCounts(allAAS) {
  if (!allAAS || !Array.isArray(allAAS)) return {}

  const counts = {};

  // '제외되어야 할 Component' AAS를 필터링합니다.
  const processedAAS = allAAS.filter(aas => !isExcludedComponentAAS(aas));

  // 'ALL' 카운트
  counts[MENU_TYPES.SPECIAL.ALL] = processedAAS.length;

  // 모든 카테고리 타입에 대해 카운트 초기화
  const allCategoryTypes = [
      ...Object.values(MENU_TYPES.EQUIPMENT),
      ...Object.values(MENU_TYPES.MATERIAL),
      ...Object.values(MENU_TYPES.PROCESS),
      ...Object.values(MENU_TYPES.MANAGEMENT)
  ];
  allCategoryTypes.forEach(type => {
      counts[type] = 0; // 모든 카운트를 0으로 초기화
  });


  // 각 AAS를 순회하며 해당 AAS가 속하는 모든 카테고리의 카운트를 증가시킵니다.
  processedAAS.forEach(aas => {
      const categories = getAASCategories(aas);
      categories.forEach(category => {
          if (counts[category] !== undefined) {
              counts[category]++;
          }
      });
  });

  console.log('메뉴별 카운트:', counts);
  return counts;
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
    message: [{
      ...searchResults.message[0],
      aas: filteredAAS
    }]
  }
}

/**
 * 메뉴 표시 이름 가져오기
 * @param {string} menuType - 메뉴 타입
 * @returns {string} - 표시 이름
 */
export function getMenuDisplayName(menuType) {
  const displayNames = {
    [MENU_TYPES.EQUIPMENT.CO2]: 'CO2 Welding Equipment',
    [MENU_TYPES.EQUIPMENT.EBW]: 'EBW Welding Equipment',
    [MENU_TYPES.EQUIPMENT.FW]: 'FW Welding Equipment',
    [MENU_TYPES.EQUIPMENT.MAG]: 'MAG Welding Equipment',
    [MENU_TYPES.EQUIPMENT.MIG]: 'MIG Welding Equipment',
    [MENU_TYPES.EQUIPMENT.OAW]: 'OAW Welding Equipment',
    [MENU_TYPES.EQUIPMENT.PW]: 'PW Welding Equipment',
    [MENU_TYPES.EQUIPMENT.RSEW]: 'RSEW Welding Equipment',
    [MENU_TYPES.EQUIPMENT.RSW]: 'RSW Welding Equipment',
    [MENU_TYPES.EQUIPMENT.SAW]: 'SAW Welding Equipment',
    [MENU_TYPES.EQUIPMENT.SMAW]: 'SMAW Welding Equipment',
    [MENU_TYPES.EQUIPMENT.Sold]: 'Soldering Welding Equipment',
    [MENU_TYPES.EQUIPMENT.SW]: 'SW Welding Equipment',
    [MENU_TYPES.EQUIPMENT.TIG]: 'TIG Welding Equipment',
    [MENU_TYPES.EQUIPMENT.UW]: 'UW Welding Equipment',
    [MENU_TYPES.MATERIAL.STEEL]: 'Steel Material',
    [MENU_TYPES.MATERIAL.ALUMINUM]: 'Aluminum Material',
    [MENU_TYPES.MATERIAL.STAINLESS_STEEL]: 'Stainless Steel Material',
    [MENU_TYPES.PROCESS.WELDING]: 'Welding Process',
    [MENU_TYPES.PROCESS.CUTTING]: 'Cutting Process',
    [MENU_TYPES.PROCESS.BRAZING]: 'Brazing Process',
    [MENU_TYPES.MANAGEMENT.OPERATION]: 'Operation Management',
    [MENU_TYPES.MANAGEMENT.QUALITY]: 'Quality Control',
    [MENU_TYPES.MANAGEMENT.PRODUCTION]: 'Production Management',
    [MENU_TYPES.SPECIAL.ALL]: 'All AAS Data',
    [MENU_TYPES.SPECIAL.AASX]: 'AASX File Upload'
  }

  return displayNames[menuType] || menuType
}