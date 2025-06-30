<template>
  <div class="aasx-upload-container">
    <div class="upload-section">
      <h5 class="mb-4">AASX File Upload</h5>
      
      <div 
        class="upload-area"
        :class="{ 'drag-over': isDragging }"
        @dragover.prevent="onDragOver"
        @dragleave.prevent="onDragLeave"
        @drop.prevent="onDrop"
      >
        <i class="fas fa-cloud-upload-alt fa-3x mb-3"></i>
        <h6>Drag and drop AASX files here or click to select</h6>
        <p class="text-muted small">No file limit - Batch processing supported</p>
        
        <input 
          type="file" 
          ref="fileInput" 
          @change="handleFileSelect" 
          accept=".aasx" 
          multiple
          style="display: none;"
        >
        
        <input 
          type="file" 
          ref="folderInput" 
          @change="handleFolderSelect" 
          webkitdirectory
          directory
          multiple
          style="display: none;"
        >
        
        <div class="d-flex gap-2 justify-content-center mt-3">
          <button 
            class="btn btn-primary"
            @click="$refs.fileInput.click()"
            :disabled="uploading"
          >
            <i class="fas fa-file me-2"></i>
            Select Files
          </button>
          
          <button 
            class="btn btn-primary"
            @click="$refs.folderInput.click()"
            :disabled="uploading"
          >
            <i class="fas fa-folder-open me-2"></i>
            Select Folder
          </button>
        </div>
      </div>

      <div v-if="selectedFiles.length > 0" class="file-stats mt-4">
        <div class="row">
          <div class="col-md-3">
            <div class="stat-card">
              <h6>Total Files</h6>
              <h3>{{ selectedFiles.length }}</h3>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card">
              <h6>Total Size</h6>
              <h3>{{ formatFileSize(totalSize) }}</h3>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card">
              <h6>Upload Completed</h6>
              <h3>{{ uploadedCount }} / {{ selectedFiles.length }}</h3>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card">
              <h6>Upload Status</h6>
              <h3>{{ uploadStatus }}</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- <div v-if="selectedFiles.length > 0" class="batch-settings mt-4">
        <div class="card">
          <div class="card-body">
            <h6 class="card-title">Upload Settings</h6>
            <div class="row">
              <div class="col-md-6">
                <label class="form-label">Batch Size (Files per upload)</label>
                <input 
                  type="number" 
                  class="form-control" 
                  v-model.number="batchSize"
                  min="1"
                  max="50"
                  :disabled="uploading"
                >
                <small class="text-muted">Recommended: 10-20 files (adjust based on server performance)</small>
              </div>
              <div class="col-md-6">
                <label class="form-label">Max Retries</label>
                <input 
                  type="number" 
                  class="form-control" 
                  v-model.number="maxRetries"
                  min="0"
                  max="5"
                  :disabled="uploading"
                >
                <small class="text-muted">Automatic retry on failure</small>
              </div>
            </div>
          </div>
        </div>
      </div> -->

      <div v-if="selectedFiles.length > 0" class="file-list-section mt-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6>
            File List 
            <button 
              class="btn btn-sm btn-outline-secondary ms-2"
              @click="showFileList = !showFileList"
            >
              <i class="fas" :class="showFileList ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
            </button>
          </h6>
          <div>
            <button 
              class="btn btn-sm btn-outline-danger me-2"
              @click="clearFailedFiles"
              v-if="failedFiles.length > 0"
            >
              <i class="fas fa-trash me-1"></i>
              Remove Failed ({{ failedFiles.length }})
            </button>
            <button 
              class="btn btn-sm btn-outline-secondary"
              @click="clearFiles"
              :disabled="uploading"
            >
              <i class="fas fa-trash me-1"></i>
              Clear All
            </button>
          </div>
        </div>
        
        <div v-show="showFileList" class="file-list-wrapper"> <div class="list-group file-list">
            <div 
              v-for="(file, index) in paginatedFiles" 
              :key="file.id"
              class="list-group-item d-flex justify-content-between align-items-center"
              :class="{
                'list-group-item-success': file.status === 'completed',
                'list-group-item-danger': file.status === 'failed',
                'list-group-item-warning': file.status === 'uploading',
                'list-group-item-light': file.status === 'pending'
              }"
            >
              <div class="file-info">
                <i class="fas fa-file me-2"></i>
                {{ file.name }}
                <small class="text-muted ms-2">({{ formatFileSize(file.size) }})</small>
                <div v-if="file.path && file.path !== file.name" class="small text-muted ms-4">
                  <i class="fas fa-folder me-1"></i>{{ file.path }}
                </div>
                <div v-if="file.error" class="small text-danger ms-4">
                  <i class="fas fa-exclamation-circle me-1"></i>{{ file.error }}
                </div>
              </div>
              <div class="file-actions d-flex align-items-center">
                <span class="badge me-2" :class="getStatusBadgeClass(file.status)">
                  {{ getStatusText(file.status) }}
                </span>
                <button 
                  class="btn btn-sm btn-outline-danger"
                  @click="removeFile(file.id)"
                  :disabled="uploading && file.status === 'uploading'"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
          
          <nav v-if="totalPages > 1" class="mt-3">
            <ul class="pagination justify-content-center">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" href="#" @click.prevent="currentPage = 1">
                  <i class="fas fa-angle-double-left"></i>
                </a>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" href="#" @click.prevent="currentPage--">
                  <i class="fas fa-angle-left"></i>
                </a>
              </li>
              <li class="page-item active">
                <span class="page-link">
                  {{ currentPage }} / {{ totalPages }}
                </span>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <a class="page-link" href="#" @click.prevent="currentPage++">
                  <i class="fas fa-angle-right"></i>
                </a>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <a class="page-link" href="#" @click.prevent="currentPage = totalPages">
                  <i class="fas fa-angle-double-right"></i>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div v-if="selectedFiles.length > 0" class="upload-controls mt-4">
        <button 
          class="btn btn-success btn-lg me-2"
          @click="startBatchUpload"
          :disabled="uploading || allFilesProcessed"
        >
          <span v-if="!uploading">
            <i class="fas fa-upload me-2"></i>
            Start Upload
          </span>
          <span v-else>
            <span class="spinner-border spinner-border-sm me-2" role="status"></span>
            Uploading...
          </span>
        </button>
        
        <button 
          class="btn btn-warning btn-lg me-2"
          @click="pauseUpload"
          v-if="uploading && !isPaused"
        >
          <i class="fas fa-pause me-2"></i>
          Pause
        </button>
        
        <button 
          class="btn btn-info btn-lg me-2"
          @click="resumeUpload"
          v-if="uploading && isPaused"
        >
          <i class="fas fa-play me-2"></i>
          Resume
        </button>
        
        <button 
          class="btn btn-danger btn-lg"
          @click="cancelUpload"
          v-if="uploading"
        >
          <i class="fas fa-stop me-2"></i>
          Cancel
        </button>
      </div>

      <div v-if="uploading || uploadedCount > 0" class="mt-4">
        <h6>Overall Progress</h6>
        <div class="progress" style="height: 30px;">
          <div 
            class="progress-bar progress-bar-striped"
            :class="{ 'progress-bar-animated': uploading }"
            role="progressbar"
            :style="{ width: overallProgress + '%' }"
            :aria-valuenow="overallProgress"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            {{ overallProgress }}%
          </div>
        </div>
        
        <div v-if="uploading && currentBatchProgress > 0" class="mt-3">
          <h6>Current Batch Progress ({{ currentBatchFiles.length }} files)</h6>
          <div class="progress" style="height: 20px;">
            <div 
              class="progress-bar progress-bar-striped progress-bar-animated bg-info"
              role="progressbar"
              :style="{ width: currentBatchProgress + '%' }"
              :aria-valuenow="currentBatchProgress"
              aria-valuemin="0"
              aria-valuemax="100"
            >
              {{ currentBatchProgress }}%
            </div>
          </div>
        </div>
      </div>

      <div v-if="uploadLogs.length > 0" class="upload-logs mt-4">
        <h6>Upload Logs</h6>
        <div class="log-container">
          <div v-for="(log, index) in uploadLogs" :key="index" class="log-entry" :class="'log-' + log.type">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, nextTick } from 'vue'
import axios from 'axios'

export default {
  name: 'AASXUploadIntegrated',
  setup() {
   // --- 상태 관리 (Reactive State) ---
    const fileInput = ref(null) // 파일 선택 input 엘리먼트에 대한 참조
    const folderInput = ref(null) // 폴더 선택 input 엘리먼트에 대한 참조
    const selectedFiles = ref([]) // 사용자가 선택한 파일 객체들의 배열
    const uploading = ref(false) // 현재 업로드 중인지 여부
    const isPaused = ref(false) // 업로드가 일시정지 되었는지 여부
    const uploadedCount = ref(0) // 업로드 성공한 파일 개수
    const failedFiles = ref([]) // 업로드 실패한 파일 목록
    const uploadLogs = ref([]) // 시간 순으로 기록되는 업로드 로그
    const isDragging = ref(false) // 파일 드래그 중인지 여부 (UI 스타일링용)
    const showFileList = ref(true) // 파일 목록을 보여줄지 여부
    
    // --- 배치 업로드 설정 ---
    const batchSize = ref(10) // 한 번에 업로드할 파일 개수
    const maxRetries = ref(3) // 실패 시 최대 재시도 횟수
    const currentBatchFiles = ref([]) // 현재 업로드 중인 배치 파일 목록
    const currentBatchProgress = ref(0) // 현재 배치 업로드 진행률 (%)
    
    // --- 페이지네이션 설정 ---
    const currentPage = ref(1) // 현재 파일 목록 페이지
    const filesPerPage = ref(20) // 페이지 당 보여줄 파일 개수
    
    // --- 업로드 제어 변수 ---
    let uploadController = null 
    let isUploading = false

    // --- 계산된 속성 (Computed Properties) ---
    // 선택된 모든 파일의 총 크기 계산
    const totalSize = computed(() => {
      return selectedFiles.value.reduce((sum, file) => sum + file.size, 0)
    })

    // 현재 전체 업로드 상태를 문자열로 계산
    const uploadStatus = computed(() => {
      if (uploading.value && isPaused.value) return 'Paused'
      if (uploading.value) return 'Uploading'
      if (uploadedCount.value === selectedFiles.value.length && selectedFiles.value.length > 0) return 'Completed'
      if (failedFiles.value.length > 0) return `${failedFiles.value.length} Failed`
      return 'Pending'
    })

    // 전체 업로드 진행률 계산
    const overallProgress = computed(() => {
      if (selectedFiles.value.length === 0) return 0
      const completed = selectedFiles.value.filter(f => f.status === 'completed').length
      return Math.round((completed / selectedFiles.value.length) * 100)
    })

    // 모든 파일이 처리되었는지 (성공 또는 실패) 여부 계산
    const allFilesProcessed = computed(() => {
      return selectedFiles.value.every(f => f.status === 'completed' || f.status === 'failed')
    })

    // 파일 목록의 총 페이지 수 계산
    const totalPages = computed(() => {
      return Math.ceil(selectedFiles.value.length / filesPerPage.value)
    })

    // 현재 페이지에 해당하는 파일 목록만 잘라서 반환
    const paginatedFiles = computed(() => {
      const start = (currentPage.value - 1) * filesPerPage.value
      const end = start + filesPerPage.value
      return selectedFiles.value.slice(start, end)
    })

    // --- 메소드 (Methods) ---
    // 파일 객체를 위한 고유 ID 생성
    const generateFileId = () => {
      return Date.now() + '-' + Math.random().toString(36).substr(2, 9)
    }

    // 업로드 로그 추가
    const addLog = (message, type = 'info') => {
      uploadLogs.value.push({
        time: new Date().toLocaleTimeString(),
        message,
        type
      })
      // 로그는 최신 100개만 유지
      if (uploadLogs.value.length > 100) {
        uploadLogs.value = uploadLogs.value.slice(-100)
      }
      
      // 새 로그가 추가되면 로그 컨테이너를 맨 아래로 스크롤
      nextTick(() => {
        const logContainer = document.querySelector('.log-container')
        if (logContainer) {
          logContainer.scrollTop = logContainer.scrollHeight
        }
      })
    }

    // 파일 선택 input에서 파일이 선택됐을 때 호출
    const handleFileSelect = (event) => {
      const files = Array.from(event.target.files)
      addFiles(files, 'file')
    }

    // 폴더 선택 input에서 폴더가 선택됐을 때 호출
    const handleFolderSelect = (event) => {
      const files = Array.from(event.target.files)
      const aasxFiles = files.filter(file => file.name.endsWith('.aasx'))
      
      if (aasxFiles.length === 0) {
        alert('No AASX files found in the selected folder.')
        return
      }
      
      addLog(`Found ${aasxFiles.length} AASX files in the folder.`, 'info')
      addFiles(aasxFiles, 'folder')
    }

    // 파일 목록에 파일을 추가
    const addFiles = (files, source = 'unknown') => {
      const aasxFiles = files.filter(file => file.name.endsWith('.aasx'))
      const nonAasxFiles = files.filter(file => !file.name.endsWith('.aasx'))
      
      if (nonAasxFiles.length > 0) {
        addLog(`${nonAasxFiles.length} non-AASX files excluded.`, 'warning')
      }
      
      let addedCount = 0
      aasxFiles.forEach(file => {
        const exists = selectedFiles.value.find(f => 
          f.name === file.name && f.size === file.size
        )
        
        if (!exists) {
          const fileObj = {
            id: generateFileId(),
            file: file,
            name: file.name,
            size: file.size,
            path: file.webkitRelativePath || file.name,
            status: 'pending',
            error: null,
            retries: 0
          }
          selectedFiles.value.push(fileObj)
          addedCount++
        }
      })
      
      addLog(`${addedCount} files added (Total: ${selectedFiles.value.length})`, 'success')
    }

    // 목록에서 특정 파일 제거
    const removeFile = (fileId) => {
      selectedFiles.value = selectedFiles.value.filter(f => f.id !== fileId)
    }

    // 모든 파일 목록 및 관련 상태 초기화
    const clearFiles = () => {
      selectedFiles.value = []
      uploadedCount.value = 0
      failedFiles.value = []
      uploadLogs.value = []
      currentPage.value = 1
      addLog('All files have been cleared.', 'info')
    }

    // 실패한 파일만 목록에서 제거
    const clearFailedFiles = () => {
      selectedFiles.value = selectedFiles.value.filter(f => f.status !== 'failed')
      failedFiles.value = []
      addLog('Failed files have been removed.', 'info')
    }

    // 파일 크기를 사람이 읽기 쉬운 형식(KB, MB, GB...)으로 변환
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    // --- 드래그 앤 드롭 이벤트 핸들러 ---
    const onDragOver = (e) => {
      isDragging.value = true
    }
    const onDragLeave = (e) => {
      isDragging.value = false
    }
    const onDrop = (e) => {
      isDragging.value = false
      const files = Array.from(e.dataTransfer.files)
      addFiles(files, 'drag')
    }

    // --- UI 헬퍼 메소드 ---
    // 파일 상태에 따라 표시할 텍스트 반환
    const getStatusText = (status) => {
      const statusMap = {
        'pending': 'Pending',
        'uploading': 'Uploading',
        'completed': 'Completed',
        'failed': 'Failed'
      }
      return statusMap[status] || status
    }

     // 파일 상태에 따라 적용할 Bootstrap 배지 클래스 반환
    const getStatusBadgeClass = (status) => {
      const classMap = {
        'pending': 'bg-secondary',
        'uploading': 'bg-warning',
        'completed': 'bg-success',
        'failed': 'bg-danger'
      }
      return classMap[status] || 'bg-secondary'
    }

    // --- 배치 업로드 핵심 로직 ---
    // 한 배치의 파일을 업로드하는 함수
    const uploadBatch = async (batch) => {
      const formData = new FormData()
      
      batch.forEach(fileObj => {
        formData.append('files', fileObj.file) // 'files'라는 키로 파일 추가
        fileObj.status = 'uploading'
      })
      
      formData.append('adminId', '1') // Example: Add admin ID
      
      try {
        uploadController = new AbortController() // 취소를 위한 컨트롤러 생성
        
        const response = await axios.post('/api/aas/aasx/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          signal: uploadController.signal, // 컨트롤러 연결
          onUploadProgress: (progressEvent) => { // 업로드 진행률 콜백
            currentBatchProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          }
        })
        
        // 업로드 성공 처리
        batch.forEach(fileObj => {
          fileObj.status = 'completed'
          uploadedCount.value++
        })
        
        addLog(`Batch upload successful: ${batch.length} files`, 'success')
        return true
        
      } catch (error) { // 업로드 취소된 경우
        if (error.name === 'CanceledError') {
          batch.forEach(fileObj => {
            if (fileObj.status === 'uploading') {
              fileObj.status = 'pending'
            }
          })
          addLog('Upload cancelled.', 'warning')
          return false
        }
        
        // 그 외 에러 처리
        batch.forEach(fileObj => {
          fileObj.status = 'failed'
          fileObj.error = error.response?.data?.message || error.message
          fileObj.retries++
          failedFiles.value.push(fileObj)
        })
        
        addLog(`Batch upload failed: ${error.message}`, 'error')
        return false
      }
    }

    // 전체 배치 업로드를 시작하고 관리하는 메인 함수
    const startBatchUpload = async () => {
      uploading.value = true
      isPaused.value = false
      isUploading = true
      uploadedCount.value = 0
      failedFiles.value = []
      
      addLog(`Starting upload - Total ${selectedFiles.value.length} files`, 'info')
      
      // '대기' 상태이거나, 재시도 횟수가 남은 '실패' 상태의 파일만 필터링
      const pendingFiles = selectedFiles.value.filter(f => 
        f.status === 'pending' || (f.status === 'failed' && f.retries < maxRetries.value)
      )
      
      // 필터링된 파일들을 배치 크기만큼 잘라서 순차적으로 처리
      for (let i = 0; i < pendingFiles.length; i += batchSize.value) {
        if (!isUploading || isPaused.value) break // 중단 또는 일시정지 시 루프 탈출
        
        const batch = pendingFiles.slice(i, i + batchSize.value)
        currentBatchFiles.value = batch
        currentBatchProgress.value = 0
        
        addLog(`Processing batch ${Math.floor(i / batchSize.value) + 1} (${batch.length} files)`, 'info')
        
        const success = await uploadBatch(batch)
        
        // Retry failed files
        if (!success && !isPaused.value) {
          const retryFiles = batch.filter(f => 
            f.status === 'failed' && f.retries < maxRetries.value
          )
          
          if (retryFiles.length > 0) {
            addLog(`Retrying ${retryFiles.length} files...`, 'warning')
            await uploadBatch(retryFiles) // 한 배치 업로드 실행
          }
        }
        
        // 서버 과부하 방지를 위해 배치 사이에 잠시 대기
        if (i + batchSize.value < pendingFiles.length && isUploading) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
      
      uploading.value = false
      isUploading = false
      currentBatchFiles.value = []
      currentBatchProgress.value = 0
      
      // 최종 결과 로그 출력
      const successCount = selectedFiles.value.filter(f => f.status === 'completed').length
      const failCount = selectedFiles.value.filter(f => f.status === 'failed').length
      
      // 업로드 일시정지
      addLog(`Upload completed - Success: ${successCount}, Failed: ${failCount}`, 
        failCount > 0 ? 'warning' : 'success')
    }

    const pauseUpload = () => {
      isPaused.value = true
      isUploading = false
      if (uploadController) {
        uploadController.abort()
      }
      addLog('Upload paused.', 'info')
    }

    // 일시정지된 업로드 재개
    const resumeUpload = () => {
      isPaused.value = false // 다시 업로드 상태로
      startBatchUpload()  // 업로드 프로세스 다시 시작 (남은 파일부터 처리)
      addLog('Resuming upload.', 'info')
    }

    // 전체 업로드 취소
    const cancelUpload = () => {
      isUploading = false
      uploading.value = false
      isPaused.value = false
      if (uploadController) {
        uploadController.abort()
      }
      
      // '업로드중'이던 파일들을 다시 '대기' 상태로 되돌림
      selectedFiles.value.forEach(file => {
        if (file.status === 'uploading') {
          file.status = 'pending'
        }
      })
      
      currentBatchFiles.value = []
      currentBatchProgress.value = 0
      addLog('Upload cancelled.', 'warning')
    }

    // 페이지 번호가 범위를 벗어나지 않도록 감시
    watch(currentPage, (newPage) => {
      if (newPage < 1) currentPage.value = 1
      if (newPage > totalPages.value) currentPage.value = totalPages.value
    })

    return {
      // refs
      fileInput,
      folderInput,
      
      // State
      selectedFiles,
      uploading,
      isPaused,
      uploadedCount,
      failedFiles,
      uploadLogs,
      isDragging,
      showFileList,
      batchSize,
      maxRetries,
      currentBatchFiles,
      currentBatchProgress,
      currentPage,
      filesPerPage,
      
      // Computed Properties
      totalSize,
      uploadStatus,
      overallProgress,
      allFilesProcessed,
      totalPages,
      paginatedFiles,
      
      // Methods
      handleFileSelect,
      handleFolderSelect,
      removeFile,
      clearFiles,
      clearFailedFiles,
      formatFileSize,
      onDragOver,
      onDragLeave,
      onDrop,
      getStatusText,
      getStatusBadgeClass,
      startBatchUpload,
      pauseUpload,
      resumeUpload,
      cancelUpload
    }
  }
}
</script>

<style scoped>
.aasx-upload-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.upload-section {
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.upload-area {
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  background-color: #f8f9fa;
  transition: all 0.3s ease;
  cursor: pointer;
}

.upload-area:hover {
  border-color: #0d6efd;
  background-color: #e7f1ff;
}

.upload-area.drag-over {
  border-color: #0d6efd;
  background-color: #e7f1ff;
  transform: scale(1.02);
}

/* Stat Cards */
.stat-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  border: 1px solid #dee2e6;
}

.stat-card h6 {
  color: #6c757d;
  font-size: 0.875rem;
  margin-bottom: 10px;
}

.stat-card h3 {
  color: #2c3e50;
  font-size: 1.5rem;
  margin: 0;
}

/* File List */
.file-list-wrapper { /* Added wrapper for scroll */
  max-height: 400px; /* Set a max height */
  overflow-y: auto; /* Enable vertical scroll */
  border: 1px solid #dee2e6; /* Optional: Add border for visual separation */
  border-radius: 4px;
  padding: 5px; /* Optional: Add padding inside scrollable area */
}

.list-group-item {
  margin-bottom: 5px;
  transition: all 0.2s ease;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-actions {
  flex-shrink: 0;
}

/* Progress Bar */
.progress {
  background-color: #e9ecef;
}

/* Upload Logs */
.log-container {
  max-height: 200px;
  overflow-y: auto;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 10px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.875rem;
}

.log-entry {
  margin-bottom: 5px;
  display: flex;
  gap: 10px;
}

.log-time {
  color: #6c757d;
  flex-shrink: 0;
}

.log-info { color: #0d6efd; }
.log-success { color: #198754; }
.log-warning { color: #ffc107; }
.log-error { color: #dc3545; }

/* Icon Colors */
.fa-cloud-upload-alt {
  color: #0d6efd;
}

.fa-file {
  color: #ffffff;
}

/* Scrollbar Styles */
.file-list-wrapper::-webkit-scrollbar, /* Added for the new wrapper */
.log-container::-webkit-scrollbar {
  width: 8px;
}

.file-list-wrapper::-webkit-scrollbar-track, /* Added for the new wrapper */
.log-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.file-list-wrapper::-webkit-scrollbar-thumb, /* Added for the new wrapper */
.log-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.file-list-wrapper::-webkit-scrollbar-thumb:hover, /* Added for the new wrapper */
.log-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Button Group */
.upload-controls {
  text-align: center;
}

/* Batch Settings Card */
.batch-settings .card {
  border: 1px solid #dee2e6;
}

.batch-settings .form-label {
  font-weight: 600;
  color: #495057;
}

/* Pagination */
.pagination {
  margin-bottom: 0;
}

.page-link {
  color: #0d6efd;
  border-radius: 4px;
  margin: 0 2px;
}

.page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
}
</style>