import apiClient from './api'

/**
 * AAS(Asset Administration Shell) 관련 API 서비스
 */
export const aasService = {
  // ===== AAS 관련 API =====

  /**
   * 전체 AAS 목록 조회
   * @param {number} page - 페이지 번호
   * @param {string} keyword - 검색 키워드 (선택사항)
   * @returns {Promise<Object>} AAS 목록 응답
   */
  async getAllAAS(page = 1, keyword = null) {
    try {
      const params = { page }
      if (keyword) {
        params.keyword = keyword
      }

      console.log(`>> 전체 AAS 조회 시작 (page: ${page}, keyword: ${keyword})`)
      const response = await apiClient.get('/aas', { params })

      // Component 필터링
      if (response.data.message && Array.isArray(response.data.message)) {
        response.data.message = response.data.message.filter(aas =>
          aas.idShort !== 'Component'
        )
        console.log(`Component 필터링 후: ${response.data.message.length}개`)
      }

      return response.data
    } catch (error) {
      console.error('XX 전체 AAS 조회 실패:', error.message)
      throw new Error(`전체 AAS 조회 실패: ${error.response?.status} ${error.message}`)
    }
  },

  /**
   * 키워드로 AAS 검색
   * @param {string} keyword - 검색 키워드
   * @param {number} page - 페이지 번호
   * @returns {Promise<Object>} 검색 결과
   */
  async searchAASByKeyword(keyword, page = 1) {
    try {
      console.log(`>> 키워드별 AAS 조회: ${keyword}, 페이지: ${page}`)
      const response = await apiClient.get('/aas', {
        params: { page, keyword }
      })
      return response.data
    } catch (error) {
      console.error('XX 키워드별 AAS 조회 실패:', error.message)
      throw new Error(`키워드별 AAS 조회 실패: ${error.response?.status} ${error.message}`)
    }
  },

  /**
   * 특정 AAS 상세 정보 조회
   * @param {string} aasId - AAS ID
   * @returns {Promise<Object>} AAS 상세 정보
   */
  async getAASById(aasId) {
    try {
      const encodedId = encodeURIComponent(aasId)
      const response = await apiClient.get(`/aas/${encodedId}`)
      return response.data
    } catch (error) {
      console.error('XX AAS 상세 조회 실패:', error.message)
      throw new Error(`AAS 상세 조회 실패: ${error.response?.status} ${error.message}`)
    }
  },

  /**
   * AAS 생성
   * @param {Object} aasData - AAS 데이터
   * @returns {Promise<Object>} 생성된 AAS 정보
   */
  async createAAS(aasData) {
    try {
      const response = await apiClient.post('/aas', aasData)
      return response.data
    } catch (error) {
      console.error('XX AAS 생성 실패:', error.message)
      throw new Error(`AAS 생성 실패: ${error.response?.status} ${error.message}`)
    }
  },

  /**
   * AAS 업데이트
   * @param {string} aasId - AAS ID
   * @param {Object} aasData - 업데이트할 AAS 데이터
   * @returns {Promise<Object>} 업데이트된 AAS 정보
   */
  async updateAAS(aasId, aasData) {
    try {
      const encodedId = encodeURIComponent(aasId)
      const response = await apiClient.put(`/aas/${encodedId}`, aasData)
      return response.data
    } catch (error) {
      console.error('XX AAS 업데이트 실패:', error.message)
      throw new Error(`AAS 업데이트 실패: ${error.response?.status} ${error.message}`)
    }
  },

  /**
   * AAS 삭제
   * @param {string} aasId - AAS ID
   * @returns {Promise<Object>} 삭제 결과
   */
  async deleteAAS(aasId) {
    try {
      const encodedId = encodeURIComponent(aasId)
      const response = await apiClient.delete(`/aas/${encodedId}`)
      return response.data
    } catch (error) {
      console.error('XX AAS 삭제 실패:', error.message)
      throw new Error(`AAS 삭제 실패: ${error.response?.status} ${error.message}`)
    }
  },

  // ===== Submodel 관련 API =====

  /**
   * 전체 Submodel 목록 조회 (페이징 처리)
   * @returns {Promise<Object>} 전체 Submodel 목록
   */
  async getAllSubmodels() {
    try {
      let allSubmodels = []
      let page = 1
      let hasMore = true

      console.log('>> 모든 서브모델 페이징 로드 시작')

      while (hasMore) {
        const response = await apiClient.get('/submodel', { params: { page } })
        const submodelData = response.data

        if (submodelData.message && submodelData.message.length > 0) {
          console.log(`>> 페이지 ${page}: ${submodelData.message.length}개 서브모델`)
          allSubmodels = [...allSubmodels, ...submodelData.message]

          if (submodelData.totalCount) {
            hasMore = allSubmodels.length < submodelData.totalCount
          } else {
            hasMore = submodelData.message.length >= 60
          }
          page++
        } else {
          hasMore = false
        }
      }

      console.log(`>> 총 ${allSubmodels.length}개 서브모델 로드 완료`)

      return {
        message: allSubmodels,
        totalCount: allSubmodels.length,
        code: 200,
        status: 'success'
      }
    } catch (error) {
      console.error('XX 전체 Submodel 조회 실패:', error.message)
      throw new Error(`전체 Submodel 조회 실패: ${error.response?.status} ${error.message}`)
    }
  },

  /**
   * 특정 AAS의 Submodel 목록 조회
   * @param {string} aasId - AAS ID
   * @returns {Promise<Object>} Submodel 목록
   */
  async getSubmodelsByAASId(aasId) {
    try {
      console.log(`>> AAS의 서브모델 조회 시작: ${aasId}`)

      const encodedId = encodeURIComponent(aasId)
      console.log(`>> 인코딩된 ID: ${encodedId}`)

      const response = await apiClient.get(`/aas/submodel/${encodedId}`)

      let submodels = []
      if (response.data && response.data.message) {
        submodels = Array.isArray(response.data.message)
          ? response.data.message
          : [response.data.message]
      }

      return { message: submodels }
    } catch (error) {
      console.error('XX AAS 서브모델 조회 실패:', error)
      return { message: [] }
    }
  },

  /**
   * Submodel 상세 정보 조회
   * @param {string} submodelId - Submodel ID
   * @returns {Promise<Object>} Submodel 상세 정보
   */
  async getSubmodelById(submodelId) {
    try {
      const encodedId = encodeURIComponent(submodelId)
      const response = await apiClient.get(`/submodel/${encodedId}`)
      return response.data
    } catch (error) {
      console.error('XX Submodel 상세 조회 실패:', error.message)
      throw new Error(`Submodel 상세 조회 실패: ${error.response?.status} ${error.message}`)
    }
  },

  /**
   * Submodel 생성
   * @param {Object} submodelData - Submodel 데이터
   * @returns {Promise<Object>} 생성된 Submodel 정보
   */
  async createSubmodel(submodelData) {
    try {
      const response = await apiClient.post('/submodel', submodelData)
      return response.data
    } catch (error) {
      console.error('XX Submodel 생성 실패:', error.message)
      throw new Error(`Submodel 생성 실패: ${error.response?.status} ${error.message}`)
    }
  },

  /**
   * Submodel 업데이트
   * @param {string} submodelId - Submodel ID
   * @param {Object} submodelData - 업데이트할 Submodel 데이터
   * @returns {Promise<Object>} 업데이트된 Submodel 정보
   */
  async updateSubmodel(submodelId, submodelData) {
    try {
      const encodedId = encodeURIComponent(submodelId)
      const response = await apiClient.put(`/submodel/${encodedId}`, submodelData)
      return response.data
    } catch (error) {
      console.error('XX Submodel 업데이트 실패:', error.message)
      throw new Error(`Submodel 업데이트 실패: ${error.response?.status} ${error.message}`)
    }
  },

  /**
   * Submodel 삭제
   * @param {string} submodelId - Submodel ID
   * @returns {Promise<Object>} 삭제 결과
   */
  async deleteSubmodel(submodelId) {
    try {
      const encodedId = encodeURIComponent(submodelId)
      const response = await apiClient.delete(`/submodel/${encodedId}`)
      return response.data
    } catch (error) {
      console.error('XX Submodel 삭제 실패:', error.message)
      throw new Error(`Submodel 삭제 실패: ${error.response?.status} ${error.message}`)
    }
  },

  // ===== ConceptDescription 관련 API =====

  /**
   * 전체 ConceptDescription 목록 조회
   * @param {number} page - 페이지 번호
   * @returns {Promise<Object>} ConceptDescription 목록
   */
  async getAllConceptDescriptions(page = 1) {
    try {
      console.log(`>> 전체 ConceptDescription 조회 시작 (page: ${page})`)
      const response = await apiClient.get('/concept/description', { params: { page } })
      return response.data
    } catch (error) {
      console.error('XX 전체 ConceptDescription 조회 실패:', error.message)
      throw new Error(`전체 ConceptDescription 조회 실패: ${error.response?.status} ${error.message}`)
    }
  },

  /**
   * ConceptDescription 상세 정보 조회
   * @param {string} conceptId - ConceptDescription ID
   * @returns {Promise<Object>} ConceptDescription 상세 정보
   */
  async getConceptDescriptionById(conceptId) {
    try {
      const encodedId = encodeURIComponent(conceptId)
      const response = await apiClient.get(`/concept/description/${encodedId}`)
      return response.data
    } catch (error) {
      console.error('XX ConceptDescription 상세 조회 실패:', error.message)
      throw new Error(`ConceptDescription 상세 조회 실패: ${error.response?.status} ${error.message}`)
    }
  },

  // ===== 검색 관련 API =====

  /**
   * 필터 기반 검색
   * @param {string} filterType - 필터 타입
   * @param {string} value - 검색 값
   * @returns {Promise<Object>} 검색 결과
   */
  async searchByFilter(filterType, value) {
    const endpoint = filterType

    try {
      console.log(`>> ${filterType} 검색 시작: ${value}`)
      const response = await apiClient.get(`/repository/search/${endpoint}?value=${encodeURIComponent(value)}`)
      return response.data
    } catch (error) {
      console.error(`XX ${filterType} 검색 실패:`, error.message)
      throw new Error(`${filterType} 검색 실패: ${error.response?.status} ${error.message}`)
    }
  },

  /**
   * 키워드 기반 검색
   * @param {string} entityType - 엔티티 타입 (aas, submodel, conceptdescription)
   * @param {string} keyword - 검색 키워드
   * @param {number} page - 페이지 번호
   * @returns {Promise<Object>} 검색 결과
   */
  async searchByKeyword(entityType, keyword, page = 1) {
    let endpoint = entityType
    if (entityType === 'conceptdescription') {
      endpoint = 'concept/description'
    }

    const validEndpoints = ['aas', 'submodel', 'concept/description']
    if (!validEndpoints.includes(endpoint)) {
      throw new Error(`Invalid entity type for keyword search: ${entityType}`)
    }

    try {
      console.log(`>> Keyword search on ${endpoint}: ${keyword}, page: ${page}`)
      const params = { page }
      if (keyword) {
        params.keyword = keyword
      }
      const response = await apiClient.get(`/${endpoint}`, { params })
      return response.data
    } catch (error) {
      console.error(`XX Keyword search on ${endpoint} failed:`, error.message)
      throw new Error(`Keyword search on ${endpoint} failed: ${error.response?.status} ${error.message}`)
    }
  },

  // ===== AASX 파일 관련 API =====

  /**
   * AASX 파일 업로드 및 변환
   * @param {File} file - AASX 파일
   * @returns {Promise<Object>} 변환된 JSON 데이터
   */
  async uploadAASX(file) {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await apiClient.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      return response.data
    } catch (error) {
      console.error('XX AASX 파일 업로드 실패:', error.message)
      throw new Error(`AASX 파일 업로드 실패: ${error.response?.status} ${error.message}`)
    }
  },

  // ===== 유틸리티 API =====

  /**
   * 서버 상태 확인
   * @returns {Promise<Object>} 서버 상태
   */
  async checkServerStatus() {
    try {
      console.log('>> 서버 상태 확인 중...')
      const response = await apiClient.get('/health')
      return response.data
    } catch (error) {
      console.error('XX 서버 연결 실패:', error.message)
      return { status: 'unknown' }
    }
  }
}

export default aasService
