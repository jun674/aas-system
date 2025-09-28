# AAS 시스템 아키텍처 다이어그램

## 1. 시스템 전체 구조도 (C4 Model - Context Diagram)

```mermaid
graph TB
    subgraph "External Systems"
        U[사용자<br/>User]
        A[관리자<br/>Admin]
    end
    
    subgraph "AAS Total System"
        F[프론트엔드<br/>aas-app<br/>Vue.js]
        B[백엔드<br/>kyungnam_aas_server<br/>Spring Boot]
        
        subgraph "Data Storage"
            M[(MongoDB<br/>Database)]
            S3[AWS S3<br/>File Storage]
        end
    end
    
    U --> F
    A --> F
    F --> B
    B --> M
    B --> S3
    
    style F fill:#9cf,stroke:#333,stroke-width:2px
    style B fill:#9f9,stroke:#333,stroke-width:2px
    style M fill:#f9f,stroke:#333,stroke-width:2px
    style S3 fill:#ff9,stroke:#333,stroke-width:2px
```

## 2. 프론트엔드 컴포넌트 구조도

```mermaid
graph TD
    subgraph "aas-app Frontend Architecture"
        App[App.vue<br/>Main Component]
        
        subgraph "Router Views"
            MD[MainDashboard.vue]
            SP[SearchPage.vue]
            UP[AasxUploadPage.vue]
            SU[SignupPage.vue]
            UM[UserManagementPage.vue]
        end
        
        subgraph "Components"
            subgraph "Layout"
                TB[TopBar.vue]
                SB[Sidebar.vue]
                DS[DynamicSidebar.vue]
                FT[Footer.vue]
            end
            
            subgraph "Common"
                TV[TreeView.vue]
                TN[TreeNode.vue]
            end
            
            subgraph "Features"
                LM[LoginModal.vue]
                DC[DashboardCharts.vue]
                SF[SearchFilters.vue]
                ED[EquipmentDetail.vue]
            end
        end
        
        subgraph "State Management"
            PS[Pinia Stores]
            AS[aas.js]
            AUS[auth.js]
            US[ui.js]
        end
        
        subgraph "Services"
            API[api.js]
            AASS[aasService.js]
            AUTHS[authService.js]
        end
        
        App --> MD
        App --> SP
        App --> UP
        App --> TB
        App --> DS
        
        PS --> AS
        PS --> AUS
        PS --> US
        
        API --> AASS
        API --> AUTHS
    end
```

## 3. 백엔드 레이어 아키텍처

```mermaid
graph TD
    subgraph "kyungnam_aas_server Backend Architecture"
        subgraph "Presentation Layer"
            AC[AASController]
            SC[SubmodelController]
            CC[ConceptDescriptionController]
            AUC[AuthController]
            RC[RepositoryController]
        end
        
        subgraph "Service Layer"
            AS[AASService]
            SS[SubmodelService]
            CS[ConceptDescriptionService]
            AUS[AuthService]
            RS[RepositoryService]
            S3S[AWSS3Service]
        end
        
        subgraph "Domain Layer"
            AD[AASDomain]
            SD[SubmodelDomain]
            CD[ConceptDescriptionDomain]
            UD[User]
        end
        
        subgraph "Repository Layer"
            AR[AASRepository]
            SR[SubmodelRepository]
            CR[ConceptDescriptionRepository]
            UR[UserRepository]
        end
        
        subgraph "External Libraries"
            BASYX[Eclipse BaSyx<br/>AAS4J]
            CONV[AASXConvertModule]
        end
        
        AC --> AS
        SC --> SS
        CC --> CS
        AUC --> AUS
        RC --> RS
        
        AS --> AD
        AS --> AR
        AS --> S3S
        AS --> CONV
        
        SS --> SD
        SS --> SR
        
        CS --> CD
        CS --> CR
        
        AUS --> UD
        AUS --> UR
        
        CONV --> BASYX
    end
```

## 4. 데이터 플로우 다이어그램

```mermaid
sequenceDiagram
    participant U as 사용자
    participant F as Frontend<br/>(Vue.js)
    participant B as Backend<br/>(Spring Boot)
    participant M as MongoDB
    participant S3 as AWS S3
    
    Note over U,S3: AASX 파일 업로드 프로세스
    
    U->>F: AASX 파일 선택
    F->>F: 파일 유효성 검사
    F->>B: POST /api/aas/aasx/upload
    B->>S3: 파일 저장
    S3-->>B: 저장 완료
    B->>B: AASX 파싱 (BaSyx)
    B->>M: AAS 데이터 저장
    M-->>B: 저장 완료
    B-->>F: 업로드 성공 응답
    F-->>U: 성공 메시지 표시
    
    Note over U,M: AAS 데이터 조회 프로세스
    
    U->>F: 검색 요청
    F->>B: GET /api/aas?keyword=xxx
    B->>M: 데이터 조회
    M-->>B: AAS 목록
    B-->>F: JSON 응답
    F->>F: 데이터 렌더링
    F-->>U: 검색 결과 표시
```

## 5. 배포 아키텍처

```mermaid
graph TB
    subgraph "Client Side"
        BR[웹 브라우저]
    end
    
    subgraph "Frontend Hosting"
        CDN[CDN<br/>Netlify/Vercel]
        VUE[Vue.js App<br/>Static Files]
    end
    
    subgraph "Backend Infrastructure"
        LB[Load Balancer]
        
        subgraph "Application Servers"
            EC1[EC2 Instance 1<br/>Spring Boot]
            EC2[EC2 Instance 2<br/>Spring Boot]
        end
        
        subgraph "Data Layer"
            MONGO[(MongoDB<br/>Cluster)]
            S3DB[AWS S3<br/>Bucket]
        end
    end
    
    BR --> CDN
    CDN --> VUE
    VUE --> LB
    LB --> EC1
    LB --> EC2
    EC1 --> MONGO
    EC2 --> MONGO
    EC1 --> S3DB
    EC2 --> S3DB
    
    style CDN fill:#9cf,stroke:#333,stroke-width:2px
    style LB fill:#f96,stroke:#333,stroke-width:2px
    style MONGO fill:#9f9,stroke:#333,stroke-width:2px
    style S3DB fill:#ff9,stroke:#333,stroke-width:2px
```

## 6. 보안 아키텍처

```mermaid
graph TD
    subgraph "Security Layers"
        U[사용자]
        
        subgraph "Frontend Security"
            CORS[CORS Policy]
            XSS[XSS Protection]
            CSP[Content Security Policy]
        end
        
        subgraph "API Gateway"
            AUTH[Authentication]
            AUTHZ[Authorization]
            RL[Rate Limiting]
        end
        
        subgraph "Backend Security"
            SS[Spring Security]
            JWT[Session Management]
            VAL[Input Validation]
        end
        
        subgraph "Data Security"
            ENC[Encryption at Rest]
            TLS[TLS/SSL]
            BACKUP[Backup & Recovery]
        end
        
        U --> CORS
        CORS --> AUTH
        AUTH --> SS
        SS --> ENC
        
        XSS --> AUTHZ
        AUTHZ --> JWT
        JWT --> TLS
        
        CSP --> RL
        RL --> VAL
        VAL --> BACKUP
    end
```

## 7. 개발 환경 구성도

```mermaid
graph LR
    subgraph "Development Environment"
        subgraph "Frontend Dev"
            VSCODE1[VS Code]
            NODE[Node.js v18+]
            VITE[Vite Dev Server<br/>:5173]
        end
        
        subgraph "Backend Dev"
            VSCODE2[VS Code/<br/>IntelliJ IDEA]
            JAVA[Java 24]
            GRADLE[Gradle]
            BOOT[Spring Boot<br/>:8080]
        end
        
        subgraph "Local Services"
            MONGODB[MongoDB<br/>:27017]
            SWAGGER[Swagger UI<br/>:8080/swagger-ui]
        end
        
        VSCODE1 --> NODE
        NODE --> VITE
        VITE --> BOOT
        
        VSCODE2 --> JAVA
        JAVA --> GRADLE
        GRADLE --> BOOT
        
        BOOT --> MONGODB
        BOOT --> SWAGGER
    end
```

## 8. CI/CD 파이프라인

```mermaid
graph LR
    subgraph "Version Control"
        GIT[Git Repository]
    end
    
    subgraph "CI Pipeline"
        BUILD[Build]
        TEST[Test]
        LINT[Lint/Format]
        SCAN[Security Scan]
    end
    
    subgraph "CD Pipeline"
        STAGE[Staging Deploy]
        PROD[Production Deploy]
    end
    
    subgraph "Monitoring"
        LOG[Logging]
        METRIC[Metrics]
        ALERT[Alerts]
    end
    
    GIT --> BUILD
    BUILD --> TEST
    TEST --> LINT
    LINT --> SCAN
    SCAN --> STAGE
    STAGE --> PROD
    PROD --> LOG
    LOG --> METRIC
    METRIC --> ALERT
```

---

이 다이어그램들은 AAS 통합 시스템의 전체적인 구조와 각 컴포넌트 간의 관계를 시각적으로 표현합니다. Mermaid 문법을 지원하는 마크다운 뷰어에서 다이어그램이 렌더링됩니다.