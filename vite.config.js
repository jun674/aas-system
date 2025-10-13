import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  base: './',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/api': {
        // 로컬 개발 시: kyungnam_aas_server (포트 80)
        target: 'http://localhost:80',
        // 운영 서버 사용 시 아래 주석 해제
        // target: 'http://15.164.151.83',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('프록시 에러:', err);
          });

          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('프록시 요청:', req.method, req.url);
          });

          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('프록시 응답:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  }
})
