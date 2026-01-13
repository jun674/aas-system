/**
 * API 클라이언트 및 서비스 모듈
 *
 * 이 파일은 axios 인스턴스를 생성하고 설정합니다.
 * 실제 API 호출은 도메인별 서비스 모듈에서 처리합니다.
 */
import axios from 'axios'

// 프록시를 통한 API 베이스 URL
const BASE_URL = '/api'

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
    // 인증 토큰 추가
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

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

    // 401 에러 처리 (인증 실패)
    if (error.response?.status === 401) {
      // 토큰 제거 및 로그인 페이지로 리다이렉트
      localStorage.removeItem('authToken')
      // TODO: 로그인 페이지로 리다이렉트 또는 로그인 모달 표시
    }

    return Promise.reject(error)
  }
)

// 기본 export
export default apiClient

// 도메인별 서비스 re-export (편의를 위해)
export { authService } from './authService'
export { aasService } from './aasService'

