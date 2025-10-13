# 메뉴 시스템 개선 제안

## 현재 시스템의 문제점

### 1. 키워드 기반 검색의 한계
- 현재: 메뉴별로 고정된 키워드로 검색
- 문제: 새로운 장비 추가 시 코드 수정 필요
- 예시: CNC 장비가 추가될 때마다 menuFilters.js 수정 필요

### 2. 하드코딩된 메뉴 구조
```javascript
// 현재 방식 - 모든 키워드를 하드코딩
[MENU_TYPES.EQUIPMENT.CNC_MILLING]: ['A600_8K', 'A600_16K', 'H6_8K', ...]
```

## 개선 방안

### 방안 1: 동적 카테고리 시스템
```javascript
// 서버에서 카테고리 정보 제공
GET /api/categories/equipment/cnc
{
  "categories": {
    "milling": {
      "name": "Milling Centers",
      "models": ["A600", "H6", "XV"],
      "keywords": ["mill", "machining center"]
    },
    "turning": {
      "name": "Turning Centers", 
      "models": ["Lynx"],
      "keywords": ["turn", "lathe"]
    },
    "drilling": {
      "name": "Drilling Centers",
      "models": ["XD", "XDI", "XP"],
      "keywords": ["drill", "tap"]
    }
  }
}
```

### 방안 2: globalAssetId 패턴 매칭
```javascript
// globalAssetId의 패턴을 활용
const CNC_PATTERNS = {
  milling: /A600|H6|XV/i,
  turning: /Lynx/i,
  drilling: /XD|XP/i
}

// 동적으로 분류
function categorizeCNC(aas) {
  const globalAssetId = aas.assetInformation?.globalAssetId || '';
  
  if (CNC_PATTERNS.milling.test(globalAssetId)) return 'milling';
  if (CNC_PATTERNS.turning.test(globalAssetId)) return 'turning';
  if (CNC_PATTERNS.drilling.test(globalAssetId)) return 'drilling';
  
  return 'general';
}
```

### 방안 3: 메타데이터 기반 분류
```javascript
// AAS의 submodel에서 장비 타입 정보 추출
function getEquipmentType(aas) {
  const submodels = aas.submodels || [];
  const typeSubmodel = submodels.find(sm => 
    sm.idShort === 'TechnicalData' || 
    sm.idShort === 'EquipmentType'
  );
  
  if (typeSubmodel?.submodelElements) {
    // submodelElements에서 타입 정보 추출
    const typeElement = typeSubmodel.submodelElements.find(
      el => el.idShort === 'MachineType'
    );
    return typeElement?.value;
  }
  
  return null;
}
```

### 방안 4: 태그 기반 시스템
```javascript
// 각 AAS에 태그 추가
{
  "id": "NC_CNC_A600_8K_HSK-A63",
  "tags": ["cnc", "milling", "a600", "8k", "hsk"],
  // ... 기타 AAS 데이터
}

// 태그로 필터링
function filterByTags(aasList, requiredTags) {
  return aasList.filter(aas => 
    requiredTags.every(tag => 
      aas.tags?.includes(tag)
    )
  );
}
```

## 추천 솔루션: 하이브리드 접근

### 1단계: 즉시 적용 가능한 개선
- globalAssetId 검색 API 활용
- 패턴 매칭으로 동적 분류

### 2단계: 중기 개선
- 서버에서 카테고리 메타데이터 제공
- 프론트엔드 메뉴 동적 생성

### 3단계: 장기 개선
- AAS 표준에 맞는 분류 체계 구축
- 태그 기반 유연한 검색 시스템

## 구현 예시

### 개선된 useSearch.js
```javascript
// 동적 메뉴 데이터 로딩
const loadMenuData = async (menuType) => {
  try {
    // globalAssetId 검색 API 활용
    if (menuType.startsWith('CNC_')) {
      const pattern = getCNCPattern(menuType);
      const response = await apiClient.get('/aas/search/globalAssetId', {
        params: { keyword: pattern, page: 1 }
      });
      return response.data.message;
    }
    
    // 기존 방식 폴백
    const keywords = EQUIPMENT_KEYWORDS[menuType];
    if (keywords?.length > 0) {
      return await dataAPI.getAASByKeyword(keywords[0], 1);
    }
  } catch (error) {
    console.error('Menu data loading failed:', error);
    return [];
  }
};

// CNC 패턴 매핑
function getCNCPattern(menuType) {
  const patterns = {
    'CNC_MILLING': 'A600|H6|XV',
    'CNC_TURNING': 'Lynx',
    'CNC_DRILLING': 'XD|XP'
  };
  return patterns[menuType] || 'CNC';
}
```

## 결론

현재 시스템은 작동하지만 확장성이 제한적입니다. 단계적 개선을 통해:
1. 새 장비 추가 시 코드 수정 불필요
2. 더 정확한 분류 가능
3. 사용자 경험 향상

globalAssetId 검색 API를 활용하면 즉시 개선 가능합니다.