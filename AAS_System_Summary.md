# AAS 통합 시스템 요약 문서

## 📋 프로젝트 개요

**프로젝트명**: AAS (Asset Administration Shell) 통합 관리 시스템  
**개발 기간**: 진행 중  
**목적**: 제조업 디지털 트윈을 위한 AAS 데이터 관리 및 시각화 플랫폼

## 🏗️ 시스템 구성

### 1. **프론트엔드 (aas-app)**
- **프레임워크**: Vue.js 3.5.13
- **빌드 도구**: Vite 6.2.4
- **주요 라이브러리**: Vue Router, Pinia, Axios, Chart.js, Bootstrap
- **개발 언어**: JavaScript/Vue

### 2. **백엔드 (kyungnam_aas_server)**
- **프레임워크**: Spring Boot 3.4.5
- **개발 언어**: Java 24
- **데이터베이스**: MongoDB
- **파일 스토리지**: AWS S3
- **AAS 처리**: Eclipse BaSyx AAS4J

## 📊 현재 개발 현황

### ✅ 완료된 기능 (90%)
1. **기본 인프라 구축**
   - Vue.js 프론트엔드 프레임워크 설정
   - Spring Boot 백엔드 서버 구축
   - MongoDB 데이터베이스 연동

2. **핵심 기능 구현**
   - AAS/Submodel/ConceptDescription CRUD API
   - AASX 파일 업로드 및 파싱
   - 키워드 및 카테고리별 검색
   - 대시보드 통계 표시
   - 사용자 인증 시스템

3. **UI/UX**
   - 반응형 웹 디자인
   - 대시보드 페이지
   - 검색 페이지 with 동적 사이드바
   - 사용자 관리 페이지

### 🔄 진행 중인 작업 (10%)
- AWS S3 파일 업로드 최적화
- 고급 검색 필터 기능
- 성능 최적화
- 에러 처리 개선

## 🚀 주요 기능

### 1. **데이터 관리**
- AASX 파일 업로드 및 자동 변환
- AAS, Submodel, ConceptDescription 조회/검색
- 페이징 처리된 대용량 데이터 관리

### 2. **검색 및 필터링**
- 키워드 기반 통합 검색
- 카테고리별 필터링 (Equipment, Material, Process)
- 동적 메뉴 생성

### 3. **시각화**
- 대시보드 통계 카드
- 트리 구조 데이터 표시
- Chart.js를 활용한 데이터 시각화

### 4. **사용자 관리**
- 로그인/회원가입
- 세션 기반 인증
- 권한 관리 (일반/관리자)

## 📁 생성된 문서

1. **[AAS_System_Documentation.md](./AAS_System_Documentation.md)**
   - 전체 시스템 문서
   - API 명세
   - 진척도 및 계획

2. **[AAS_System_Architecture_Diagram.md](./AAS_System_Architecture_Diagram.md)**
   - 시스템 아키텍처 다이어그램
   - 컴포넌트 구조도
   - 데이터 플로우

3. **[AAS_System_Technical_Guide.md](./AAS_System_Technical_Guide.md)**
   - 설치 및 설정 가이드
   - 기술 스택 상세
   - 트러블슈팅

## 🔗 빠른 시작

### 프론트엔드
```bash
cd aas-app
npm install
npm run dev
# http://localhost:5173
```

### 백엔드
```bash
cd kyungnam_aas_server
./gradlew bootRun
# http://localhost:8080
```

## 📈 프로젝트 통계

- **전체 진행률**: 약 90%
- **프론트엔드 파일**: 30+ Vue 컴포넌트
- **백엔드 API**: 20+ REST 엔드포인트
- **데이터 모델**: AAS, Submodel, ConceptDescription, User

## 🎯 향후 계획

### 단기 (1-2개월)
- [ ] AWS S3 통합 완료
- [ ] 검색 성능 최적화
- [ ] 모바일 반응형 개선

### 중장기 (3-6개월)
- [ ] 실시간 데이터 동기화
- [ ] AI 기반 데이터 분석
- [ ] 다국어 지원
- [ ] 마이크로서비스 전환

## 👥 개발팀 정보

- **프로젝트 관리**: 경남대학교 AAS 개발팀
- **문서 작성일**: 2025-09-28
- **최종 수정일**: 2025-09-28

---

이 요약 문서는 AAS 통합 시스템의 현재 상태를 간략하게 정리한 것입니다. 자세한 내용은 각 상세 문서를 참조하시기 바랍니다.