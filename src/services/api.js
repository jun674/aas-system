/**
 * 확장된 API 서비스 - 전체 데이터 조회 및 키워드 검색 지원
 */
import axios from 'axios'

// 프록시를 통한 API 베이스 URL
const BASE_URL = '/api'
//const BASE_URL = 'https://api.allorigins.win/raw?url=' + encodeURIComponent('http://15.164.151.83')
// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 120000, // 전체 데이터 로딩을 위해 시간 증가
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    console.log('>> API 요청:', config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => {
    console.error('XX 요청 에러:', error)
    return Promise.reject(error)
  }
)

// 응답 인터셉터  
apiClient.interceptors.response.use(
  (response) => {
    console.log('>> API 응답 성공:', response.status, response.config.url)
    return response
  },
  (error) => {
    console.error('XX API 응답 에러:', error.response?.status, error.config?.url)
    return Promise.reject(error)
  }
)

// 전체 데이터 조회 API
export const dataAPI = {
  // 전체 AAS 조회 (키워드 검색 포함)
  getAllAAS: async (page = 1, keyword = null) => {
  try {
    const params = { page }
    if (keyword) {
      params.keyword = keyword
    }
    
    console.log(`>> 전체 AAS 조회 시작 (page: ${page}, keyword: ${keyword})`)
    const response = await apiClient.get('/aas', { params })
    
    // 🔧 Component 필터링
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

  // 키워드별 AAS 조회 (메뉴 전용)
  getAASByKeyword: async (keyword, page = 1) => { // page 파라미터 추가
    try {
      console.log(`>> 키워드별 AAS 조회: ${keyword}, 페이지: ${page}`);
      const response = await apiClient.get('/aas', { 
        params: { page, keyword } // page 파라미터를 API 요청에 포함
      });
      return response.data;
    } catch (error) {
      console.error('XX 키워드별 AAS 조회 실패:', error.message);
      throw new Error(`키워드별 AAS 조회 실패: ${error.response?.status} ${error.message}`);
    }
  },

  // 전체 Submodel 조회
  getAllSubmodels: async () => {
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

  // 전체 ConceptDescription 조회
  getAllConceptDescriptions: async (page = 1) => {
    try {
      console.log(`>> 전체 ConceptDescription 조회 시작 (page: ${page})`)
      const response = await apiClient.get('/concept/description', { params: { page } })
      return response.data
    } catch (error) {
      console.error('XX 전체 ConceptDescription 조회 실패:', error.message)
      throw new Error(`전체 ConceptDescription 조회 실패: ${error.response?.status} ${error.message}`)
    }
  },
  // AAS ID로 해당 AAS의 모든 서브모델 조회
  getSubmodelsByAASId: async (aasId) => {
    try {
      console.log(`>> AAS의 서브모델 조회 시작: ${aasId}`)
      
      // URL 인코딩 사용 (base64 대신)
      const encodedId = encodeURIComponent(aasId)
      console.log(`>> 인코딩된 ID: ${encodedId}`)
      
      // API 호출
      const response = await apiClient.get(`/aas/submodel/${encodedId}`)
      
      // 응답 처리
      let submodels = []
      if (response.data && response.data.message) {
        submodels = Array.isArray(response.data.message) 
          ? response.data.message 
          : [response.data.message]
      }
      
      return { message: submodels }
    } catch (error) {
      console.error('XX AAS 서브모델 조회 실패:', error)
      // 에러 발생 시에도 빈 배열 반환
      return { message: [] }
    }
  }
}



// 기존 검색 API (그대로 유지)
export const searchAPI = {
  // 동적 검색
  searchByFilter: async (filterType, value) => {
    const filterMap = {
      'numberofphases': 'numberofphases',
      'inputpowervoltage': 'inputpowervoltage',
      'ratedfrequency': 'ratedfrequency',
      'ratedoutputcurrent': 'ratedoutputcurrent',
      'inputcapacity': 'inputcapacity/kw',
      'dutycycle': 'dutycycle'
    }
    // inputcapacity/kw 같은 경우를 위해 직접 매핑하지 않고 그대로 사용
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

  // 전체 검색 (테스트용)
  searchAll: async () => {
    try {
      console.log('>> 전체 검색 시작')
      const response = await apiClient.get('/')
      return response.data
    } catch (error) {
      console.error('XX 전체 검색 실패:', error.message)
      throw new Error(`전체 검색 실패: ${error.response?.status} ${error.message}`)
    }
  },

  // 서버 상태 확인
  checkServerStatus: async () => {
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

export default apiClient