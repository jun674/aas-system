# AAS 시스템 기술 가이드 및 설치 매뉴얼

## 1. 시스템 요구사항

### 1.1 하드웨어 요구사항
- **최소 사양**
  - CPU: 2 Core 이상
  - RAM: 4GB 이상
  - Storage: 20GB 이상

- **권장 사양**
  - CPU: 4 Core 이상
  - RAM: 8GB 이상
  - Storage: 50GB 이상 (SSD 권장)

### 1.2 소프트웨어 요구사항
- **운영체제**: Windows 10/11, macOS, Linux
- **Node.js**: v18.0.0 이상
- **Java**: JDK 24
- **MongoDB**: v5.0 이상
- **Git**: 최신 버전

## 2. 개발 환경 설정

### 2.1 프론트엔드 (aas-app) 설정

#### 2.1.1 의존성 설치
```bash
cd aas-app
npm install
```

#### 2.1.2 환경 변수 설정
`.env` 파일 생성:
```env
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_TITLE=AAS Management System
```

#### 2.1.3 개발 서버 실행
```bash
npm run dev
```
- 접속 주소: http://localhost:5173

#### 2.1.4 프로덕션 빌드
```bash
npm run build
```

### 2.2 백엔드 (kyungnam_aas_server) 설정

#### 2.2.1 MongoDB 설치 및 실행
```bash
# Windows
mongod --dbpath C:\data\db

# macOS/Linux
sudo mongod --dbpath /data/db
```

#### 2.2.2 application.yml 설정
```yaml
spring:
  data:
    mongodb:
      uri: mongodb://localhost:27017/aasdb
      
  servlet:
    multipart:
      max-file-size: 100MB
      max-request-size: 100MB

server:
  port: 8080
  
aws:
  s3:
    bucket-name: your-bucket-name
    region: ap-northeast-2
    access-key: YOUR_ACCESS_KEY
    secret-key: YOUR_SECRET_KEY
```

#### 2.2.3 프로젝트 빌드 및 실행
```bash
cd kyungnam_aas_server

# 빌드
./gradlew build

# 실행
./gradlew bootRun

# 또는 JAR 파일로 실행
java -jar build/libs/aas_server.jar
```

## 3. 주요 기술 스택 상세

### 3.1 프론트엔드 기술 스택

| 기술 | 버전 | 용도 |
|------|------|------|
| Vue.js | 3.5.13 | UI 프레임워크 |
| Vite | 6.2.4 | 빌드 도구 |
| Vue Router | 4.5.0 | 라우팅 |
| Pinia | 3.0.1 | 상태 관리 |
| Axios | 1.9.0 | HTTP 통신 |
| Chart.js | 4.5.0 | 데이터 시각화 |
| Bootstrap | 5.3.0 | CSS 프레임워크 |
| Font Awesome | 6.7.2 | 아이콘 |

### 3.2 백엔드 기술 스택

| 기술 | 버전 | 용도 |
|------|------|------|
| Spring Boot | 3.4.5 | 웹 프레임워크 |
| Spring Data MongoDB | - | 데이터베이스 연동 |
| Eclipse BaSyx | 2.0.0-milestone-05 | AAS 처리 |
| AWS SDK S3 | 2.25.7 | 파일 스토리지 |
| Swagger/OpenAPI | 2.5.0 | API 문서화 |
| Lombok | - | 코드 간소화 |

## 4. API 사용 가이드

### 4.1 인증 API 예제

#### 로그인
```javascript
// Request
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}

// Response
{
  "status": "success",
  "code": 200,
  "message": {
    "userId": 1,
    "username": "admin",
    "role": "ADMIN"
  }
}
```

### 4.2 AAS 조회 API 예제

#### 전체 AAS 조회
```javascript
// Request
GET /api/aas?page=1&keyword=Robot

// Response
{
  "status": "success",
  "code": 200,
  "message": [
    {
      "id": "https://example.com/aas/robot001",
      "idShort": "Robot001",
      "description": "Industrial Robot",
      "assetInformation": {...},
      "submodels": [...]
    }
  ],
  "totalCount": 150,
  "currentPage": 1,
  "totalPages": 3
}
```

### 4.3 AASX 파일 업로드 예제

```javascript
// FormData 생성
const formData = new FormData();
formData.append('adminId', '1');
formData.append('files', file);

// Request
const response = await axios.post('/api/aas/aasx/upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});
```

## 5. 프로젝트 구조

### 5.1 프론트엔드 디렉토리 구조
```
aas-app/
├── src/
│   ├── assets/          # 정적 자원
│   ├── components/      # Vue 컴포넌트
│   │   ├── auth/       # 인증 관련
│   │   ├── charts/     # 차트 컴포넌트
│   │   ├── common/     # 공통 컴포넌트
│   │   ├── layout/     # 레이아웃 컴포넌트
│   │   └── search/     # 검색 관련
│   ├── composables/     # Vue Composition API
│   ├── router/          # 라우터 설정
│   ├── services/        # API 서비스
│   ├── stores/          # Pinia 스토어
│   ├── utils/           # 유틸리티 함수
│   └── views/           # 페이지 컴포넌트
├── public/              # 정적 파일
├── package.json         # 의존성 관리
└── vite.config.js       # Vite 설정
```

### 5.2 백엔드 디렉토리 구조
```
kyungnam_aas_server/
├── src/
│   ├── main/
│   │   ├── java/org/kyungnam/aas/
│   │   │   ├── config/          # 설정 클래스
│   │   │   ├── controller/      # REST 컨트롤러
│   │   │   ├── domain/          # 도메인 모델
│   │   │   ├── module/          # 모듈 (변환, AWS 등)
│   │   │   └── common/          # 공통 클래스
│   │   └── resources/
│   │       ├── application.yml  # 애플리케이션 설정
│   │       └── templates/       # Thymeleaf 템플릿
│   └── test/                    # 테스트 코드
├── build.gradle                 # Gradle 빌드 설정
└── gradlew                      # Gradle Wrapper
```

## 6. 트러블슈팅

### 6.1 일반적인 문제 해결

#### CORS 에러
```yaml
# application.yml에 추가
spring:
  web:
    cors:
      allowed-origins: "http://localhost:5173"
      allowed-methods: GET,POST,PUT,DELETE,OPTIONS
      allowed-headers: "*"
```

#### MongoDB 연결 실패
```bash
# MongoDB 서비스 확인
sudo systemctl status mongod

# MongoDB 재시작
sudo systemctl restart mongod
```

#### 포트 충돌
```bash
# 사용 중인 포트 확인 (Windows)
netstat -ano | findstr :8080

# 프로세스 종료 (Windows)
taskkill /PID <PID> /F

# 사용 중인 포트 확인 (macOS/Linux)
lsof -i :8080

# 프로세스 종료 (macOS/Linux)
kill -9 <PID>
```

### 6.2 성능 최적화 팁

#### 프론트엔드 최적화
1. 컴포넌트 레이지 로딩
```javascript
const SearchPage = () => import('../views/SearchPage.vue')
```

2. 이미지 최적화
```javascript
// vite.config.js
import imagemin from 'vite-plugin-imagemin'

export default {
  plugins: [
    imagemin({
      gifsicle: { optimizationLevel: 3 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 }
    })
  ]
}
```

#### 백엔드 최적화
1. 데이터베이스 인덱스 생성
```java
@Document(collection = "aas")
@CompoundIndex(def = "{'idShort': 1, 'id': 1}")
public class AASDomain {
    // ...
}
```

2. 캐싱 설정
```java
@Cacheable(value = "aasCache", key = "#id")
public AASDomain findById(String id) {
    return aasRepository.findById(id);
}
```

## 7. 배포 가이드

### 7.1 프론트엔드 배포 (Netlify)

1. 빌드 명령어 설정
```
Build command: npm run build
Publish directory: dist
```

2. 환경 변수 설정
```
VITE_API_BASE_URL=https://api.yourdomain.com
```

### 7.2 백엔드 배포 (AWS EC2)

1. EC2 인스턴스 생성 (Amazon Linux 2)
2. Java 24 설치
```bash
sudo yum install java-24-amazon-corretto
```

3. 애플리케이션 실행
```bash
nohup java -jar aas_server.jar > app.log 2>&1 &
```

4. Nginx 리버스 프록시 설정
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 8. 모니터링 및 로깅

### 8.1 로깅 설정
```yaml
# application.yml
logging:
  level:
    root: INFO
    org.kyungnam.aas: DEBUG
  file:
    name: logs/aas-server.log
    max-size: 10MB
    max-history: 30
```

### 8.2 헬스체크 엔드포인트
```java
@RestController
public class HealthController {
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "UP");
        status.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(status);
    }
}
```

## 9. 보안 가이드라인

### 9.1 프론트엔드 보안
- XSS 방지: Vue.js의 자동 이스케이핑 활용
- HTTPS 사용 필수
- 민감한 정보는 환경 변수로 관리

### 9.2 백엔드 보안
- Spring Security 설정
- API Rate Limiting
- SQL Injection 방지 (파라미터 바인딩)
- 파일 업로드 검증

## 10. 개발 도구 및 확장 프로그램

### 10.1 VS Code 확장 프로그램
- Vue - Official
- ESLint
- Prettier
- Spring Boot Extension Pack
- MongoDB for VS Code

### 10.2 Chrome 개발자 도구
- Vue.js devtools
- Network 탭을 통한 API 디버깅
- Performance 탭을 통한 성능 분석

---

이 기술 가이드는 AAS 시스템의 설치, 설정, 개발, 배포에 필요한 모든 기술적 정보를 포함하고 있습니다. 지속적으로 업데이트되며, 문제 발생 시 이 문서를 참조하시기 바랍니다.