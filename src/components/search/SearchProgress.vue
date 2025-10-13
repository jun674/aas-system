<template>
  <div v-if="visible" class="search-progress">
    <div class="progress-overlay"></div>
    <div class="progress-content">
      <div class="progress-spinner">
        <i class="fas fa-circle-notch fa-spin"></i>
      </div>
      <div class="progress-info">
        <h3>검색 중...</h3>
        <p>{{ message }}</p>
        <div v-if="showCancel" class="progress-actions">
          <button @click="$emit('cancel')" class="btn btn-secondary btn-sm">
            <i class="fas fa-times me-1"></i>
            취소
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchProgress',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: '데이터를 불러오는 중입니다...'
    },
    showCancel: {
      type: Boolean,
      default: true
    }
  },
  emits: ['cancel']
}
</script>

<style scoped>
.search-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.progress-content {
  position: relative;
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  text-align: center;
  min-width: 300px;
}

.progress-spinner {
  font-size: 3em;
  color: #0d6efd;
  margin-bottom: 20px;
}

.progress-info h3 {
  font-size: 20px;
  margin: 0 0 10px 0;
  color: #212529;
}

.progress-info p {
  font-size: 14px;
  color: #6c757d;
  margin: 0 0 20px 0;
}

.progress-actions {
  margin-top: 20px;
}

.btn-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
  border-color: #545b62;
}
</style>
