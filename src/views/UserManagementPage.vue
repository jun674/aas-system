<template>
  <div class="user-management-page">
    <div class="page-header">
      <h1>회원 관리</h1>
      <p>등록된 회원을 조회하고 관리할 수 있습니다.</p>
    </div>

    <!-- 검색 및 필터 섹션 -->
    <div class="search-section">
      <div class="search-bar">
        <div class="search-input-group">
          <i class="fas fa-search"></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="이름, 아이디, 이메일로 검색"
            @input="handleSearch"
          />
        </div>

        <div class="filter-group">
          <select v-model="filterDepartment" @change="applyFilters" class="filter-select">
            <option value="">전체 부서</option>
            <option value="engineering">엔지니어링팀</option>
            <option value="production">생산팀</option>
            <option value="quality">품질관리팀</option>
            <option value="maintenance">유지보수팀</option>
            <option value="admin">관리팀</option>
          </select>

          <select v-model="filterStatus" @change="applyFilters" class="filter-select">
            <option value="">전체 상태</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
            <option value="pending">승인대기</option>
          </select>

          <button class="btn btn-primary" @click="showAddUserModal">
            <i class="fas fa-plus"></i> 회원 추가
          </button>
        </div>
      </div>
    </div>

    <!-- 통계 카드 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon blue">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-content">
          <h3>전체 회원</h3>
          <p class="stat-number">{{ stats.total }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon green">
          <i class="fas fa-user-check"></i>
        </div>
        <div class="stat-content">
          <h3>활성 회원</h3>
          <p class="stat-number">{{ stats.active }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon orange">
          <i class="fas fa-user-clock"></i>
        </div>
        <div class="stat-content">
          <h3>승인 대기</h3>
          <p class="stat-number">{{ stats.pending }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon red">
          <i class="fas fa-user-times"></i>
        </div>
        <div class="stat-content">
          <h3>비활성 회원</h3>
          <p class="stat-number">{{ stats.inactive }}</p>
        </div>
      </div>
    </div>

    <!-- 회원 목록 테이블 -->
    <div class="table-container">
      <table class="user-table">
        <thead>
          <tr>
            <th>
              <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" />
            </th>
            <th @click="sortBy('userId')" class="sortable">
              아이디
              <i class="fas fa-sort" v-if="sortField !== 'userId'"></i>
              <i class="fas fa-sort-up" v-else-if="sortOrder === 'asc'"></i>
              <i class="fas fa-sort-down" v-else></i>
            </th>
            <th @click="sortBy('name')" class="sortable">
              이름
              <i class="fas fa-sort" v-if="sortField !== 'name'"></i>
              <i class="fas fa-sort-up" v-else-if="sortOrder === 'asc'"></i>
              <i class="fas fa-sort-down" v-else></i>
            </th>
            <th>이메일</th>
            <th>부서</th>
            <th>직급</th>
            <th @click="sortBy('joinDate')" class="sortable">
              가입일
              <i class="fas fa-sort" v-if="sortField !== 'joinDate'"></i>
              <i class="fas fa-sort-up" v-else-if="sortOrder === 'asc'"></i>
              <i class="fas fa-sort-down" v-else></i>
            </th>
            <th>상태</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="user in paginatedUsers"
            :key="user.id"
            :class="{ selected: selectedUsers.includes(user.id) }"
          >
            <td>
              <input type="checkbox" :value="user.id" v-model="selectedUsers" />
            </td>
            <td>{{ user.userId }}</td>
            <td>
              <div class="user-info">
                <div class="user-avatar">
                  {{ user.name.charAt(0) }}
                </div>
                <span>{{ user.name }}</span>
              </div>
            </td>
            <td>{{ user.email }}</td>
            <td>{{ getDepartmentName(user.department) }}</td>
            <td>{{ getPositionName(user.position) }}</td>
            <td>{{ formatDate(user.joinDate) }}</td>
            <td>
              <span :class="['status-badge', `status-${user.status}`]">
                {{ getStatusName(user.status) }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button class="action-btn" @click="viewUser(user)" title="상세보기">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn" @click="editUser(user)" title="수정">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn danger" @click="deleteUser(user)" title="삭제">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 데이터가 없을 때 -->
      <div v-if="filteredUsers.length === 0" class="no-data">
        <i class="fas fa-users-slash"></i>
        <p>검색 결과가 없습니다.</p>
      </div>
    </div>

    <!-- 페이지네이션 -->
    <div class="pagination" v-if="totalPages > 1">
      <button class="page-btn" @click="currentPage = 1" :disabled="currentPage === 1">
        <i class="fas fa-angle-double-left"></i>
      </button>
      <button class="page-btn" @click="currentPage--" :disabled="currentPage === 1">
        <i class="fas fa-angle-left"></i>
      </button>

      <button
        v-for="page in visiblePages"
        :key="page"
        class="page-btn"
        :class="{ active: page === currentPage }"
        @click="currentPage = page"
      >
        {{ page }}
      </button>

      <button class="page-btn" @click="currentPage++" :disabled="currentPage === totalPages">
        <i class="fas fa-angle-right"></i>
      </button>
      <button
        class="page-btn"
        @click="currentPage = totalPages"
        :disabled="currentPage === totalPages"
      >
        <i class="fas fa-angle-double-right"></i>
      </button>
    </div>

    <!-- 선택된 항목 작업 바 -->
    <transition name="slide-up">
      <div v-if="selectedUsers.length > 0" class="bulk-actions">
        <div class="bulk-info">
          <span>{{ selectedUsers.length }}개 항목 선택됨</span>
        </div>
        <div class="bulk-buttons">
          <button class="btn btn-outline" @click="bulkChangeStatus('active')">
            <i class="fas fa-check"></i> 활성화
          </button>
          <button class="btn btn-outline" @click="bulkChangeStatus('inactive')">
            <i class="fas fa-ban"></i> 비활성화
          </button>
          <button class="btn btn-outline danger" @click="bulkDelete">
            <i class="fas fa-trash"></i> 삭제
          </button>
        </div>
      </div>
    </transition>

    <!-- 사용자 상세 모달 -->
    <Teleport to="body">
      <transition name="modal">
        <div v-if="showUserModal" class="modal-overlay" @click="closeUserModal">
          <div class="modal-container" @click.stop>
            <div class="modal-header">
              <h3>
                {{
                  modalMode === 'view'
                    ? '회원 상세 정보'
                    : modalMode === 'edit'
                      ? '회원 정보 수정'
                      : '새 회원 추가'
                }}
              </h3>
              <button class="modal-close" @click="closeUserModal">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div class="modal-body">
              <div class="user-detail-header" v-if="modalMode === 'view'">
                <div class="user-avatar large">
                  {{ selectedUser.name.charAt(0) }}
                </div>
                <div class="user-detail-info">
                  <h2>{{ selectedUser.name }}</h2>
                  <p>{{ selectedUser.userId }}</p>
                  <span :class="['status-badge', `status-${selectedUser.status}`]">
                    {{ getStatusName(selectedUser.status) }}
                  </span>
                </div>
              </div>

              <form v-if="modalMode !== 'view'" @submit.prevent="saveUser" class="user-form">
                <div class="form-group">
                  <label>아이디</label>
                  <input
                    v-model="editingUser.userId"
                    type="text"
                    class="form-control"
                    :disabled="modalMode === 'edit'"
                    required
                  />
                </div>

                <div class="form-group">
                  <label>이름</label>
                  <input v-model="editingUser.name" type="text" class="form-control" required />
                </div>

                <div class="form-group">
                  <label>이메일</label>
                  <input v-model="editingUser.email" type="email" class="form-control" required />
                </div>

                <div class="form-group">
                  <label>전화번호</label>
                  <input v-model="editingUser.phone" type="tel" class="form-control" />
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>부서</label>
                    <select v-model="editingUser.department" class="form-control">
                      <option value="">선택하세요</option>
                      <option value="engineering">엔지니어링팀</option>
                      <option value="production">생산팀</option>
                      <option value="quality">품질관리팀</option>
                      <option value="maintenance">유지보수팀</option>
                      <option value="admin">관리팀</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label>직급</label>
                    <select v-model="editingUser.position" class="form-control">
                      <option value="">선택하세요</option>
                      <option value="staff">사원</option>
                      <option value="senior">주임</option>
                      <option value="assistant">대리</option>
                      <option value="manager">과장</option>
                      <option value="deputy">차장</option>
                      <option value="general">부장</option>
                    </select>
                  </div>
                </div>

                <div class="form-group">
                  <label>상태</label>
                  <select v-model="editingUser.status" class="form-control">
                    <option value="active">활성</option>
                    <option value="inactive">비활성</option>
                    <option value="pending">승인대기</option>
                  </select>
                </div>
              </form>

              <div v-if="modalMode === 'view'" class="user-details">
                <div class="detail-section">
                  <h4>기본 정보</h4>
                  <div class="detail-grid">
                    <div class="detail-item">
                      <label>이메일</label>
                      <p>{{ selectedUser.email }}</p>
                    </div>
                    <div class="detail-item">
                      <label>전화번호</label>
                      <p>{{ selectedUser.phone || '-' }}</p>
                    </div>
                    <div class="detail-item">
                      <label>부서</label>
                      <p>{{ getDepartmentName(selectedUser.department) }}</p>
                    </div>
                    <div class="detail-item">
                      <label>직급</label>
                      <p>{{ getPositionName(selectedUser.position) }}</p>
                    </div>
                  </div>
                </div>

                <div class="detail-section">
                  <h4>활동 정보</h4>
                  <div class="detail-grid">
                    <div class="detail-item">
                      <label>가입일</label>
                      <p>{{ formatDate(selectedUser.joinDate) }}</p>
                    </div>
                    <div class="detail-item">
                      <label>마지막 로그인</label>
                      <p>{{ formatDate(selectedUser.lastLogin) || '-' }}</p>
                    </div>
                    <div class="detail-item">
                      <label>로그인 횟수</label>
                      <p>{{ selectedUser.loginCount || 0 }}회</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button
                v-if="modalMode === 'view'"
                class="btn btn-primary"
                @click="editUser(selectedUser)"
              >
                <i class="fas fa-edit"></i> 수정
              </button>
              <button
                v-if="modalMode !== 'view'"
                type="submit"
                class="btn btn-primary"
                @click="saveUser"
              >
                <i class="fas fa-save"></i> 저장
              </button>
              <button class="btn btn-secondary" @click="closeUserModal">닫기</button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

// 상태 관리
const searchQuery = ref('')
const filterDepartment = ref('')
const filterStatus = ref('')
const sortField = ref('joinDate')
const sortOrder = ref('desc')
const currentPage = ref(1)
const itemsPerPage = 10
const selectedUsers = ref([])
const selectAll = ref(false)

// 모달 관련
const showUserModal = ref(false)
const modalMode = ref('view') // view, edit, add
const selectedUser = ref(null)
const editingUser = ref({})

// 통계 데이터
const stats = reactive({
  total: 0,
  active: 0,
  pending: 0,
  inactive: 0,
})

// 더미 사용자 데이터
const users = ref([
  {
    id: 1,
    userId: 'admin',
    name: '관리자',
    email: 'admin@company.com',
    phone: '010-1234-5678',
    department: 'admin',
    position: 'general',
    joinDate: new Date('2023-01-01'),
    lastLogin: new Date('2024-01-10'),
    loginCount: 245,
    status: 'active',
  },
  {
    id: 2,
    userId: 'john.doe',
    name: '김철수',
    email: 'john.doe@company.com',
    phone: '010-2345-6789',
    department: 'engineering',
    position: 'manager',
    joinDate: new Date('2023-03-15'),
    lastLogin: new Date('2024-01-09'),
    loginCount: 156,
    status: 'active',
  },
  {
    id: 3,
    userId: 'jane.smith',
    name: '이영희',
    email: 'jane.smith@company.com',
    phone: '010-3456-7890',
    department: 'production',
    position: 'assistant',
    joinDate: new Date('2023-05-20'),
    lastLogin: new Date('2024-01-08'),
    loginCount: 89,
    status: 'active',
  },
  {
    id: 4,
    userId: 'mike.wilson',
    name: '박민수',
    email: 'mike.wilson@company.com',
    phone: '010-4567-8901',
    department: 'quality',
    position: 'senior',
    joinDate: new Date('2023-07-10'),
    lastLogin: null,
    loginCount: 0,
    status: 'pending',
  },
  {
    id: 5,
    userId: 'sarah.jones',
    name: '최지은',
    email: 'sarah.jones@company.com',
    phone: '010-5678-9012',
    department: 'maintenance',
    position: 'staff',
    joinDate: new Date('2023-09-01'),
    lastLogin: new Date('2023-12-15'),
    loginCount: 34,
    status: 'inactive',
  },
])

// 필터링된 사용자 목록
const filteredUsers = computed(() => {
  let result = [...users.value]

  // 검색어 필터
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.userId.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query),
    )
  }

  // 부서 필터
  if (filterDepartment.value) {
    result = result.filter((user) => user.department === filterDepartment.value)
  }

  // 상태 필터
  if (filterStatus.value) {
    result = result.filter((user) => user.status === filterStatus.value)
  }

  // 정렬
  result.sort((a, b) => {
    const aVal = a[sortField.value]
    const bVal = b[sortField.value]

    if (sortOrder.value === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  return result
})

// 페이지네이션
const totalPages = computed(() => Math.ceil(filteredUsers.value.length / itemsPerPage))
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredUsers.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    }
  }

  return pages
})

// 메서드
const handleSearch = () => {
  currentPage.value = 1
}

const applyFilters = () => {
  currentPage.value = 1
}

const sortBy = (field) => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortOrder.value = 'asc'
  }
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedUsers.value = paginatedUsers.value.map((user) => user.id)
  } else {
    selectedUsers.value = []
  }
}

const getDepartmentName = (dept) => {
  const departments = {
    engineering: '엔지니어링팀',
    production: '생산팀',
    quality: '품질관리팀',
    maintenance: '유지보수팀',
    admin: '관리팀',
  }
  return departments[dept] || '-'
}

const getPositionName = (pos) => {
  const positions = {
    staff: '사원',
    senior: '주임',
    assistant: '대리',
    manager: '과장',
    deputy: '차장',
    general: '부장',
  }
  return positions[pos] || '-'
}

const getStatusName = (status) => {
  const statuses = {
    active: '활성',
    inactive: '비활성',
    pending: '승인대기',
  }
  return statuses[status] || '-'
}

const formatDate = (date) => {
  if (!date) return null
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 모달 관련 메서드
const viewUser = (user) => {
  selectedUser.value = user
  modalMode.value = 'view'
  showUserModal.value = true
}

const editUser = (user) => {
  selectedUser.value = user
  editingUser.value = { ...user }
  modalMode.value = 'edit'
  showUserModal.value = true
}

const showAddUserModal = () => {
  editingUser.value = {
    userId: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    status: 'pending',
  }
  modalMode.value = 'add'
  showUserModal.value = true
}

const closeUserModal = () => {
  showUserModal.value = false
  selectedUser.value = null
  editingUser.value = {}
}

const saveUser = () => {
  if (modalMode.value === 'add') {
    const newUser = {
      ...editingUser.value,
      id: Date.now(),
      joinDate: new Date(),
      lastLogin: null,
      loginCount: 0,
    }
    users.value.push(newUser)
    alert('새 회원이 추가되었습니다.')
  } else if (modalMode.value === 'edit') {
    const index = users.value.findIndex((u) => u.id === editingUser.value.id)
    if (index !== -1) {
      users.value[index] = { ...editingUser.value }
      alert('회원 정보가 수정되었습니다.')
    }
  }
  closeUserModal()
  updateStats()
}

const deleteUser = (user) => {
  if (confirm(`${user.name}님을 삭제하시겠습니까?`)) {
    users.value = users.value.filter((u) => u.id !== user.id)
    alert('회원이 삭제되었습니다.')
    updateStats()
  }
}

const bulkChangeStatus = (status) => {
  users.value.forEach((user) => {
    if (selectedUsers.value.includes(user.id)) {
      user.status = status
    }
  })
  selectedUsers.value = []
  selectAll.value = false
  alert(`선택한 회원의 상태가 변경되었습니다.`)
  updateStats()
}

const bulkDelete = () => {
  if (confirm(`선택한 ${selectedUsers.value.length}명의 회원을 삭제하시겠습니까?`)) {
    users.value = users.value.filter((user) => !selectedUsers.value.includes(user.id))
    selectedUsers.value = []
    selectAll.value = false
    alert('선택한 회원이 삭제되었습니다.')
    updateStats()
  }
}

const updateStats = () => {
  stats.total = users.value.length
  stats.active = users.value.filter((u) => u.status === 'active').length
  stats.pending = users.value.filter((u) => u.status === 'pending').length
  stats.inactive = users.value.filter((u) => u.status === 'inactive').length
}

// 초기화
onMounted(() => {
  updateStats()
})
</script>

<style scoped>
.user-management-page {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #212529;
  margin-bottom: 8px;
}

.page-header p {
  color: #6c757d;
  font-size: 16px;
}

/* 검색 섹션 */
.search-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-bar {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input-group {
  flex: 1;
  min-width: 300px;
  position: relative;
}

.search-input-group i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.search-input-group input {
  width: 100%;
  padding: 10px 15px 10px 40px;
  border: 1px solid #ced4da;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.2s;
}

.search-input-group input:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.filter-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.filter-select {
  padding: 10px 15px;
  border: 1px solid #ced4da;
  border-radius: 8px;
  font-size: 15px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-select:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

/* 통계 카드 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-icon.blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.green {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.stat-icon.orange {
  background: linear-gradient(135deg, #f2994a 0%, #f2c94c 100%);
}

.stat-icon.red {
  background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
}

.stat-content h3 {
  font-size: 14px;
  color: #6c757d;
  margin: 0 0 4px 0;
  font-weight: 500;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #212529;
  margin: 0;
}

/* 테이블 */
.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
}

.user-table th {
  background-color: #f8f9fa;
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  font-size: 14px;
  border-bottom: 2px solid #dee2e6;
}

.user-table th.sortable {
  cursor: pointer;
  user-select: none;
}

.user-table th.sortable:hover {
  background-color: #e9ecef;
}

.user-table th i {
  margin-left: 5px;
  font-size: 12px;
  color: #6c757d;
}

.user-table td {
  padding: 15px;
  border-bottom: 1px solid #dee2e6;
}

.user-table tr:hover {
  background-color: #f8f9fa;
}

.user-table tr.selected {
  background-color: #e7f3ff;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.user-avatar.large {
  width: 80px;
  height: 80px;
  font-size: 32px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  display: inline-block;
}

.status-active {
  background-color: #d4edda;
  color: #155724;
}

.status-inactive {
  background-color: #f8d7da;
  color: #721c24;
}

.status-pending {
  background-color: #fff3cd;
  color: #856404;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f8f9fa;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #495057;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #e9ecef;
  color: #212529;
}

.action-btn.danger:hover {
  background: #f8d7da;
  color: #721c24;
}

/* 데이터 없음 */
.no-data {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.no-data i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-data p {
  font-size: 16px;
  margin: 0;
}

/* 페이지네이션 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
}

.page-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 12px;
  border: 1px solid #dee2e6;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #495057;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-btn:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #adb5bd;
}

.page-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 일괄 작업 바 */
.bulk-actions {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  z-index: 1000;
}

.bulk-info {
  font-weight: 500;
  color: #495057;
}

.bulk-buttons {
  display: flex;
  gap: 12px;
}

/* 버튼 스타일 */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #5a67d8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #5c636a;
}

.btn-outline {
  background: white;
  border: 1px solid #dee2e6;
  color: #495057;
}

.btn-outline:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #adb5bd;
}

.btn-outline.danger {
  color: #dc3545;
  border-color: #dc3545;
}

.btn-outline.danger:hover:not(:disabled) {
  background: #f8d7da;
  color: #721c24;
}

/* 모달 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #212529;
}

.modal-close {
  background: none;
  border: none;
  font-size: 20px;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  transition: all 0.2s;
}

.modal-close:hover {
  background-color: #f8f9fa;
  color: #495057;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e9ecef;
  justify-content: flex-end;
}

/* 사용자 상세 */
.user-detail-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e9ecef;
}

.user-detail-info h2 {
  margin: 0 0 4px 0;
  font-size: 24px;
  color: #212529;
}

.user-detail-info p {
  margin: 0 0 8px 0;
  color: #6c757d;
  font-size: 16px;
}

/* 폼 스타일 */
.user-form .form-group {
  margin-bottom: 20px;
}

.user-form label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #495057;
  font-size: 14px;
}

.form-control {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 15px;
  transition: all 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-control:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* 상세 정보 */
.detail-section {
  margin-bottom: 30px;
}

.detail-section h4 {
  font-size: 16px;
  font-weight: 600;
  color: #212529;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e9ecef;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.detail-item label {
  display: block;
  font-size: 13px;
  color: #6c757d;
  margin-bottom: 4px;
}

.detail-item p {
  margin: 0;
  font-size: 15px;
  color: #212529;
}

/* 애니메이션 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from {
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100px);
  opacity: 0;
}

/* 반응형 */
@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
  }

  .search-input-group {
    min-width: 100%;
  }

  .filter-group {
    width: 100%;
    flex-wrap: wrap;
  }

  .stats-cards {
    grid-template-columns: 1fr 1fr;
  }

  .user-table {
    font-size: 14px;
  }

  .user-table th,
  .user-table td {
    padding: 10px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .bulk-actions {
    flex-direction: column;
    width: calc(100% - 40px);
    left: 20px;
    transform: none;
  }

  .bulk-buttons {
    width: 100%;
    flex-direction: column;
  }

  .bulk-buttons .btn {
    width: 100%;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }

  .modal-container {
    max-width: 100%;
  }
}
</style>
