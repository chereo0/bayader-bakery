import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use standard ESM export to avoid the deprecated CJS Node API
export default defineConfig({
  plugins: [react()],
})
