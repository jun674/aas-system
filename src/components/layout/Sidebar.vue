<template>
  <div class="sidebar">
    <div class="sidebar-header">
      AAS System
    </div>
   
    <nav class="nav flex-column">
      <a
        class="nav-link d-flex align-items-center"
        href="#"
        data-bs-toggle="collapse"
        data-bs-target="#equipmentSubmenu"
        aria-expanded="true"
      >
        <span>
          <i class="fas fa-cogs"></i>
          Equipment
        </span>
        <i class="fas fa-chevron-down ms-auto"></i> </a>
      
      <div class="collapse show" id="equipmentSubmenu">
        <nav class="nav flex-column">
          <a
            class="nav-link d-flex align-items-center ps-4"
            href="#"
            data-bs-toggle="collapse"
            data-bs-target="#weldingSubmenu"
            aria-expanded="true"
          >
            <span>
              <i class="fas fa-fire"></i> Welding
            </span>
            <i class="fas fa-chevron-down ms-auto"></i> </a>
          <div class="collapse show" id="weldingSubmenu">
            <nav class="nav flex-column">
              <a class="nav-link ps-5" :class="{ active: activeMenu === 'CO2' }" href="#" @click.prevent="selectMenu('CO2')">
                <i class="fas fa-circle"></i> CO2
                <span v-if="menuCounts.CO2 !== undefined" class="menu-count">({{ menuCounts.CO2 }})</span>
              </a>
              <a class="nav-link ps-5" :class="{ active: activeMenu === 'EBW' }" href="#" @click.prevent="selectMenu('EBW')">
                <i class="fas fa-circle"></i> EBW
                <span v-if="menuCounts.EBW !== undefined" class="menu-count">({{ menuCounts.EBW }})</span>
              </a>
              <a class="nav-link ps-5" :class="{ active: activeMenu === 'FW' }" href="#" @click.prevent="selectMenu('FW')">
                <i class="fas fa-circle"></i> FW
                <span v-if="menuCounts.FW !== undefined" class="menu-count">({{ menuCounts.FW }})</span>
              </a>
              <a class="nav-link ps-5" :class="{ active: activeMenu === 'MAG' }" href="#" @click.prevent="selectMenu('MAG')">
                <i class="fas fa-circle"></i> MAG
                <span v-if="menuCounts.MAG !== undefined" class="menu-count">({{ menuCounts.MAG }})</span>
              </a>
              <a class="nav-link ps-5" :class="{ active: activeMenu === 'MIG' }" href="#" @click.prevent="selectMenu('MIG')">
                <i class="fas fa-circle"></i> MIG
                <span v-if="menuCounts.MIG !== undefined" class="menu-count">({{ menuCounts.MIG }})</span>
              </a>
              <a class="nav-link ps-5" :class="{ active: activeMenu === 'OAW' }" href="#" @click.prevent="selectMenu('OAW')">
                <i class="fas fa-circle"></i> OAW
                <span v-if="menuCounts.OAW !== undefined" class="menu-count">({{ menuCounts.OAW }})</span>
              </a>
              <a class="nav-link ps-5" :class="{ active: activeMenu === 'PW' }" href="#" @click.prevent="selectMenu('PW')">
                <i class="fas fa-circle"></i> PW
                <span v-if="menuCounts.PW !== undefined" class="menu-count">({{ menuCounts.PW }})</span>
              </a>
              <a class="nav-link ps-5" :class="{ active: activeMenu === 'RSEW' }" href="#" @click.prevent="selectMenu('RSEW')">
                <i class="fas fa-circle"></i> RSEW
                <span v-if="menuCounts.RSEW !== undefined" class="menu-count">({{ menuCounts.RSEW }})</span>
              </a>
              <a class="nav-link ps-5" :class="{ active: activeMenu === 'RSW' }" href="#" @click.prevent="selectMenu('RSW')">
                <i class="fas fa-circle"></i> RSW
                <span v-if="menuCounts.RSW !== undefined" class="menu-count">({{ menuCounts.RSW }})</span>
              </a>
              <a class="nav-link ps-5" :class="{ active: activeMenu === 'SAW' }" href="#" @click.prevent="selectMenu('SAW')">
                <i class="fas fa-circle"></i> SAW
                <span v-if="menuCounts.SAW !== undefined" class="menu-count">({{ menuCounts.SAW }})</span>
              </a>
              <a class="nav-link ps-5" :class="{ active: activeMenu === 'SMAW' }" href="#" @click.prevent="selectMenu('SMAW')">
                <i class="fas fa-circle"></i> SMAW
                <span v-if="menuCounts.SMAW !== undefined" class="menu-count">({{ menuCounts.SMAW }})</span>
              </a>
              <a class="nav-link ps-5" :class="{ active: activeMenu === 'Sold' }" href="#" @click.prevent="selectMenu('Sold')">
                <i class="fas fa-circle"></i> Sold
                <span v-if="menuCounts.Sold !== undefined" class="menu-count">({{ menuCounts.Sold }})</span>
              </a>
              <a class="nav-link ps-5" :class="{ active: activeMenu === 'SW' }" href="#" @click.prevent="selectMenu('SW')">
                <i class="fas fa-circle"></i> SW
                <span v-if="menuCounts.SW !== undefined" class="menu-count">({{ menuCounts.SW }})</span>
              </a>
              <a class="nav-link ps-5" :class="{ active: activeMenu === 'TIG' }" href="#" @click.prevent="selectMenu('TIG')">
                <i class="fas fa-circle"></i> TIG
                <span v-if="menuCounts.TIG !== undefined" class="menu-count">({{ menuCounts.TIG }})</span>
              </a>
              <a class="nav-link ps-5" :class="{ active: activeMenu === 'UW' }" href="#" @click.prevent="selectMenu('UW')">
                <i class="fas fa-circle"></i> UW
                <span v-if="menuCounts.UW !== undefined" class="menu-count">({{ menuCounts.UW }})</span>
              </a>
            </nav>
          </div>
        </nav>
      </div>

      <a
        class="nav-link d-flex align-items-center"
        href="#"
        data-bs-toggle="collapse"
        data-bs-target="#materialSubmenu"
        aria-expanded="false"
      >
        <span>
          <i class="fas fa-cube"></i>
          Material
        </span>
        <i class="fas fa-chevron-down ms-auto"></i>
      </a>
      
      <div class="collapse" id="materialSubmenu">
        <nav class="nav flex-column">
          <a
            class="nav-link ps-4"
            :class="{ active: activeMenu === 'Steel' }"
            href="#"
            @click.prevent="selectMenu('Steel')"
          >
            <i class="fas fa-circle"></i>
            Steel
            <span v-if="menuCounts.Steel !== undefined" class="menu-count">
              ({{ menuCounts.Steel }})
            </span>
          </a>
          <a
            class="nav-link ps-4"
            :class="{ active: activeMenu === 'Aluminum' }"
            href="#"
            @click.prevent="selectMenu('Aluminum')"
          >
            <i class="fas fa-circle"></i>
            Aluminum
            <span v-if="menuCounts.Aluminum !== undefined" class="menu-count">
              ({{ menuCounts.Aluminum }})
            </span>
          </a>
          <a
            class="nav-link ps-4"
            :class="{ active: activeMenu === 'Stainless Steel' }"
            href="#"
            @click.prevent="selectMenu('Stainless Steel')"
          >
            <i class="fas fa-circle"></i>
            Stainless Steel
            <span v-if="menuCounts['Stainless Steel'] !== undefined" class="menu-count">
              ({{ menuCounts['Stainless Steel'] }})
            </span>
          </a>
        </nav>
      </div>

      <a
        class="nav-link d-flex align-items-center"
        href="#"
        data-bs-toggle="collapse"
        data-bs-target="#processSubmenu"
        aria-expanded="false"
      >
        <span>
          <i class="fas fa-sync-alt"></i>
          Process
        </span>
        <i class="fas fa-chevron-down ms-auto"></i>
      </a>
      
      <div class="collapse" id="processSubmenu">
        <nav class="nav flex-column">
          <a
            class="nav-link ps-4"
            :class="{ active: activeMenu === 'Welding' }"
            href="#"
            @click.prevent="selectMenu('Welding')"
          >
            <i class="fas fa-circle"></i>
            Welding
            <span v-if="menuCounts.Welding !== undefined" class="menu-count">
              ({{ menuCounts.Welding }})
            </span>
          </a>
          <a
            class="nav-link ps-4"
            :class="{ active: activeMenu === 'Cutting' }"
            href="#"
            @click.prevent="selectMenu('Cutting')"
          >
            <i class="fas fa-circle"></i>
            Cutting
            <span v-if="menuCounts.Cutting !== undefined" class="menu-count">
              ({{ menuCounts.Cutting }})
            </span>
          </a>
          <a
            class="nav-link ps-4"
            :class="{ active: activeMenu === 'Brazing' }"
            href="#"
            @click.prevent="selectMenu('Brazing')"
          >
            <i class="fas fa-circle"></i>
            Brazing
            <span v-if="menuCounts.Brazing !== undefined" class="menu-count">
              ({{ menuCounts.Brazing }})
            </span>
          </a>
        </nav>
      </div>

      <a
        class="nav-link d-flex align-items-center"
        :class="{ active: activeMenu === 'Operation' }"
        href="#"
        @click.prevent="selectMenu('Operation')"
      >
        <span>
          <i class="fas fa-tachometer-alt"></i>
          Operation
        </span>
        <span v-if="menuCounts.Operation !== undefined" class="menu-count ms-auto">
          ({{ menuCounts.Operation }})
        </span>
      </a>

      <a
        class="nav-link d-flex align-items-center"
        :class="{ active: activeMenu === 'Quality' }"
        href="#"
        @click.prevent="selectMenu('Quality')"
      >
        <span>
          <i class="fas fa-check-circle"></i>
          Quality
        </span>
        <span v-if="menuCounts.Quality !== undefined" class="menu-count ms-auto">
          ({{ menuCounts.Quality }})
        </span>
      </a>

      <a
        class="nav-link d-flex align-items-center"
        :class="{ active: activeMenu === 'Production' }"
        href="#"
        @click.prevent="selectMenu('Production')"
      >
        <span>
          <i class="fas fa-industry"></i>
          Production
        </span>
        <span v-if="menuCounts.Production !== undefined" class="menu-count ms-auto">
          ({{ menuCounts.Production }})
        </span>
      </a>

      <hr class="sidebar-divider">

      <a
        class="nav-link all-view-menu d-flex align-items-center"
        :class="{ active: activeMenu === 'ALL' }"
        href="#"
        @click.prevent="selectMenu('ALL')"
      >
        <span>
          <i class="fas fa-globe"></i>
          All AAS Data
        </span>
        <span v-if="menuCounts.ALL !== undefined" class="menu-count ms-auto">
          ({{ menuCounts.ALL }})
        </span>
      </a>

      <hr class="sidebar-divider">

      <a
        class="nav-link aasx-menu d-flex align-items-center"
        :class="{ active: activeMenu === 'AASX' }"
        href="#"
        @click.prevent="selectMenu('AASX')"
      >
        <span>
          <i class="fas fa-exchange-alt"></i>
          AASX File upload
        </span>
      </a>
    </nav>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'Sidebar',
  props: {
    menuCounts: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['menu-selected'],
  setup(props, { emit }) {
    const activeMenu = ref('TIG') // 기본값을 TIG로 설정

    const selectMenu = (menuName) => {
      activeMenu.value = menuName
      emit('menu-selected', menuName)
      console.log('>> 선택된 메뉴:', menuName)
    }

    return {
      activeMenu,
      selectMenu
    }
  }
}
</script>

<style scoped>
.sidebar {
  background: linear-gradient(180deg, #34495e 0%, #2c3e50 100%);
  min-height: 100vh;
  width: 210px;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  overflow-y: auto;
  border-right: 1px solid #1a252f;
}

.sidebar-header {
  background-color: #1a252f;
  color: white;
  padding: 15px;
  font-weight: bold;
  border-bottom: 1px solid #34495e;
}

.sidebar .nav-link {
  color: #bdc3c7;
  padding: 8px 15px;
  border: none;
  text-decoration: none;
  display: flex;
  align-items: center;
  /* justify-content: space-between; 제거하여 왼쪽 정렬 기본 */
  font-size: 13px;
  transition: all 0.2s;
  border-radius: 0;
}

.sidebar .nav-link:hover {
  background-color: rgba(52, 73, 94, 0.8);
  color: white;
}

.sidebar .nav-link.active {
  background-color: #3498db;
  color: white;
}

.sidebar .nav-link i {
  margin-right: 8px;
  width: 16px;
  text-align: center;
}

.sidebar .collapse .nav-link {
  padding-left: 35px; /* 기본 들여쓰기 */
  font-size: 12px;
  background-color: rgba(44, 62, 80, 0.7);
}

/* Equipment > Welding 하위 메뉴 들여쓰기 조정 */
.sidebar .collapse #weldingSubmenu .nav-link {
  padding-left: 50px; /* 더 깊은 들여쓰기 */
}

.sidebar .collapse .nav-link.active {
  background-color: #2980b9;
}

.fa-chevron-down {
  transition: transform 0.2s;
  font-size: 10px;
}

.collapsed .fa-chevron-down {
  transform: rotate(-90deg);
}

/* 메뉴 카운트 스타일 */
.menu-count {
  font-size: 10px;
  color: #95a5a6;
  margin-left: auto; /* 항상 오른쪽으로 정렬 */
  font-weight: normal;
}

.nav-link.active .menu-count {
  color: #ecf0f1;
  font-weight: bold;
}

/* 전체 보기 메뉴 강조 */
.all-view-menu {
  background-color: rgba(39, 174, 96, 0.1) !important;
  border-left: 3px solid #27ae60;
}

.all-view-menu:hover {
  background-color: rgba(39, 174, 96, 0.2) !important;
}

.all-view-menu.active {
  background-color: #27ae60 !important;
  color: white !important;
}

/* 구분선 */
.sidebar-divider {
  border: none;
  height: 1px;
  background-color: rgba(189, 195, 199, 0.3);
  margin: 10px 15px;
}

/* AASX 변환 메뉴 스타일 */
.aasx-menu {
  background-color: rgba(231, 76, 60, 0.1) !important;
  border-left: 3px solid #e74c3c;
}

.aasx-menu:hover {
  background-color: rgba(231, 76, 60, 0.2) !important;
}

.aasx-menu.active {
  background-color: #e74c3c !important;
  color: white !important;
}
.sidebar::-webkit-scrollbar {
  width: 8px;
}

.sidebar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(189, 195, 199, 0.3);
  border-radius: 4px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(189, 195, 199, 0.5);
}
</style>