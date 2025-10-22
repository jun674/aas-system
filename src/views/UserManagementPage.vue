<template>
  <div class="user-management-page">
    <div class="management-container">
      <h1 class="page-title">회원 관리</h1>

      <div class="users-table-container">
        <table class="users-table">
          <thead>
            <tr>
              <th>사용자명</th>
              <th>이메일</th>
              <th>이름</th>
              <th>권한</th>
              <th>상태</th>
              <th>가입일</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.username }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.name || '-' }}</td>
              <td>
                <span class="role-badge" :class="user.role">
                  {{ user.role === 'ADMIN' ? '관리자' : '일반 사용자' }}
                </span>
              </td>
              <td>
                <span class="status-badge" :class="user.status">
                  {{ user.status === 'active' ? '활성' : '비활성' }}
                </span>
              </td>
              <td>{{ formatDate(user.createdAt) }}</td>
              <td>
                <button
                  @click="editUser(user)"
                  class="btn btn-sm btn-primary"
                >
                  수정
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 사용자 수정 모달 -->
      <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
        <div class="modal-content">
          <h2>사용자 정보 수정</h2>

          <form @submit.prevent="updateUser" class="edit-form">
            <div class="form-group">
              <label>사용자명</label>
              <input
                v-model="editingUser.username"
                type="text"
                disabled
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label>이메일</label>
              <input
                v-model="editingUser.email"
                type="email"
                required
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label>이름</label>
              <input
                v-model="editingUser.name"
                type="text"
                required
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label>권한</label>
              <select v-model="editingUser.role" class="form-input">
                <option value="USER">일반 사용자</option>
                <option value="ADMIN">관리자</option>
              </select>
            </div>

            <div class="form-group">
              <label>상태</label>
              <select v-model="editingUser.status" class="form-input">
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
              </select>
            </div>

            <div class="form-group">
              <label>새 비밀번호 (변경시에만 입력)</label>
              <input
                v-model="editingUser.newPassword"
                type="password"
                placeholder="비밀번호를 변경하려면 입력하세요"
                class="form-input"
              />
            </div>

            <div class="modal-actions">
              <button type="button" @click="closeEditModal" class="btn btn-secondary">
                취소
              </button>
              <button type="submit" class="btn btn-primary" :disabled="isLoading">
                {{ isLoading ? '저장 중...' : '저장' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div v-if="message" class="message" :class="messageType">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/services/authService'

const router = useRouter()
const authStore = useAuthStore()

const users = ref([])
const showEditModal = ref(false)
const editingUser = ref({})
const isLoading = ref(false)
const message = ref('')
const messageType = ref('')

onMounted(async () => {
  // 관리자 권한 확인
  if (authStore.userRole !== 'ADMIN') {
    router.push('/')
    return
  }

  await loadUsers()
})

const loadUsers = async () => {
  try {
    const response = await authService.getAllUsers()
    users.value = response.users || []
  } catch (err) {
    console.error('Failed to load users:', err)
    showMessage('사용자 목록을 불러오는데 실패했습니다.', 'error')
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR')
}

const showMessage = (msg, type = 'success') => {
  message.value = msg
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

const editUser = (user) => {
  editingUser.value = { ...user, newPassword: '' }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingUser.value = {}
}

const updateUser = async () => {
  isLoading.value = true
  try {
    const updateData = {
      id: editingUser.value.id,
      email: editingUser.value.email,
      name: editingUser.value.name,
      role: editingUser.value.role,
      status: editingUser.value.status
    }

    if (editingUser.value.newPassword) {
      updateData.password = editingUser.value.newPassword
    }

    await authService.updateUser(updateData)

    showMessage('사용자 정보가 성공적으로 수정되었습니다.')
    closeEditModal()
    await loadUsers()
  } catch (error) {
    showMessage(error.message || '사용자 정보 수정에 실패했습니다.', 'error')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.user-management-page {
  min-height: calc(100vh - 56px);
  padding: 24px;
  background-color: #f8fafc;
}

.management-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 32px;
}

.users-table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th {
  background-color: #f8fafc;
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #334155;
  border-bottom: 1px solid #e2e8f0;
}

.users-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
}

.users-table tbody tr:hover {
  background-color: #f8fafc;
}

.role-badge,
.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.role-badge.ADMIN {
  background-color: #fef3c7;
  color: #92400e;
}

.role-badge.USER {
  background-color: #dbeafe;
  color: #1e40af;
}

.status-badge.active {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.inactive {
  background-color: #fee2e2;
  color: #991b1b;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-sm {
  padding: 4px 10px;
  font-size: 12px;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: #e2e8f0;
  color: #334155;
}

.btn-secondary:hover {
  background-color: #cbd5e1;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 모달 스타일 */
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
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 20px;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.form-input {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 16px;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:disabled {
  background-color: #f8fafc;
  cursor: not-allowed;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.message {
  margin-top: 20px;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
}

.message.success {
  background-color: #d1fae5;
  color: #065f46;
}

.message.error {
  background-color: #fee2e2;
  color: #991b1b;
}

@media (max-width: 768px) {
  .user-management-page {
    padding: 16px;
  }

  .page-title {
    font-size: 24px;
    margin-bottom: 24px;
  }

  .users-table-container {
    overflow-x: auto;
  }

  .users-table {
    min-width: 600px;
  }

  .users-table th,
  .users-table td {
    padding: 8px 12px;
    font-size: 14px;
  }
}
</style>
