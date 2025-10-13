# 프론트엔드 메뉴 시스템 분석

## 1. 메뉴 처리 흐름

### 1.1 메뉴 클릭 시 동작
1. 사용자가 DynamicSidebar에서 메뉴 클릭 (예: CNC > CNC Milling)
2. `onMenuSelected` 이벤트 발생 → SearchPage.vue로 전달
3. `changeMenu` 함수 호출 → useSearch.js
4. `displayCurrentMenuData` 함수 실행

### 1.2 데이터 로딩 프로세스
```javascript
// useSearch.js의 displayCurrentMenuData 함수
const keywords = EQUIPMENT_KEYWORDS[currentMenu.value] || []
if (keywords.length > 0) {
    const keyword = keywords[0]
    const responseData = await dataAPI.getAASByKeyword(keyword, page)
}
```

## 2. 메뉴가 표시되는 조건

### 2.1 키워드 매칭 방식
`menuFilters.js`의 `hasKeywords` 함수가 AAS 데이터에서 다음 필드를 검색:
- `aas.id`
- `aas.idShort`
- `aas.assetInformation.globalAssetId`
- `aas.description`

### 2.2 메뉴별 키워드 매핑
```javascript
// CO2 (작동함)
[MENU_TYPES.EQUIPMENT.CO2]: ['CO2Type']

// CNC (작동 안함 - 수정 전)
[MENU_TYPES.EQUIPMENT.CNC_MILLING]: ['MachiningCenterDVF5000', 'MachingCenterDVF5000']
```

## 3. CNC 메뉴가 표시되지 않는 이유

### 3.1 문제점
- 프론트엔드는 'MachiningCenterDVF5000' 같은 키워드로 검색
- 서버의 AAS 데이터는 globalAssetId에 'ComputerNumericalControlProcess' 포함
- 키워드 불일치로 데이터를 찾지 못함

### 3.2 서버 데이터 예시
```json
{
  "globalAssetId": "https://iacf.kyungnam.ac.kr/ids/asset/ComputerNumericalControlProcess/A600 8K HSK-A63"
}
```

## 4. 해결 방법

### 4.1 menuFilters.js 수정
```javascript
// CNC 장비 키워드 수정
[MENU_TYPES.EQUIPMENT.CNC_MILLING]: ['ComputerNumericalControlProcess', 'CNCMechanics', 'MachiningCenterDVF5000'],
[MENU_TYPES.EQUIPMENT.CNC_TURNING]: ['ComputerNumericalControlProcess', 'CNCMechanics', 'TurningCenter'],
[MENU_TYPES.EQUIPMENT.CNC_DRILLING]: ['ComputerNumericalControlProcess', 'CNCMechanics', 'DrillingMachine'],
```

### 4.2 수정 효과
- 'ComputerNumericalControlProcess' 키워드로 서버의 CNC 데이터 검색 가능
- 'CNCMechanics' 키워드로 추가 CNC 관련 데이터 검색 가능
- 기존 키워드도 유지하여 하위 호환성 보장

## 5. 메뉴 시스템 구조

### 5.1 컴포넌트 구조
```
SearchPage.vue
├── DynamicSidebar.vue (메뉴 UI)
├── SearchFilters.vue (검색 필터)
├── TreeView.vue (결과 표시)
└── EquipmentDetail.vue (상세 정보)
```

### 5.2 데이터 흐름
```
메뉴 선택 → useSearch.js → API 호출 → 데이터 변환 → 트리 표시
```

## 6. API 호출 방식

### 6.1 키워드 기반 검색
- `/api/aas?keyword={keyword}&page={page}`
- 예: `/api/aas?keyword=ComputerNumericalControlProcess&page=1`

### 6.2 필터 기반 검색
- `/api/repository/search/{filterType}?value={value}`
- 예: `/api/repository/search/spindlespeed?value=1000`

## 7. 추가 개선 사항

### 7.1 globalAssetId 검색 API 활용
새로 구현한 `/aas/search/globalAssetId` API를 활용하면 더 정확한 검색 가능:
```javascript
// 예시: CNC 검색
const response = await apiClient.get('/aas/search/globalAssetId', {
  params: { keyword: 'CNC', page: 1 }
})
```

### 7.2 메뉴 카운트 업데이트
`processAASData` 함수가 모든 AAS를 순회하며 각 메뉴별 카운트 계산