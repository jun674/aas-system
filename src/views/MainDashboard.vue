<template>
  <main class="dashboard">
    <div class="dashboard-header">
      <h1 class="dashboard-title">
        <span class="title-gradient">AAS System Dashboard</span>
      </h1>
      <p class="dashboard-subtitle">Real-time Data Monitoring & Management</p>
    </div>
    
    <section class="card-grid">
      <div class="stat-card stat-card-primary">
        <div class="stat-card-content">
          <div class="stat-icon-wrapper">
            <i class="fas fa-globe-asia"></i>
          </div>
          <div class="stat-info">
            <h3>Total AAS</h3>
            <p class="stat-number">{{ totalAas.toLocaleString() }}</p>
          </div>
        </div>
        <div class="stat-card-bg"></div>
      </div>
      
      <div class="stat-card stat-card-success">
        <div class="stat-card-content">
          <div class="stat-icon-wrapper">
            <i class="fas fa-folder-tree"></i>
          </div>
          <div class="stat-info">
            <h3>Total Submodels</h3>
            <p class="stat-number">{{ totalSubmodels.toLocaleString() }}</p>
          </div>
        </div>
        <div class="stat-card-bg"></div>
      </div>
      
      <div class="stat-card stat-card-warning">
        <div class="stat-card-content">
          <div class="stat-icon-wrapper">
            <i class="fas fa-book"></i>
          </div>
          <div class="stat-info">
            <h3>Total Concept Descriptions</h3>
            <p class="stat-number">{{ totalConcepts.toLocaleString() }}</p>
          </div>
        </div>
        <div class="stat-card-bg"></div>
      </div>
    </section>

    <section class="main-content-grid">
      <div class="content-box full-width">
        <div class="filter-shortcuts">
          <h2 class="section-title">
            <i class="fas fa-filter"></i>
            Quick Filters
          </h2>
          <div class="filter-buttons">
            <button class="filter-btn" @click="quickSearch('inputpowervoltage', '380')">
              <i class="fas fa-bolt"></i>
              <span>Input Voltage 380V</span>
            </button>
            <button class="filter-btn" @click="quickSearch('numberofphases', 'Three')">
              <i class="fas fa-wave-square"></i>
              <span>Three Phase</span>
            </button>
            <button class="filter-btn" @click="quickSearch('dutycycle', '60')">
              <i class="fas fa-percentage"></i>
              <span>Duty Cycle 60%</span>
            </button>
          </div>
        </div>

        <div class="quick-launch-section">
          <h2 class="section-title">
            <i class="fas fa-rocket"></i>
            Quick Launch
          </h2>
          
          <div class="quick-search-box">
            <i class="fas fa-search search-icon"></i>
            <input
              type="text"
              v-model="searchKeyword"
              @keyup.enter="executeSearch"
              placeholder="Enter search keywords..."
              class="search-input"
            >
            <button class="search-btn" @click="executeSearch">
              <i class="fas fa-arrow-right"></i>
            </button>
          </div>
          
          <nav class="action-card-list">
            <a href="#" @click.prevent="navigateToSearch('equipment')" class="action-card equipment-card">
              <div class="card-icon">
                <i class="fas fa-cogs"></i>
              </div>
              <div class="card-content">
                <h4>Equipment Search</h4>
                <p>Browse manufacturing equipment</p>
              </div>
              <i class="fas fa-chevron-right arrow-icon"></i>
            </a>
            
            <a href="#" @click.prevent="navigateToSearch('material')" class="action-card material-card">
              <div class="card-icon">
                <i class="fas fa-cube"></i>
              </div>
              <div class="card-content">
                <h4>Material Search</h4>
                <p>Browse materials and components</p>
              </div>
              <i class="fas fa-chevron-right arrow-icon"></i>
            </a>
            
            <a href="#" @click.prevent="navigateToSearch('process')" class="action-card process-card">
              <div class="card-icon">
                <i class="fas fa-sync-alt"></i>
              </div>
              <div class="card-content">
                <h4>Process Search</h4>
                <p>Browse manufacturing processes</p>
              </div>
              <i class="fas fa-chevron-right arrow-icon"></i>
            </a>
            
            <a href="#" @click.prevent="navigateToUpload" class="action-card upload-card">
              <div class="card-icon">
                <i class="fas fa-upload"></i>
              </div>
              <div class="card-content">
                <h4>AASX Upload</h4>
                <p>Upload new AAS packages</p>
              </div>
              <i class="fas fa-chevron-right arrow-icon"></i>
            </a>
          </nav>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/services/api';

const router = useRouter();

const searchKeyword = ref(''); // 입력하는 검색어를 저장하기 위한 반응형 상태 변수

// 대시보드에 표시될 전체 항목 수를 저장하는 반응형 상태 변수들
const totalAas = ref(0);
const totalSubmodels = ref(0);
const totalConcepts = ref(0);

// 컴포넌트가 DOM에 마운트(생성)된 직후에 실행될 코드를 등록
onMounted(() => {  
  fetchDashboardCounts(); // 대시보드에 필요한 숫자 데이터들을 가져오는 함수를 호출
});

/**
 * 대시보드 카드에 표시될 전체 AAS, Submodel, Concept의 개수를 API를 통해 비동기적으로 가져오는 함수
 */
const fetchDashboardCounts = async () => {
  try {
    // Promise.all을 사용하여 여러 API 요청을 동시에 보내고 모든 요청이 완료될 때까지 wait
    const [aasResponse, submodelResponse, conceptResponse] = await Promise.all([
      apiClient.get('/aas?page=1'),
      apiClient.get('/submodel?page=1'),
      apiClient.get('/concept/description?page=1')
    ]);

    // 각 API 응답에서 totalCount 값을 추출하여 반응형 상태 변수에 할당
    totalAas.value = aasResponse.data.totalCount || 0;
    totalSubmodels.value = submodelResponse.data.totalCount || 0;
    totalConcepts.value = conceptResponse.data.totalCount || 0;

  } catch (error) {
    console.error("Failed to fetch dashboard counts:", error);
  }
};

/**
 * 특정 카테고리가 지정된 검색 페이지로 이동하는 함수
 */
const navigateToSearch = (category) => {
  router.push({ path: '/search', query: { category: category } });
};

/**
 * AASX 파일 업로드 페이지로 이동하는 함수
 */
const navigateToUpload = () => {
    router.push({ path: '/search', query: { menu: 'AASX' } });
};

/**
 * 메인 검색창에서 입력한 키워드로 검색을 실행하는 함수
 */
const executeSearch = () => {
  if (!searchKeyword.value.trim()) return;  // 입력된 검색어가 공백을 제외하고 비어있으면 아무 작업도 하지 않음
  router.push({ path: '/search', query: { keyword: searchKeyword.value } }); // 검색어를 쿼리 파라미터로 포함하여 검색 페이지로 이동
};

/**
 * 미리 정의된 조건으로 빠른 검색을 실행하는 함수
 */
const quickSearch = (filterType, value) => {
  router.push({
    path: '/search',
    query: { 
      filterType: filterType,
      value: value,
      menu: 'ALL' // '전체 데이터 보기' 컨텍스트에서 검색하도록 지정
    }
  });
};
</script>

<style scoped>
/* 메인 대시보드 컨테이너 */
main.dashboard {
    padding: 30px;
    height: calc(100vh - 50px);
    overflow-y: auto;
    background: #f5f7fa;
}

/* 대시보드 헤더 */
.dashboard-header {
    text-align: center;
    margin-bottom: 40px;
}

.dashboard-title {
    font-size: 2.5em;
    margin-bottom: 10px;
    font-weight: 700;
}

.title-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.dashboard-subtitle {
    color: #6c757d;
    font-size: 1.1em;
    margin: 0;
}

/* 통계 카드 그리드 */
.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 25px;
    margin-bottom: 40px;
}

/* 통계 카드 스타일 */
.stat-card {
    position: relative;
    background: white;
    border-radius: 16px;
    padding: 30px;
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.stat-card-content {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 20px;
}

.stat-card-bg {
    position: absolute;
    top: -50%;
    right: -30%;
    width: 200%;
    height: 200%;
    opacity: 0.05;
    transform: rotate(45deg);
    transition: all 0.5s ease;
}

.stat-card-primary .stat-card-bg {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card-success .stat-card-bg {
    background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
}

.stat-card-warning .stat-card-bg {
    background: linear-gradient(135deg, #f6ad55 0%, #ed8936 100%);
}

.stat-card:hover .stat-card-bg {
    opacity: 0.1;
    transform: rotate(45deg) scale(1.1);
}

.stat-icon-wrapper {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8em;
}

.stat-card-primary .stat-icon-wrapper {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.stat-card-success .stat-icon-wrapper {
    background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
    color: white;
}

.stat-card-warning .stat-icon-wrapper {
    background: linear-gradient(135deg, #f6ad55 0%, #ed8936 100%);
    color: white;
}

.stat-info h3 {
    margin: 0 0 8px 0;
    color: #6c757d;
    font-size: 0.9em;
    font-weight: 500;
    letter-spacing: 0.5px;
}

.stat-number {
    margin: 0;
    font-size: 2.2em;
    font-weight: 700;
    color: #2d3748;
}

/* 메인 콘텐츠 그리드 */
.main-content-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 30px;
}

.content-box {
    background: white;
    padding: 35px;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.content-box.full-width {
    grid-column: 1 / -1;
}

/* 섹션 타이틀 */
.section-title {
    font-size: 1.4em;
    margin: 0 0 25px 0;
    color: #2d3748;
    display: flex;
    align-items: center;
    gap: 10px;
}

.section-title i {
    font-size: 0.9em;
    color: #667eea;
}

/* 필터 섹션 */
.filter-shortcuts {
    margin-bottom: 40px;
}

.filter-buttons {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
}

.filter-btn {
    background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
    border: 1px solid #e9ecef;
    border-radius: 12px;
    padding: 12px 20px;
    font-size: 0.95em;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #4a5568;
    font-weight: 500;
}

.filter-btn:hover {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    border-color: transparent;
}

.filter-btn i {
    font-size: 0.9em;
}

/* 빠른 실행 섹션 */
.quick-launch-section {
    margin-top: 40px;
}

/* 검색 박스 */
.quick-search-box {
    position: relative;
    margin-bottom: 30px;
}

.search-input {
    width: 100%;
    padding: 16px 50px 16px 50px;
    border-radius: 12px;
    border: 2px solid #e9ecef;
    font-size: 1.05em;
    transition: all 0.3s ease;
    background: #f8f9fa;
}

.search-input:focus {
    outline: none;
    border-color: #667eea;
    background: white;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.search-icon {
    position: absolute;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
    color: #6c757d;
    font-size: 1.1em;
}

.search-btn {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    width: 40px;
    height: 40px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.search-btn:hover {
    transform: translateY(-50%) scale(1.05);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* 액션 카드 리스트 */
.action-card-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
}

.action-card {
    display: flex;
    align-items: center;
    padding: 25px;
    background: #f8f9fa;
    border-radius: 12px;
    text-decoration: none;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    border: 1px solid transparent;
}

.action-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    transition: all 0.3s ease;
}

.equipment-card::before {
    background: linear-gradient(90deg, #3498db 0%, #2980b9 100%);
}

.material-card::before {
    background: linear-gradient(90deg, #48bb78 0%, #38a169 100%);
}

.process-card::before {
    background: linear-gradient(90deg, #f6ad55 0%, #ed8936 100%);
}

.upload-card::before {
    background: linear-gradient(90deg, #e74c3c 0%, #c0392b 100%);
}

.action-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    background: white;
}

.action-card:hover::before {
    height: 100%;
    opacity: 0.05;
}

.card-icon {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4em;
    margin-right: 20px;
    transition: all 0.3s ease;
}

.equipment-card .card-icon {
    background: rgba(52, 152, 219, 0.1);
    color: #3498db;
}

.material-card .card-icon {
    background: rgba(72, 187, 120, 0.1);
    color: #48bb78;
}

.process-card .card-icon {
    background: rgba(246, 173, 85, 0.1);
    color: #f6ad55;
}

.upload-card .card-icon {
    background: rgba(231, 76, 60, 0.1);
    color: #e74c3c;
}

.action-card:hover .card-icon {
    transform: scale(1.1);
}

.card-content {
    flex: 1;
}

.card-content h4 {
    margin: 0 0 5px 0;
    font-size: 1.1em;
    color: #2d3748;
    font-weight: 600;
}

.card-content p {
    margin: 0;
    color: #6c757d;
    font-size: 0.9em;
}

.arrow-icon {
    color: #cbd5e0;
    font-size: 1.2em;
    transition: all 0.3s ease;
}

.action-card:hover .arrow-icon {
    color: #667eea;
    transform: translateX(5px);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
    main.dashboard {
        padding: 20px;
    }
    
    .dashboard-title {
        font-size: 2em;
    }
    
    .card-grid {
        grid-template-columns: 1fr;
    }
    
    .filter-buttons {
        flex-direction: column;
    }
    
    .filter-btn {
        width: 100%;
    }
    
    .action-card-list {
        grid-template-columns: 1fr;
    }
}

/* 애니메이션 */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.stat-card {
    animation: fadeIn 0.6s ease-out;
}

.stat-card:nth-child(2) {
    animation-delay: 0.1s;
}

.stat-card:nth-child(3) {
    animation-delay: 0.2s;
}

.content-box {
    animation: fadeIn 0.6s ease-out 0.3s both;
}
</style>