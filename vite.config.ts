import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Cloudflare Pages 部署在根目录，使用 '/' 更稳定
  base: '/', 
  build: {
    outDir: 'dist',
  }
})