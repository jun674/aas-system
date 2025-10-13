# CNC 메뉴 구현 가이드

## 구현 내용

### 1. globalAssetId API 활용
CNC 메뉴는 이제 globalAssetId 검색 API를 사용하여 데이터를 가져옵니다.

```javascript
// useSearch.js의 displayCurrentMenuData 함수
const cncMenus = ['CNC_Milling', 'CNC_Turning', 'CNC_Drilling']
if (cncMenus.includes(currentMenu.value)) {
  // 1. 먼저 모든 CNC 데이터를 가져옴
  const response = await apiClient.get('/aas/search/globalAssetId', {
    params: { keyword: 'ComputerNumericalControlProcess', page }
  })
  
  // 2. 프론트엔드에서 서브메뉴에 맞게 필터링
  if (currentMenu.value === 'CNC_Milling') {
    pageItems = pageItems.filter(aas => /A600|H6|XV/i.test(id))
  } else if (currentMenu.value === 'CNC_Turning') {
    pageItems = pageItems.filter(aas => /Lynx/i.test(id))
  } else if (currentMenu.value === 'CNC_Drilling') {
    pageItems = pageItems.filter(aas => /XD|XP/i.test(id))
  }
}
```

### 2. 데이터 분류 패턴

#### CNC Milling (밀링/머시닝 센터)
- **A600 시리즈**: A600_8K, A600_16K, A600_BT-50
- **H6 시리즈**: H6_8K, H6_12K
- **XV 시리즈**: XV20, XV26

#### CNC Turning (선반/터닝 센터)
- **Lynx 시리즈**: Lynx_2000G, Lynx_2100G

#### CNC Drilling (드릴링/탭핑 센터)
- **XD 시리즈**: XD20III, XD26III
- **XDI 시리즈**: XDI_26, XDI_32
- **XP 시리즈**: XP125, XP16S, XP20S, XP26S, XP32S

### 3. 레이지 로딩 유지
기존의 페이지네이션과 자동 로딩 기능은 그대로 유지됩니다:
- 첫 페이지 로드 후 0.5초 뒤 2페이지 자동 로드
- 2페이지 로드 후 0.5초 뒤 3페이지 자동 로드
- 스크롤 시 추가 페이지 로드

### 4. 서브모델 로딩
AAS 노드 확장 시 서브모델 데이터를 동적으로 로드하는 기능도 그대로 유지됩니다.

## 장점

1. **확장성**: 새로운 CNC 장비가 추가되어도 코드 수정 불필요
2. **일관성**: globalAssetId로 대분류를 명확히 구분
3. **성능**: 필요한 데이터만 필터링하여 표시
4. **유지보수**: 서버와 클라이언트의 역할 분리

## 사용 방법

1. 서버 재시작
2. 프론트엔드 새로고침
3. CNC 메뉴 클릭 시 자동으로 globalAssetId API 사용

## API 호출 예시

```bash
# 모든 CNC 데이터 조회
GET /api/aas/search/globalAssetId?keyword=ComputerNumericalControlProcess&page=1

# 응답 예시
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

## 향후 개선 사항

1. **서버 측 필터링**: 서브메뉴별 필터링을 서버에서 처리
2. **캐싱**: 자주 사용되는 데이터 캐싱
3. **메타데이터 활용**: AAS의 submodel에서 장비 타입 정보 추출