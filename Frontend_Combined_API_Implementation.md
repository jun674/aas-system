# 프론트엔드 Combined API 구현 가이드

## 개요
백엔드의 새로운 combined 검색 API를 활용하여 프론트엔드의 클라이언트 사이드 필터링을 서버 사이드로 이동했습니다.

## 주요 변경사항

### 1. Welding 장비 검색 개선
기존에는 모든 Welding 장비를 가져온 후 클라이언트에서 필터링했지만, 이제는 서버에서 직접 필터링합니다.

```javascript
// 기존 방식 (클라이언트 필터링)
const response = await apiClient.get('/aas/search/globalAssetId', {
  params: { keyword: 'WeldingProcess', page }
})
// 이후 클라이언트에서 CO2, EBW 등으로 필터링

// 새로운 방식 (서버 필터링)
const response = await apiClient.get('/aas/search/combined', {
  params: { 
    globalAssetId: 'WeldingProcess',
    keyword: 'CO2',  // 특정 타입만 검색
    page 
  }
})
```

### 2. CNC 장비 검색 개선
CNC 장비도 타입별로 서버에서 필터링합니다.

```javascript
// CNC Milling 검색
const response = await apiClient.get('/aas/search/combined', {
  params: { 
    globalAssetId: 'ComputerNumericalControlProcess',
    keyword: 'A600',  // Milling 장비 키워드
    page 
  }
})
```

### 3. 타입별 키워드 매핑

#### Welding 장비
```javascript
const weldingKeywords = {
  'CO2': 'CO2',
  'TIG': 'TIG',
  'MIG': 'MIG',
  'MAG': 'MAG',
  'EBW': 'ElectronBeam',  // ElectronBeamWeldingType
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
```

#### CNC 장비
```javascript
const cncKeywords = {
  'CNC_Milling': 'A600',  // A600, H6, XV 중 대표값
  'CNC_Turning': 'Lynx',
  'CNC_Drilling': 'XD'    // XD, XP 중 대표값
}
```

## 성능 개선 효과

### 1. 네트워크 트래픽 감소
- 기존: 모든 WeldingProcess 데이터 전송 후 클라이언트 필터링
- 개선: 필요한 타입의 데이터만 전송

### 2. 응답 속도 향상
- 서버에서 필터링하여 전송 데이터량 감소
- 클라이언트 처리 부담 감소

### 3. 메모리 사용량 감소
- 불필요한 데이터를 메모리에 보관하지 않음

## 구현 시 주의사항

1. **API 응답 구조 확인**
   - 페이징 응답: `response.data.message.content`
   - 일반 응답: `response.data.message`

2. **에러 처리**
   - 필수 파라미터 누락 시 400 에러
   - 서버 오류 시 500 에러

3. **키워드 대소문자**
   - 서버에서 대소문자 구분 없이 검색
   - 프론트엔드에서도 일관된 형식 사용 권장

## 향후 확장 가능성

1. **Press 장비 세분화**
   - 현재는 모든 Press가 동일
   - 향후 타입별 구분 시 combined API 활용

2. **다중 키워드 검색**
   - OR 조건 검색 지원 추가 가능
   - 복잡한 필터링 조건 구현 가능

3. **검색 결과 정렬**
   - 서버에서 정렬 옵션 추가 가능
   - 관련도, 날짜 등 다양한 정렬 기준

## 테스트 방법

1. **개발자 도구 네트워크 탭 확인**
   - API 호출 URL과 파라미터 확인
   - 응답 데이터 구조 확인

2. **각 메뉴별 테스트**
   - CO2 메뉴: CO2 장비만 표시되는지 확인
   - EBW 메뉴: ElectronBeam 장비만 표시되는지 확인
   - CNC Milling: A600 관련 장비만 표시되는지 확인

3. **페이징 테스트**
   - 스크롤 시 추가 데이터 로드 확인
   - 마지막 페이지 도달 시 동작 확인