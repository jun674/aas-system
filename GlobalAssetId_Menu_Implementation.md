# GlobalAssetId 기반 메뉴 시스템 구현

## 변경 사항

### 1. 모든 메뉴가 globalAssetId API 사용
이제 모든 Equipment 메뉴가 globalAssetId 검색 API를 사용합니다:

```javascript
const globalAssetIdMenus = {
  // Welding 장비들
  'CO2': 'CO2Type',
  'TIG': 'TungstenInsertGasType',
  'MIG': 'MetalInsertGasType',
  'MAG': 'MetalActiveGasType',
  'EBW': 'ElectronBeamWeldingType',
  'FW': 'FrictionWeldingType',
  // ... 더 많은 welding 타입들
  
  // CNC 장비들
  'CNC_Milling': 'ComputerNumericalControlProcess',
  'CNC_Turning': 'ComputerNumericalControlProcess',
  'CNC_Drilling': 'ComputerNumericalControlProcess',
  
  // Press 장비들
  'Press_Stamping': 'PressProcessMachine',
  'Press_Forming': 'PressProcessMachine',
  'Press_Bending': 'PressProcessMachine',
  'Press_Line': 'PressProcessMachine',
  
  // 기타 장비들
  'AMR': 'AMR',
  'Boring': 'Boring',
  'Robot': 'Robot'
}
```

### 2. API 호출 방식
```javascript
// globalAssetId로 검색
const response = await apiClient.get('/aas/search/globalAssetId', {
  params: { keyword, page }
})
```

### 3. CNC 서브메뉴 필터링
CNC는 모두 같은 globalAssetId를 사용하므로 프론트엔드에서 추가 필터링:

```javascript
if (currentMenu.value === 'CNC_Milling') {
  pageItems = pageItems.filter(aas => /A600|H6|XV/i.test(aas.idShort))
} else if (currentMenu.value === 'CNC_Turning') {
  pageItems = pageItems.filter(aas => /Lynx/i.test(aas.idShort))
} else if (currentMenu.value === 'CNC_Drilling') {
  pageItems = pageItems.filter(aas => /XD|XP/i.test(aas.idShort))
}
```

## 장점

1. **일관성**: 모든 메뉴가 동일한 API 사용
2. **확장성**: 새 장비 추가 시 globalAssetId만 설정하면 자동 분류
3. **성능**: 서버에서 최적화된 검색 수행
4. **유지보수**: menuFilters.js의 복잡한 키워드 관리 불필요

## 기존 기능 유지

- **레이지 로딩**: 페이지 1 → 2 → 3 자동 로드
- **서브모델 동적 로딩**: 노드 확장 시 서브모델 데이터 로드
- **페이지네이션**: 스크롤 시 추가 데이터 로드
- **필터 검색**: 각 메뉴별 필터 옵션 제공

## API 응답 예시

```json
// GET /api/aas/search/globalAssetId?keyword=ComputerNumericalControlProcess&page=1
{
  "code": 200,
  "status": "success",
  "message": [
    {
      "id": "https://iacf.kyungnam.ac.kr/ids/aas/CNCMechanics_A600 8K HSK-A63",
      "idShort": "NC_CNC_A600 8K HSK-A63",
      "assetInformation": {
        "globalAssetId": "https://iacf.kyungnam.ac.kr/ids/asset/ComputerNumericalControlProcess/A600 8K HSK-A63"
      }
    },
    // ... 더 많은 CNC 데이터
  ]
}
```

## 테스트 방법

1. 서버 재시작
2. 프론트엔드 새로고침
3. 각 메뉴 클릭하여 데이터 확인
4. 브라우저 개발자 도구에서 API 호출 확인

## 주의사항

- menuFilters.js의 키워드는 더 이상 사용되지 않음
- 모든 메뉴가 globalAssetId API를 통해 데이터 로드
- CNC와 Press는 프론트엔드에서 추가 필터링 수행