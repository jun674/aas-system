# AAS (Asset Administration Shell) 통합 시스템 문서

## 1. 시스템 개요

### 1.1 프로젝트 소개
AAS 통합 시스템은 제조업 디지털 트윈을 위한 Asset Administration Shell 관리 플랫폼입니다. 이 시스템은 두 개의 주요 컴포넌트로 구성되어 있습니다:

- **aas-app**: Vue.js 기반 프론트엔드 애플리케이션
- **kyungnam_aas_server**: Spring Boot 기반 백엔드 API 서버

### 1.2 시스템 목적
- 제조 장비, 재료, 프로세스의 디지털 트윈 정보를 AAS 형식으로 관리
- AASX 파일 업로드 및 변환 기능 제공
- AAS, Submodel, ConceptDescription 데이터의 검색 및 조회
- 웹 기반 사용자 인터페이스를 통한 직관적인 데이터 접근

## 2. 시스템 아키텍처

### 2.1 전체 구조도

```
┌─────────────────┐     ┌─────────────────────┐     ┌──────────────────┐
│   사용자 브라우저  │────▶│   aas-app (Vue.js)  │────▶│ kyungnam_aas_server│
│                 │     │   - Vue Router      │     │  (Spring Boot)    │
└─────────────────┘     │   - Pinia Store     │     │                  │
                       │   - Axios Client    │     │  - REST API      │
                       │   - Chart.js        │     │  - MongoDB       │
                       └─────────────────────┘     │  - AWS S3        │
                                                  │  - BaSyx AAS4J   │
                                                  └──────────────────┘
```

### 2.2 컴포넌트 상세

#### 2.2.1 프론트엔드 (aas-app)
- **기술 스택**: 
  - Vue.js 3.5.13
  - Vite 6.2.4 (빌드 도구)
  - Vue Router 4.5.0 (라우팅)
  - Pinia 3.0.1 (상태 관리)
  - Axios 1.9.0 (HTTP 클라이언트)
  - Chart.js 4.5.0 (데이터 시각화)
  - Bootstrap 5.3.0 (UI 프레임워크)

- **주요 기능**:
  - 대시보드: 전체 AAS, Submodel, ConceptDescription 통계 표시
  - 검색 기능: 키워드, 카테고리별 검색
  - AASX 파일 업로드
  - 사용자 인증 및 관리
  - 반응형 웹 디자인

#### 2.2.2 백엔드 (kyungnam_aas_server)
- **기술 스택**:
  - Java 24
  - Spring Boot 3.4.5
  - Spring Data MongoDB
  - Eclipse BaSyx AAS4J 2.0.0-milestone-05
  - AWS SDK for S3
  - Swagger/OpenAPI 3.0

- **주요 기능**:
  - RESTful API 제공
  - AASX 파일 파싱 및 변환
  - MongoDB를 통한 데이터 저장
  - AWS S3 파일 스토리지
  - 사용자 인증 및 권한 관리

## 3. 주요 기능 및 API

### 3.1 AAS 관리 API

| 엔드포인트 | 메소드 | 설명 |
|-----------|--------|------|
| `/api/aas` | GET | 전체 AAS 조회 (페이징, 키워드 검색 지원) |
| `/api/aas/{aasId}` | GET | 특정 AAS 정보 조회 |
| `/api/aas/{aasId}` | DELETE | AAS 삭제 |
| `/api/aas/submodel/{aasId}` | GET | AAS의 서브모델 조회 |
| `/api/aas/aasx/upload` | POST | AASX 파일 업로드 |

### 3.2 Submodel 관리 API

| 엔드포인트 | 메소드 | 설명 |
|-----------|--------|------|
| `/api/submodel` | GET | 전체 Submodel 조회 (페이징 지원) |
| `/api/submodel/{submodelId}` | GET | 특정 Submodel 조회 |
| `/api/submodel/{submodelId}` | DELETE | Submodel 삭제 |

### 3.3 ConceptDescription API

| 엔드포인트 | 메소드 | 설명 |
|-----------|--------|------|
| `/api/concept/description` | GET | 전체 ConceptDescription 조회 |
| `/api/concept/description/{conceptId}` | DELETE | ConceptDescription 삭제 |

### 3.4 검색 API

| 엔드포인트 | 메소드 | 설명 |
|-----------|--------|------|
| `/api/repository/search/{filterType}` | GET | 필터 타입별 검색 |

### 3.5 인증 API

| 엔드포인트 | 메소드 | 설명 |
|-----------|--------|------|
| `/api/auth/login` | POST | 사용자 로그인 |
| `/api/auth/signup` | POST | 사용자 가입 |
| `/api/auth/logout` | POST | 로그아웃 |

## 4. 데이터 모델

### 4.1 AAS (Asset Administration Shell)
```json
{
  "id": "string",
  "idShort": "string",
  "description": "string",
  "administration": {},
  "assetInformation": {},
  "submodels": []
}
```

### 4.2 Submodel
```json
{
  "id": "string",
  "idShort": "string",
  "semanticId": {},
  "submodelElements": []
}
```

### 4.3 ConceptDescription
```json
{
  "id": "string",
  "idShort": "string",
  "description": "string",
  "isCaseOf": []
}
```

## 5. 시스템 구성 및 배포

### 5.1 개발 환경
- **프론트엔드 개발 서버**: 
  ```bash
  cd aas-app
  npm install
  npm run dev
  ```

- **백엔드 개발 서버**:
  ```bash
  cd kyungnam_aas_server
  ./gradlew bootRun
  ```

### 5.2 프로덕션 배포
- **프론트엔드**: Netlify, Vercel 등 정적 호스팅 서비스
- **백엔드**: AWS EC2, EKS 또는 기타 클라우드 서버

### 5.3 데이터베이스
- MongoDB (로컬: mongodb://localhost:27017/aasdb)

## 6. 현재 진척도

### 6.1 완료된 기능 ✅
- [x] 기본 프로젝트 구조 설정
- [x] Vue.js 프론트엔드 프레임워크 구축
- [x] Spring Boot 백엔드 API 서버 구축
- [x] MongoDB 연동
- [x] 대시보드 UI 구현
- [x] AAS/Submodel/ConceptDescription CRUD API
- [x] AASX 파일 업로드 기능
- [x] 검색 기능 (키워드, 카테고리별)
- [x] 사용자 인증 시스템
- [x] Swagger API 문서화

### 6.2 진행 중인 기능 🔄
- [ ] AWS S3 파일 업로드 최적화
- [ ] 고급 검색 필터 기능
- [ ] 실시간 데이터 업데이트
- [ ] 성능 최적화

### 6.3 계획된 기능 📋
- [ ] 다국어 지원
- [ ] 데이터 내보내기 기능
- [ ] 대시보드 커스터마이징
- [ ] 모바일 앱 개발
- [ ] AI 기반 데이터 분석

## 7. 주요 화면 구성

### 7.1 메인 대시보드
- 전체 AAS, Submodel, ConceptDescription 통계
- 빠른 검색 기능
- 카테고리별 바로가기 (Equipment, Material, Process)
- AASX 업로드 바로가기

### 7.2 검색 페이지
- 동적 사이드바 메뉴
- 필터링 옵션
- 검색 결과 표시
- 상세 정보 모달

### 7.3 사용자 관리
- 로그인/회원가입
- 사용자 프로필 관리
- 권한 관리 (관리자)

## 8. 보안 및 인증

### 8.1 인증 방식
- 세션 기반 인증
- Spring Security 활용
- CORS 설정

### 8.2 권한 관리
- 일반 사용자: 조회 권한
- 관리자: 전체 CRUD 권한

## 9. 성능 고려사항

### 9.1 프론트엔드
- 코드 스플리팅
- 레이지 로딩
- 캐싱 전략

### 9.2 백엔드
- 페이징 처리
- 데이터베이스 인덱싱
- API 응답 캐싱

## 10. 향후 개발 계획

### 단기 계획 (1-3개월)
1. AWS S3 통합 완료
2. 검색 성능 최적화
3. UI/UX 개선

### 중기 계획 (3-6개월)
1. 실시간 데이터 동기화
2. 고급 분석 기능
3. API 버전 관리

### 장기 계획 (6개월 이상)
1. 마이크로서비스 아키텍처 전환
2. AI/ML 기능 통합
3. 국제 표준 준수 인증

## 11. 문서 버전 정보

- 문서 버전: 1.0.0
- 작성일: 2025-09-28
- 최종 수정일: 2025-09-28
- 작성자: AAS 개발팀

---

이 문서는 AAS 통합 시스템의 현재 상태를 반영하며, 시스템 개발 진행에 따라 지속적으로 업데이트될 예정입니다.