<template>
  <div class="aasx-upload-container">
    <div class="upload-section">
      <div
        class="upload-area"
        :class="{ 'drag-over': isDragging }"
        @dragover.prevent="onDragOver"
        @dragleave.prevent="onDragLeave"
        @drop.prevent="onDrop"
      >
        <i class="fas fa-cloud-upload-alt upload-icon"></i>
        <h5 class="upload-title">Drag and drop AASX files here</h5>
        <p class="upload-subtitle">or click the buttons below to select files</p>

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

        <div class="upload-buttons">
          <button
            class="upload-btn"
            @click="$refs.fileInput.click()"
            :disabled="uploading"
          >
            <i class="fas fa-file"></i>
            <span>Select Files</span>
          </button>

          <button
            class="upload-btn"
            @click="$refs.folderInput.click()"
            :disabled="uploading"
          >
            <i class="fas fa-folder-open"></i>
            <span>Select Folder</span>
          </button>
        </div>
      </div>

      <div v-if="selectedFiles.length > 0" class="file-stats">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-file-alt"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ selectedFiles.length }}</div>
              <div class="stat-label">Total Files</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-database"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ formatFileSize(totalSize) }}</div>
              <div class="stat-label">Total Size</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ uploadedCount }} / {{ selectedFiles.length }}</div>
              <div class="stat-label">Completed</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-info-circle"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ uploadStatus }}</div>
              <div class="stat-label">Status</div>
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

      <div v-if="selectedFiles.length > 0" class="file-list-section">
        <div class="section-header">
          <h6 class="section-title">
            <i class="fas fa-list"></i>
            File List
            <button
              class="toggle-btn"
              @click="showFileList = !showFileList"
            >
              <i class="fas" :class="showFileList ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
            </button>
          </h6>
          <div class="section-actions">
            <button
              class="action-btn danger"
              @click="clearFailedFiles"
              v-if="failedFiles.length > 0"
            >
              <i class="fas fa-trash"></i>
              Remove Failed ({{ failedFiles.length }})
            </button>
            <button
              class="action-btn"
              @click="clearFiles"
              :disabled="uploading"
            >
              <i class="fas fa-trash"></i>
              Clear All
            </button>
          </div>
        </div>

        <div v-show="showFileList" class="file-list-wrapper">
          <div class="file-list">
            <div
              v-for="file in paginatedFiles"
              :key="file.id"
              class="file-item"
              :class="'status-' + file.status"
            >
              <div class="file-info">
                <div class="file-main">
                  <i class="fas fa-file file-icon"></i>
                  <span class="file-name">{{ file.name }}</span>
                  <span class="file-size">({{ formatFileSize(file.size) }})</span>
                </div>
                <div v-if="file.path && file.path !== file.name" class="file-path">
                  <i class="fas fa-folder"></i>
                  {{ file.path }}
                </div>
                <div v-if="file.error" class="file-error">
                  <i class="fas fa-exclamation-circle"></i>
                  {{ file.error }}
                </div>
              </div>
              <div class="file-actions">
                <span class="status-badge" :class="'status-' + file.status">
                  {{ getStatusText(file.status) }}
                </span>
                <button
                  class="remove-btn"
                  @click="removeFile(file.id)"
                  :disabled="uploading && file.status === 'uploading'"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>

          <div v-if="totalPages > 1" class="pagination-wrapper">
            <div class="pagination">
              <button
                class="page-btn"
                :disabled="currentPage === 1"
                @click="currentPage = 1"
              >
                <i class="fas fa-angle-double-left"></i>
              </button>
              <button
                class="page-btn"
                :disabled="currentPage === 1"
                @click="currentPage--"
              >
                <i class="fas fa-angle-left"></i>
              </button>
              <span class="page-info">
                {{ currentPage }} / {{ totalPages }}
              </span>
              <button
                class="page-btn"
                :disabled="currentPage === totalPages"
                @click="currentPage++"
              >
                <i class="fas fa-angle-right"></i>
              </button>
              <button
                class="page-btn"
                :disabled="currentPage === totalPages"
                @click="currentPage = totalPages"
              >
                <i class="fas fa-angle-double-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="selectedFiles.length > 0" class="upload-controls">
        <button
          class="control-btn primary"
          @click="startBatchUpload"
          :disabled="uploading || allFilesProcessed"
        >
          <span v-if="!uploading">
            <i class="fas fa-upload"></i>
            Start Upload
          </span>
          <span v-else>
            <span class="spinner"></span>
            Uploading...
          </span>
        </button>

        <button
          class="control-btn warning"
          @click="pauseUpload"
          v-if="uploading && !isPaused"
        >
          <i class="fas fa-pause"></i>
          Pause
        </button>

        <button
          class="control-btn info"
          @click="resumeUpload"
          v-if="uploading && isPaused"
        >
          <i class="fas fa-play"></i>
          Resume
        </button>

        <button
          class="control-btn danger"
          @click="cancelUpload"
          v-if="uploading"
        >
          <i class="fas fa-stop"></i>
          Cancel
        </button>
      </div>

      <div v-if="uploading || uploadedCount > 0" class="progress-section">
        <div class="progress-item">
          <h6 class="progress-title">Overall Progress</h6>
          <div class="progress-bar-wrapper">
            <div
              class="progress-bar"
              :class="{ 'animated': uploading }"
              :style="{ width: overallProgress + '%' }"
            >
              <span class="progress-text">{{ overallProgress }}%</span>
            </div>
          </div>
        </div>

        <div v-if="uploading && currentBatchProgress > 0" class="progress-item">
          <h6 class="progress-title">Current Batch ({{ currentBatchFiles.length }} files)</h6>
          <div class="progress-bar-wrapper">
            <div
              class="progress-bar batch"
              :class="{ 'animated': true }"
              :style="{ width: currentBatchProgress + '%' }"
            >
              <span class="progress-text">{{ currentBatchProgress }}%</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="uploadLogs.length > 0" class="upload-logs">
        <h6 class="section-title">
          <i class="fas fa-terminal"></i>
          Upload Logs
        </h6>
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
      addFiles(files)
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
      addFiles(aasxFiles)
    }

    // 파일 목록에 파일을 추가
    const addFiles = (files) => {
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
    const onDragOver = () => {
      isDragging.value = true
    }
    const onDragLeave = () => {
      isDragging.value = false
    }
    const onDrop = (e) => {
      isDragging.value = false
      const files = Array.from(e.dataTransfer.files)
      addFiles(files)
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

        // 응답 데이터 확인 - SuccessResponse의 경우 message 필드에 실제 데이터가 있음
        const responseData = response.data.message || response.data

        // 에러가 있는 경우 처리
        if (responseData.hasErrors && responseData.files) {
          let hasSuccess = false

          responseData.files.forEach(fileResult => {
            const fileObj = batch.find(f => f.name === fileResult.filename)
            if (fileObj) {
              if (fileResult.status === 'error') {
                fileObj.status = 'failed'
                fileObj.error = fileResult.message || 'Upload failed'
                failedFiles.value.push(fileObj)

                // 상세한 에러 로그 추가
                addLog(`Failed: ${fileResult.filename}`, 'error')
                if (fileResult.errorType) {
                  addLog(`  Error Type: ${fileResult.errorType}`, 'error')
                }
                if (fileResult.details) {
                  addLog(`  Details: ${fileResult.details}`, 'error')
                }
              } else if (fileResult.status === 'warning') {
                // 중복 파일 처리
                fileObj.status = 'completed'
                uploadedCount.value++
                hasSuccess = true

                addLog(`Warning: ${fileResult.filename}`, 'warning')
                addLog(`  ${fileResult.message}`, 'warning')
                if (fileResult.duplicateDetails) {
                  const dup = fileResult.duplicateDetails
                  if (dup.aas > 0) addLog(`    - AAS 중복: ${dup.aas}개`, 'warning')
                  if (dup.submodel > 0) addLog(`    - Submodel 중복: ${dup.submodel}개`, 'warning')
                  if (dup.conceptDescription > 0) addLog(`    - ConceptDescription 중복: ${dup.conceptDescription}개`, 'warning')
                }
              } else {
                fileObj.status = 'completed'
                uploadedCount.value++
                hasSuccess = true
              }
            }
          })

          if (hasSuccess) {
            addLog(`Batch upload partially successful`, 'warning')
          } else {
            addLog(`Batch upload failed: All files had errors`, 'error')
          }
          return hasSuccess
        } else {
          // 응답 데이터에서 파일별 결과 확인
          if (responseData && responseData.files) {
            responseData.files.forEach(fileResult => {
              const fileObj = batch.find(f => f.name === fileResult.filename)
              if (fileObj) {
                if (fileResult.status === 'warning') {
                  // 중복이 있는 경우
                  addLog(`${fileResult.filename}: ${fileResult.message}`, 'warning')
                  if (fileResult.duplicateDetails) {
                    const dup = fileResult.duplicateDetails
                    if (dup.aas > 0) addLog(`  - AAS 중복: ${dup.aas}개`, 'warning')
                    if (dup.submodel > 0) addLog(`  - Submodel 중복: ${dup.submodel}개`, 'warning')
                    if (dup.conceptDescription > 0) addLog(`  - ConceptDescription 중복: ${dup.conceptDescription}개`, 'warning')
                  }
                } else {
                  if (fileResult.registrationDetails) {
                    // 등록 상세 정보가 있는 경우
                    const details = fileResult.registrationDetails
                    addLog(`${fileResult.filename}: 성공적으로 업로드됨`, 'success')
                    if (details.aas) {
                      addLog(`  - AAS: 신규 ${details.aas.success}개, 중복 ${details.aas.duplicate}개`, 'info')
                    }
                    if (details.submodel) {
                      addLog(`  - Submodel: 신규 ${details.submodel.success}개, 중복 ${details.submodel.duplicate}개`, 'info')
                    }
                    if (details.conceptDescription) {
                      addLog(`  - ConceptDescription: 신규 ${details.conceptDescription.success}개, 중복 ${details.conceptDescription.duplicate}개`, 'info')
                    }
                  } else {
                    addLog(`${fileResult.filename}: 성공적으로 업로드됨`, 'success')
                  }
                }
                fileObj.status = 'completed'
                uploadedCount.value++
              }
            })
          } else {
            // 기존 방식 (파일별 정보가 없는 경우)
            batch.forEach(fileObj => {
              fileObj.status = 'completed'
              uploadedCount.value++
            })
            addLog(`Batch upload successful: ${batch.length} files`, 'success')
          }
          return true
        }

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
        const errorMessage = error.response?.data?.message || error.message

        batch.forEach(fileObj => {
          fileObj.status = 'failed'
          fileObj.error = errorMessage
          fileObj.retries++
          failedFiles.value.push(fileObj)
        })

        addLog(`Batch upload failed: ${errorMessage}`, 'error')

        // 응답에 상세 정보가 있는 경우 추가 로그
        if (error.response?.data?.files) {
          error.response.data.files.forEach(fileResult => {
            if (fileResult.status === 'error') {
              addLog(`  ${fileResult.filename}: ${fileResult.message}`, 'error')
            }
          })
        }

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
  padding: 24px;
  height: 100%;
  overflow-y: auto;
  background-color: #f8f9fa;
}

.upload-section {
  max-width: 1200px;
  margin: 0 auto;
}

/* Upload Area */
.upload-area {
  background: white;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 60px 40px;
  text-align: center;
  transition: all 0.3s ease;
  margin-bottom: 24px;
}

.upload-area:hover {
  border-color: #3b82f6;
  background-color: #f0f9ff;
}

.upload-area.drag-over {
  border-color: #3b82f6;
  background-color: #e0f2fe;
  transform: scale(1.01);
}

.upload-icon {
  font-size: 48px;
  color: #3b82f6;
  margin-bottom: 16px;
}

.upload-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.upload-subtitle {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 24px;
}

/* Upload Buttons */
.upload-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-btn:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.upload-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-btn i {
  font-size: 16px;
}

/* Stats Section */
.file-stats {
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: #e0f2fe;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon i {
  font-size: 20px;
  color: #3b82f6;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
}

/* File List Section */
.file-list-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.section-title i {
  color: #3b82f6;
}

.toggle-btn {
  background: #f3f4f6;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-left: 8px;
  transition: all 0.2s ease;
}

.toggle-btn:hover {
  background: #e5e7eb;
}

.section-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover:not(:disabled) {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.action-btn.danger {
  color: #dc2626;
  border-color: #fecaca;
  background: #fef2f2;
}

.action-btn.danger:hover:not(:disabled) {
  background: #fee2e2;
  border-color: #fca5a5;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* File List */
.file-list-wrapper {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fafafa;
}

.file-list {
  padding: 8px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.2s ease;
}

.file-item:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.file-item.status-completed {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.file-item.status-failed {
  background: #fef2f2;
  border-color: #fecaca;
}

.file-item.status-uploading {
  background: #fefce8;
  border-color: #fde68a;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-main {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.file-icon {
  color: #6b7280;
  font-size: 14px;
}

.file-name {
  font-weight: 500;
  color: #1f2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  color: #6b7280;
  font-size: 13px;
}

.file-path,
.file-error {
  font-size: 12px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 22px;
}

.file-error {
  color: #dc2626;
}

.file-path i,
.file-error i {
  font-size: 10px;
}

.file-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.status-pending {
  background: #f3f4f6;
  color: #6b7280;
}

.status-badge.status-uploading {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.status-completed {
  background: #d1fae5;
  color: #059669;
}

.status-badge.status-failed {
  background: #fee2e2;
  color: #dc2626;
}

.remove-btn {
  width: 28px;
  height: 28px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;
}

.remove-btn:hover:not(:disabled) {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #dc2626;
}

.remove-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Pagination */
.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-btn {
  width: 32px;
  height: 32px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;
}

.page-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #d1d5db;
  color: #374151;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  padding: 0 16px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

/* Upload Controls */
.upload-controls {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-btn.primary {
  background: #10b981;
  color: white;
}

.control-btn.primary:hover:not(:disabled) {
  background: #059669;
}

.control-btn.warning {
  background: #f59e0b;
  color: white;
}

.control-btn.warning:hover:not(:disabled) {
  background: #d97706;
}

.control-btn.info {
  background: #3b82f6;
  color: white;
}

.control-btn.info:hover:not(:disabled) {
  background: #2563eb;
}

.control-btn.danger {
  background: #ef4444;
  color: white;
}

.control-btn.danger:hover:not(:disabled) {
  background: #dc2626;
}

.control-btn i {
  font-size: 16px;
}

/* Spinner */
.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Progress Section */
.progress-section {
  margin-bottom: 24px;
}

.progress-item {
  margin-bottom: 20px;
}

.progress-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.progress-bar-wrapper {
  background: #e5e7eb;
  border-radius: 8px;
  height: 32px;
  overflow: hidden;
  position: relative;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 8px;
  transition: width 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.progress-bar.batch {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.progress-bar.animated::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  to {
    left: 100%;
  }
}

.progress-text {
  color: white;
  font-size: 14px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* Upload Logs */
.upload-logs {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.upload-logs .section-title {
  margin-bottom: 16px;
}

.log-container {
  max-height: 200px;
  overflow-y: auto;
  background: #1e293b;
  border-radius: 8px;
  padding: 16px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
}

.log-entry {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
  line-height: 1.4;
}

.log-time {
  color: #64748b;
  flex-shrink: 0;
  font-size: 12px;
}

.log-message {
  flex: 1;
}

.log-info { color: #60a5fa; }
.log-success { color: #4ade80; }
.log-warning { color: #fbbf24; }
.log-error { color: #f87171; }

/* Scrollbar Styles */
.file-list-wrapper::-webkit-scrollbar,
.log-container::-webkit-scrollbar {
  width: 8px;
}

.file-list-wrapper::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 4px;
}

.log-container::-webkit-scrollbar-track {
  background: #334155;
  border-radius: 4px;
}

.file-list-wrapper::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.log-container::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 4px;
}

.file-list-wrapper::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.log-container::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}

/* Responsive */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .upload-controls {
    flex-wrap: wrap;
  }

  .control-btn {
    flex: 1;
    min-width: 120px;
  }
}
</style>
