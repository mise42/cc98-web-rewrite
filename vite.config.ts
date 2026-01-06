import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // 路径别名
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@routes': path.resolve(__dirname, './src/routes'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@services': path.resolve(__dirname, './src/services'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@types': path.resolve(__dirname, './src/types'),
      '@config': path.resolve(__dirname, './src/config'),
    },
  },

  // 开发服务器配置
  server: {
    port: 5173,
    proxy: {
      // API 请求代理
      '/api': {
        target: 'https://qsh.api.cc98.top',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
      },
      // OpenID 请求代理
      '/openid': {
        target: 'https://qsh.openid.cc98.top',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/openid/, ''),
      },
      // SignalR WebSocket 代理
      '/hub': {
        target: 'https://qsh.api.cc98.top',
        changeOrigin: true,
        ws: true,
      },
    },
  },

  // 构建配置
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'antd-vendor': ['antd', '@ant-design/icons'],
          'query-vendor': ['@tanstack/react-query'],
          'signalr-vendor': ['@microsoft/signalr'],
          'editor-vendor': ['@cc98/hell-react-mde'],
        },
      },
    },
  },

  // 优化配置
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'antd', '@tanstack/react-query'],
  },
})
