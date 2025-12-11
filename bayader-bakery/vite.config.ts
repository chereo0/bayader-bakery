import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use standard ESM export to avoid the deprecated CJS Node API
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to the backend server
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      // Proxy upload requests
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
