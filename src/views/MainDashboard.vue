<template>
  <main class="dashboard">
    <h1>AAS System Dashboard</h1>
    
    <section class="card-grid">
      <div class="stat-card">
        <div class="icon"><i class="fas fa-globe-asia"></i></div>
        <h3>Total AAS</h3>
        <p>{{ totalAas }}</p>
      </div>
      <div class="stat-card">
        <div class="icon"><i class="fas fa-folder-tree"></i></div>
        <h3>Total Submodels</h3>
        <p>{{ totalSubmodels }}</p>
      </div>
      <div class="stat-card">
        <div class="icon"><i class="fas fa-book"></i></div>
        <h3>Total Concept Descriptions</h3>
        <p>{{ totalConcepts }}</p>
      </div>
    </section>

    <section class="main-content-grid">
      <div class="content-box full-width">

        <div class="filter-shortcuts">
          <h2>Shortcuts to key filters</h2>
          <button class="btn" @click="quickSearch('inputpowervoltage', '380')"><i class="fas fa-bolt"></i> Input Power Voltage 380V</button>
          <button class="btn" @click="quickSearch('numberofphases', 'Three')"><i class="fas fa-bolt"></i> Number of Phases Three</button>
          <button class="btn" @click="quickSearch('dutycycle', '60')"><i class="fas fa-bolt"></i> Duty Cycle 60%</button>
        </div>
        <hr class="section-divider">

        <h2>Quick Launch</h2>
        <div class="quick-search-box">
          <i class="fas fa-search"></i>
          <input type="text" v-model="searchKeyword" @keyup.enter="executeSearch" placeholder="What data do you need">
        </div>
        <nav class="action-card-list">
          <a href="#" @click.prevent="navigateToSearch('equipment')">
            <span class="icon"><i class="fas fa-cogs"></i></span>
            Equipment Data Search
          </a>
          <a href="#" @click.prevent="navigateToSearch('material')">
            <span class="icon"><i class="fas fa-cube"></i></span>
            Material Data Search
          </a>
           <a href="#" @click.prevent="navigateToSearch('process')">
            <span class="icon"><i class="fas fa-sync-alt"></i></span>
            Process Data Search
          </a>
          <a href="#" @click.prevent="navigateToUpload">
            <span class="icon upload-icon"><i class="fas fa-upload"></i></span>
            AASX Upload
          </a>
        </nav>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/services/api';

const router = useRouter();
const searchKeyword = ref('');

const totalAas = ref(0);
const totalSubmodels = ref(0);
const totalConcepts = ref(0);

onMounted(() => {
  fetchDashboardCounts();
});

const fetchDashboardCounts = async () => {
  try {
    const [aasResponse, submodelResponse, conceptResponse] = await Promise.all([
      apiClient.get('/aas?page=1'),
      apiClient.get('/submodel?page=1'),
      apiClient.get('/concept/description?page=1')
    ]);

    totalAas.value = aasResponse.data.totalCount || 0;
    totalSubmodels.value = submodelResponse.data.totalCount || 0;
    totalConcepts.value = conceptResponse.data.totalCount || 0;

  } catch (error) {
    console.error("Failed to fetch dashboard counts:", error);
  }
};

const navigateToSearch = (category) => {
  router.push({ path: '/search', query: { category: category } });
};

const navigateToUpload = () => {
    router.push({ path: '/search', query: { menu: 'AASX' } });
};

const executeSearch = () => {
  if (!searchKeyword.value.trim()) return;
  router.push({ path: '/search', query: { keyword: searchKeyword.value } });
};

const quickSearch = (filterType, value) => {
  router.push({
    path: '/search',
    query: { 
      filterType: filterType,
      value: value,
      menu: 'ALL' 
    }
  });
};
</script>

<style scoped>
main.dashboard {
    padding: 20px 30px;
    height: calc(100vh - 50px);
    overflow-y: auto;
}
.dashboard h1 {
    font-size: 1.8em;
    margin-bottom: 20px;
}
.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}
.stat-card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    border-left: 4px solid #3498db;
}
.stat-card .icon {
    font-size: 1.5em;
    color: #3498db;
    margin-bottom: 10px;
}
.stat-card h3 {
    margin: 0 0 5px 0;
    color: #7f8c8d;
    font-size: 0.9em;
    text-transform: uppercase;
}
.stat-card p {
    margin: 0;
    font-size: 2em;
    font-weight: bold;
}
.main-content-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 30px;
}
.content-box {
    background: white;
    padding: 25px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.content-box.full-width {
  grid-column: 1 / -1;
}
.content-box h2 {
    margin-top: 0;
    margin-bottom: 20px;
    border-bottom: 1px solid #dee2e6;
    padding-bottom: 15px;
}
.filter-shortcuts {
    margin-bottom: 15px; /* 아래 섹션과 간격 */
}
.filter-shortcuts .btn {
    background-color: #e9ecef;
    border: none;
    border-radius: 15px;
    padding: 8px 15px;
    margin-right: 10px;
    font-size: 0.9em;
    cursor: pointer;
    transition: background-color 0.2s;
}
.filter-shortcuts .btn:hover {
    background-color: #d1d9e0;
}
.quick-search-box {
    position: relative;
    margin-bottom: 20px;
}
.quick-search-box input {
    width: 100%;
    padding: 12px 15px 12px 40px;
    border-radius: 6px;
    border: 1px solid #dee2e6;
    font-size: 1em;
    box-sizing: border-box;
}
.quick-search-box .fa-search {
    position: absolute;
    left: 15px;
    top: 14px;
    color: #7f8c8d;
}
.action-card-list a {
    display: flex;
    align-items: center;
    padding: 18px 15px;
    background-color: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 12px;
    text-decoration: none;
    color: #2c3e50;
    font-weight: 500;
    transition: all 0.2s ease;
}
.action-card-list a:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    background-color: #e7f1ff;
}
.action-card-list .icon {
    font-size: 1.2em;
    margin-right: 15px;
    width: 25px;
    text-align: center;
    color: #3498db;
}
.action-card-list .upload-icon {
    color: #e74c3c;
}
.section-divider {
    border: none;
    border-top: 1px solid #f1f1f1;
    margin: 30px 0;
}
</style>